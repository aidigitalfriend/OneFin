import React, { useEffect, useRef, useState } from 'react';
import type { StripeCheckoutForm, StripeCheckoutFormSdkOptions } from '@stripe/stripe-js';
import { ArrowUpRight, CreditCard, Loader2 } from 'lucide-react';

const appearance: StripeCheckoutFormSdkOptions['appearance'] = {
  theme: 'stripe',
  labels: 'auto',
  inputs: 'spaced',
  variables: {
    borderRadius: '4px',
    colorBackground: '#ffffff',
    colorDanger: '#df1b41',
    colorPrimary: '#0570de',
    colorSuccess: '#00c853',
    colorText: '#30313d',
    fontFamily: 'default',
    fontSizeBase: '16px',
    spacingUnit: '4px',
  },
};

interface SubscriptionPrice {
  id: string;
  product_id: string;
  name: string;
  description: string | null;
  currency: string;
  unit_amount: number | null;
  unit_amount_decimal: string | null;
  billing_scheme: string;
  interval: 'day' | 'week' | 'month' | 'year';
  interval_count: number;
  usage_type: string;
  transform_quantity?: boolean;
}

const zeroDecimalCurrencies = new Set([
  'BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA',
  'PYG', 'RWF', 'VND', 'VUV', 'XAF', 'XOF', 'XPF',
]);

const isSubscriptionPrice = (value: unknown): value is SubscriptionPrice => {
  if (!value || typeof value !== 'object') return false;
  const price = value as Partial<SubscriptionPrice>;
  return typeof price.id === 'string' && /^price_[A-Za-z0-9]+$/.test(price.id) &&
    typeof price.name === 'string' && price.name.length > 0 &&
    typeof price.currency === 'string' && /^[a-zA-Z]{3}$/.test(price.currency) &&
    ['day', 'week', 'month', 'year'].includes(price.interval || '') &&
    Number.isInteger(price.interval_count) && price.interval_count! > 0;
};

