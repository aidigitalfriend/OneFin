import React, { useEffect, useState } from 'react';
import { ArrowUpRight, CreditCard, Loader2 } from 'lucide-react';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const checkoutReturn = status || new URLSearchParams(window.location.search).get('checkout');

  useEffect(() => {
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
          setIsAvailable(data.available === true && data.mode === 'subscription');
        }
      } catch {
        // Existing payment links remain available when checkout cannot be reached.
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    checkAvailability();
    return () => controller.abort();
  }, []);

  const openCheckout = async () => {
    if (isLoading || isSubmitting || !isAvailable) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/create-checkout-session', { method: 'POST' });
      if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
        throw new Error('Checkout unavailable');
      }
      const data = await response.json();
      const checkoutUrl = new URL(data.url);
      // Stripe can return its own checkout domain or the account's custom payment domain.
      if (checkoutUrl.protocol !== 'https:') {
        throw new Error('Invalid checkout destination');
      }
      window.location.assign(checkoutUrl.href);
    } catch {
      setError('Checkout could not be opened. Please try again or use an existing payment link below.');
      setIsSubmitting(false);
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
              Continue to Stripe to review your subscription and enter your payment details securely. You will return to OneFin Solution after checkout.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 shrink-0">
            <button
              type="button"
              onClick={openCheckout}
              disabled={isLoading || isSubmitting || !isAvailable}
              aria-busy={isSubmitting}
              aria-describedby="checkout-status"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-400"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <ArrowUpRight className="w-4 h-4" aria-hidden="true" />}
              {isSubmitting ? 'Opening checkout...' : 'Continue to subscription checkout'}
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
        <div id="checkout-status" role="status" className="mt-4 text-sm text-slate-400">
          {isLoading ? 'Checking checkout availability...' : !isAvailable ? 'Checkout is temporarily unavailable. Please use an existing payment link below.' : null}
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
