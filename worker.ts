import Stripe from 'stripe';

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  APP_URL?: string;
  STRIPE_SECRET_KEY?: string;
}

const json = (body: unknown, status = 200, headers = {}) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } });

const catalogProduct = (price: Stripe.Price): Stripe.Product | null => {
  const product = price.product;
  if (!price.active || price.type !== 'recurring' || !price.recurring ||
      typeof product !== 'object' || !product || ('deleted' in product && product.deleted) ||
      !('active' in product) || !product.active) return null;
  return product;
};

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
    let appUrl: URL | undefined;
    try {
      appUrl = new URL(env.APP_URL || 'https://onefinsolution.xyz');
    } catch {
      // Keep checkout unavailable when the return destination is misconfigured.
    }
    const available = Boolean(
      /^(sk|rk)_(test|live)_[A-Za-z0-9]+$/.test(env.STRIPE_SECRET_KEY || '') &&
      appUrl && (appUrl.protocol === 'https:' ||
        (appUrl.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(appUrl.hostname)))
    );

    const origin = request.headers.get('Origin');
    if (request.method === 'POST' && origin && origin !== url.origin) {
      return json({ error: 'Please start checkout from this website.' }, 403);
    }
    if (!available || !appUrl) {
      if (request.method === 'GET') return json({ available: false, mode, prices: [] });
      return json({ error: 'Checkout is temporarily unavailable. Please use an existing payment link.' }, 503);
    }

    try {
      const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {
        httpClient: Stripe.createFetchHttpClient(),
      });

      if (request.method === 'GET') {
        const prices = [];
        // Auto-pagination includes products added later without a manual sync or Price ID.
        for await (const price of stripe.prices.list({
          active: true,
          type: 'recurring',
          limit: 100,
          expand: ['data.product'],
        })) {
          const product = catalogProduct(price);
          if (!product) continue;
          prices.push({
            id: price.id,
            product_id: product.id,
            name: product.name,
            description: product.description,
            currency: price.currency,
            unit_amount: price.unit_amount,
            unit_amount_decimal: price.unit_amount_decimal,
            billing_scheme: price.billing_scheme,
            transform_quantity: Boolean(price.transform_quantity),
            interval: price.recurring!.interval,
            interval_count: price.recurring!.interval_count,
            usage_type: price.recurring!.usage_type,
          });
        }
        prices.sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
        return json({ available: prices.length > 0, mode, prices });
      }

      if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
        return json({ error: 'Choose a subscription from the catalog.' }, 415);
      }
      let body: { price_id?: unknown } | null;
      try {
        body = await request.json();
      } catch {
        return json({ error: 'Choose a subscription from the catalog.' }, 400);
      }
      if (!body || typeof body.price_id !== 'string' || !/^price_[A-Za-z0-9]+$/.test(body.price_id)) {
        return json({ error: 'Choose a subscription from the catalog.' }, 400);
      }

      // Never accept an amount from the browser; verify every selection against Stripe.
      const price = await stripe.prices.retrieve(body.price_id, { expand: ['product'] });
      if (!catalogProduct(price)) {
        return json({ error: 'This subscription is no longer available. Please refresh the catalog.' }, 400);
      }
      const session = await stripe.checkout.sessions.create({
        ui_mode: 'form',
        mode,
        billing_address_collection: 'auto',
        phone_number_collection: { enabled: false },
        automatic_tax: { enabled: false },
        payment_method_collection: 'always',
        submit_type: 'auto',
        name_collection: { individual: { enabled: true, optional: true } },
        integration_identifier: 'custom_embedded_web_0001',
        line_items: [{ price: price.id, ...(price.recurring!.usage_type === 'metered' ? {} : { quantity: 1 }) }],
      });

      if (typeof session.client_secret !== 'string' || !session.client_secret) {
        return json({ error: 'Checkout could not be opened. Please try again.' }, 502);
      }
      return json({ client_secret: session.client_secret });
    } catch (error) {
      if (request.method === 'GET') {
        return json({ available: false, mode, prices: [], error: 'The subscription catalog is temporarily unavailable.' }, 502);
      }
      if (error instanceof Stripe.errors.StripeInvalidRequestError && error.code === 'resource_missing') {
        return json({ error: 'This subscription is no longer available. Please refresh the catalog.' }, 400);
      }
      return json({ error: 'Checkout could not be opened. Please try again or use an existing payment link.' }, 502);
    }
  },
};
