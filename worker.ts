import Stripe from 'stripe';

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  APP_URL?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_PRICE_ID?: string;
}

const json = (body: unknown, status = 200, headers = {}) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== '/api/create-checkout-session') {
      return env.ASSETS.fetch(request);
    }

    if (request.method !== 'GET' && request.method !== 'POST') {
      return json({ error: 'Method not allowed.' }, 405, { Allow: 'GET, POST' });
    }

    // Subscription mode is specified by the supplied Checkout Studio configuration.
    const mode = 'subscription';
    const price = env.STRIPE_PRICE_ID || 'price_...';
    let appUrl: URL | undefined;
    try {
      appUrl = new URL(env.APP_URL || 'https://onefinsolution.xyz');
    } catch {
      // Keep checkout unavailable when the return destination is misconfigured.
    }
    const available = Boolean(
      /^(sk|rk)_(test|live)_[A-Za-z0-9]+$/.test(env.STRIPE_SECRET_KEY || '') &&
      /^price_[A-Za-z0-9]+$/.test(price) &&
      appUrl && (appUrl.protocol === 'https:' ||
        (appUrl.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(appUrl.hostname)))
    );

    if (request.method === 'GET') return json({ available, mode });

    const origin = request.headers.get('Origin');
    if (origin && origin !== url.origin) {
      return json({ error: 'Please start checkout from this website.' }, 403);
    }
    if (!available || !appUrl) {
      return json({ error: 'Checkout is temporarily unavailable. Please use an existing payment link.' }, 503);
    }

    try {
      const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {
        httpClient: Stripe.createFetchHttpClient(),
      });
      const session = await stripe.checkout.sessions.create({
        ui_mode: 'hosted_page',
        mode,
        billing_address_collection: 'auto',
        phone_number_collection: { enabled: true },
        automatic_tax: { enabled: false },
        allow_promotion_codes: false,
        payment_method_collection: 'always',
        submit_type: 'auto',
        name_collection: { individual: { enabled: true, optional: true } },
        saved_payment_method_options: { payment_method_save: 'enabled' },
        integration_identifier: 'hosted_web_0001',
        origin_context: 'web',
        success_url: `${appUrl.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl.origin}/checkout/cancel`,
        line_items: [{ price, quantity: 1 }],
      });

      if (!session.url || new URL(session.url).protocol !== 'https:') {
        return json({ error: 'Checkout could not be opened. Please try again.' }, 502);
      }
      return json({ url: session.url });
    } catch {
      return json({ error: 'Checkout could not be opened. Please try again or use an existing payment link.' }, 502);
    }
  },
};