const describePrice = (price: SubscriptionPrice): string => {
  const frequency = price.interval_count === 1
    ? `per ${price.interval}`
    : `every ${price.interval_count} ${price.interval}s`;
  const usage = price.usage_type === 'metered' ? ' · usage-based' : '';
  const detailsInCheckout = `See pricing in checkout${usage} · ${frequency}`;
  if (price.billing_scheme !== 'per_unit' || price.usage_type !== 'licensed' || price.transform_quantity) return detailsInCheckout;

  const minorAmount = price.unit_amount_decimal ?? (Number.isSafeInteger(price.unit_amount) ? String(price.unit_amount) : '');
  if (!/^\d+(?:\.0+)?$/.test(minorAmount)) return detailsInCheckout;
  const amount = Number(minorAmount);
  if (!Number.isSafeInteger(amount)) return detailsInCheckout;

  try {
    const currency = price.currency.toUpperCase();
    // Let Stripe quote currencies with a three-digit minor unit in the form.
    if (new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits === 3) {
      return detailsInCheckout;
    }
    // Match Stripe's API units, including MGA and the special ISK/UGX cases.
    // https://docs.stripe.com/currencies#special-cases
    const divisor = zeroDecimalCurrencies.has(currency) ? 1 : 100;
    const isWholeCurrency = divisor === 1 || currency === 'ISK' || currency === 'UGX';
    if (isWholeCurrency && amount % divisor !== 0) return detailsInCheckout;
    const fractionDigits = isWholeCurrency ? 0 : 2;
    const display = new Intl.NumberFormat('en', {
      style: 'currency',
      currency,
      currencyDisplay: 'code',
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(amount / divisor);
    return `${display} · ${frequency}`;
  } catch {
    return detailsInCheckout;
  }
};

interface CheckoutSectionProps {
  status?: 'returned' | 'canceled';
  showPreviewLink?: boolean;
  paymentLinksHref?: string;
}

export const CheckoutSection: React.FC<CheckoutSectionProps> = ({
  status,
  showPreviewLink = true,
  paymentLinksHref = '#checkout-links',
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [prices, setPrices] = useState<SubscriptionPrice[]>([]);
  const [selectedPriceId, setSelectedPriceId] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFormReady, setIsFormReady] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formContainer = useRef<HTMLDivElement>(null);
  const form = useRef<StripeCheckoutForm | null>(null);
  const mounted = useRef(false);
  const starting = useRef(false);
  const confirming = useRef(false);
  const submitted = useRef(false);
  const generation = useRef(0);
  const checkoutRequest = useRef<AbortController | null>(null);
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
  const hasPublishableKey = /^pk_(test|live)_[A-Za-z0-9]+$/.test(publishableKey);
  const checkoutReturn = status || new URLSearchParams(window.location.search).get('checkout');
  const selectedPrice = prices.find((price) => price.id === selectedPriceId);

  const destroyForm = () => {
    const currentForm = form.current;
    form.current = null;
    currentForm?.destroy();
  };

  useEffect(() => {
    mounted.current = true;
    const controller = new AbortController();

    const checkAvailability = async () => {
      try {
        const response = await fetch('/api/create-checkout-session', {
          signal: controller.signal,
          cache: 'no-store',
        });
        if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
          return;
        }
        const data = await response.json();
        if (!controller.signal.aborted) {
          const catalog = Array.isArray(data.prices) ? data.prices.filter(isSubscriptionPrice) : [];
          setPrices(catalog);
          setSelectedPriceId(catalog[0]?.id || '');
          setIsAvailable(hasPublishableKey && data.available === true && data.mode === 'subscription' && catalog.length > 0);
        }
      } catch {
        // Existing payment links remain available when checkout cannot be reached.
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    checkAvailability();
    return () => {
      mounted.current = false;
      generation.current += 1;
      controller.abort();
      checkoutRequest.current?.abort();
      destroyForm();
    };
  }, []);

  const openCheckout = async () => {
    if (isLoading || !isAvailable || !hasPublishableKey || !selectedPrice || starting.current || form.current || submitted.current) return;
    starting.current = true;
    const attempt = ++generation.current;
    const isCurrent = () => mounted.current && generation.current === attempt;
    const failStart = () => {
      if (!isCurrent()) return;
      generation.current += 1;
      destroyForm();
      starting.current = false;
      confirming.current = false;
      setIsStarting(false);
      setIsConfirming(false);
      setIsFormOpen(false);
      setIsFormReady(false);
      setError('Checkout could not be opened. Please try again or use an existing payment link below.');
    };

    setIsStarting(true);
    setIsFormOpen(true);
    setIsFormReady(false);
    setError(null);

    try {
      if (!window.Stripe || !formContainer.current) throw new Error('Checkout unavailable');
      const stripe = window.Stripe(publishableKey);
      if (typeof stripe.initCheckoutFormSdk !== 'function') throw new Error('Checkout unavailable');
      checkoutRequest.current = new AbortController();
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price_id: selectedPrice.id }),
        signal: checkoutRequest.current.signal,
      });
      if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
        throw new Error('Checkout unavailable');
      }
      const data = await response.json();
      if (!isCurrent()) return;
      if (typeof data.client_secret !== 'string' || !data.client_secret) throw new Error('Checkout unavailable');

      const checkout = stripe.initCheckoutFormSdk({ clientSecret: data.client_secret, appearance });
      const checkoutForm = checkout.createForm({ layout: 'expanded' });
      const actionsPromise = checkout.loadActions();
      form.current = checkoutForm;
      checkoutForm.on('ready', () => {
        if (isCurrent()) setIsFormReady(true);
      });
      checkoutForm.on('loaderror', failStart);
      checkoutForm.on('confirm', async (event) => {
        if (!isCurrent() || confirming.current || submitted.current) return;
        confirming.current = true;
        setIsConfirming(true);
        setError(null);
        try {
          const actionsResult = await actionsPromise;
          if (!isCurrent()) return;
          if (actionsResult.type !== 'success') throw new Error('Checkout unavailable');
          const result = await actionsResult.actions.confirm({
            formConfirmEvent: event,
            returnUrl: `${window.location.origin}/checkout/success`,
            redirect: 'if_required',
          });
          if (!isCurrent()) return;
          if (result.type === 'error') {
            setError('Your subscription could not be confirmed. Please review your details and try again.');
          } else {
            submitted.current = true;
            setIsSubmitted(true);
            destroyForm();
            setIsFormOpen(false);
          }
        } catch {
          if (isCurrent()) setError('Your subscription could not be confirmed. Please review your details and try again.');
        } finally {
          confirming.current = false;
          if (isCurrent()) setIsConfirming(false);
        }
      });
      checkoutForm.mount(formContainer.current!);

      const actionsResult = await actionsPromise;
      if (!isCurrent()) return;
      if (actionsResult.type !== 'success') throw new Error('Checkout unavailable');
      starting.current = false;
      setIsStarting(false);
    } catch {
      failStart();
    }
  };

  return (
    <section id="secure-checkout" aria-labelledby="secure-checkout-title" className="px-4 py-10 sm:px-6 lg:px-8 scroll-mt-24">
      <div className="max-w-7xl mx-auto rounded-2xl border border-sky-500/25 bg-slate-900/70 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-sky-400 mb-3">
              <CreditCard className="w-5 h-5" aria-hidden="true" />
              <h2 id="secure-checkout-title" className="font-display text-2xl font-bold text-white">Secure checkout</h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Review your subscription and enter your payment details here using Stripe's secure payment form.
            </p>
            <div className="mt-5 max-w-xl">
              <label htmlFor="subscription-price" className="block text-sm font-semibold text-white mb-2">
                Subscription
              </label>
              <select
                id="subscription-price"
                value={selectedPriceId}
                disabled={isLoading || prices.length === 0 || isStarting || isFormOpen || isConfirming || isSubmitted}
                aria-describedby={selectedPrice?.description ? 'subscription-description' : undefined}
                onChange={(event) => {
                  if (starting.current || form.current || confirming.current || submitted.current) return;
                  setSelectedPriceId(event.target.value);
                  setError(null);
                }}
                className="block w-full min-w-0 max-w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-slate-100 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
              >
                {prices.length === 0 && <option value="">{isLoading ? 'Loading subscriptions...' : 'No subscriptions available'}</option>}
                {prices.map((price) => <option key={price.id} value={price.id}>{price.name} — {describePrice(price)}</option>)}
              </select>
              {selectedPrice && <p className="mt-2 text-sm text-sky-300 break-words">{describePrice(selectedPrice)}</p>}
              {typeof selectedPrice?.description === 'string' && selectedPrice.description && (
                <p id="subscription-description" className="mt-2 text-sm text-slate-400 leading-relaxed break-words">{selectedPrice.description}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-start gap-3 shrink-0">
            <button
              type="button"
              onClick={openCheckout}
              disabled={isLoading || isStarting || isFormOpen || isSubmitted || !isAvailable || !selectedPrice}
              aria-busy={isStarting}
              aria-describedby="checkout-status"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-400"
            >
              {isStarting ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <ArrowUpRight className="w-4 h-4" aria-hidden="true" />}
              {isStarting ? 'Opening form...' : isSubmitted ? 'Submitted to Stripe' : isFormOpen ? 'Subscription form open' : 'Open subscription form'}
            </button>
            {showPreviewLink && (
              <a href="/checkout" className="text-sm font-medium text-sky-400 hover:text-sky-300 underline underline-offset-4">
                Preview subscription
              </a>
            )}
            <a href={paymentLinksHref} className="text-sm font-medium text-sky-400 hover:text-sky-300 underline underline-offset-4">
              Use an existing payment link
            </a>
          </div>
        </div>
        <div
          id="checkout-form"
          ref={formContainer}
          role="region"
          aria-label="Subscription payment form"
          aria-busy={isStarting || isConfirming}
          className={isFormOpen ? 'mt-6 max-w-3xl mx-auto rounded-xl bg-white p-4 sm:p-6' : 'hidden'}
        />
        <div id="checkout-status" role="status" className="mt-4 text-sm text-slate-400">
          {isLoading ? 'Checking checkout availability...' : !isAvailable ? 'Checkout is temporarily unavailable. Please use an existing payment link below.' : null}
          {isFormOpen && (isStarting || !isFormReady) && <p>Loading secure subscription form...</p>}
          {isConfirming && <p>Submitting your subscription to Stripe...</p>}
          {isSubmitted && <p>Submitted to Stripe. Check your Stripe receipt or billing portal for payment status.</p>}
          {checkoutReturn === 'returned' && (
            <p className="mt-2 text-slate-300">You are back from Stripe. Check your Stripe receipt or billing portal for payment status.</p>
          )}
          {checkoutReturn === 'canceled' && (
            <p className="mt-2 text-slate-300">Checkout was canceled. You can continue when you are ready.</p>
          )}
        </div>
        {error && <p role="alert" className="mt-3 text-sm text-rose-300">{error}</p>}
      </div>
    </section>
  );
};
