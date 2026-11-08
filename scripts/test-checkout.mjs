import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import worker from '../worker.ts';

// All credentials, prices, and sessions below are fixtures. Every fetch is mocked;
// these tests exercise the real Stripe SDK without contacting Stripe.
const siteOrigin = 'https://onefinsolution.xyz';
const endpoint = `${siteOrigin}/api/create-checkout-session`;
const checkoutUrl = 'https://checkout.stripe.com/c/pay/cs_test_fixture';

function setup(t, overrides = {}, stripeResponse) {
  const calls = [];
  const assets = [];
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    calls.push({ url: String(url), init });
    assert.equal(String(url), 'https://api.stripe.com/v1/checkout/sessions');
    return stripeResponse
      ? stripeResponse()
      : Response.json({ id: 'cs_test_fixture', object: 'checkout.session', url: checkoutUrl });
  });
  const assetResponse = new Response('existing website');
  const env = {
    APP_URL: siteOrigin,
    STRIPE_SECRET_KEY: 'sk_test_FixtureNeverARealCredential123',
    STRIPE_PRICE_ID: 'price_FixtureConfigured123',
    ASSETS: {
      async fetch(request) {
        assets.push(request);
        return assetResponse;
      },
    },
    ...overrides,
  };
  return {
    calls,
    assets,
    assetResponse,
    env,
    request(method = 'POST', options = {}) {
      return worker.fetch(new Request(endpoint, { method, ...options }), env);
    },
  };
}

describe('checkout Worker (no network)', { concurrency: false }, () => {
  for (const legacyMode of [undefined, 'payment']) {
    test(`creates the specified subscription session with legacy mode ${JSON.stringify(legacyMode)}`, async (t) => {
      const harness = setup(t, { STRIPE_CHECKOUT_MODE: legacyMode });
      const response = await harness.request('POST', {
        headers: { Origin: siteOrigin, 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: 'price_CallerCannotOverride', quantity: 999, mode: 'payment' }),
      });
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('Cache-Control'), 'no-store');
      assert.deepEqual(await response.json(), { url: checkoutUrl });
      assert.equal(harness.calls.length, 1);
      const [{ init }] = harness.calls;
      assert.equal(init.method, 'POST');
      assert.equal(new Headers(init.headers).get('Authorization'), `Bearer ${harness.env.STRIPE_SECRET_KEY}`);
      assert.match(new Headers(init.headers).get('Content-Type'), /^application\/x-www-form-urlencoded/);
      assert.deepEqual(Object.fromEntries(new URLSearchParams(init.body)), {
        ui_mode: 'hosted_page',
        mode: 'subscription',
        billing_address_collection: 'auto',
        'phone_number_collection[enabled]': 'true',
        'automatic_tax[enabled]': 'false',
        allow_promotion_codes: 'false',
        payment_method_collection: 'always',
        submit_type: 'auto',
        'name_collection[individual][enabled]': 'true',
        'name_collection[individual][optional]': 'true',
        'saved_payment_method_options[payment_method_save]': 'enabled',
        integration_identifier: 'hosted_web_0001',
        origin_context: 'web',
        success_url: `${siteOrigin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteOrigin}/checkout/cancel`,
        'line_items[0][price]': harness.env.STRIPE_PRICE_ID,
        'line_items[0][quantity]': '1',
      });
    });
  }

  test('GET exposes only readiness and mode and never sends a Stripe request', async (t) => {
    const harness = setup(t);
    const response = await harness.request('GET');
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    const body = await response.text();
    assert.deepEqual(JSON.parse(body), { available: true, mode: 'subscription' });
    assert.ok(!body.includes(harness.env.STRIPE_SECRET_KEY));
    assert.ok(!body.includes(harness.env.STRIPE_PRICE_ID));
    assert.equal(harness.calls.length, 0);
  });

  for (const [name, overrides] of [
    ['missing price uses the unavailable sample default', { STRIPE_PRICE_ID: undefined }],
    ['sample price is unavailable', { STRIPE_PRICE_ID: 'price_...' }],
    ['invalid price is unavailable', { STRIPE_PRICE_ID: 'caller-controlled-price' }],
    ['missing secret is unavailable', { STRIPE_SECRET_KEY: undefined }],
    ['publishable key is unavailable', { STRIPE_SECRET_KEY: 'pk_test_FixtureOnly123' }],
    ['invalid application URL is unavailable', { APP_URL: 'not a URL' }],
    ['insecure public application URL is unavailable', { APP_URL: 'http://onefinsolution.xyz' }],
  ]) {
    test(`${name} (GET readiness and POST 503)`, async (t) => {
      const harness = setup(t, overrides);
      const readiness = await harness.request('GET');
      assert.equal(readiness.status, 200);
      assert.equal((await readiness.json()).available, false);
      const response = await harness.request();
      assert.equal(response.status, 503);
      assert.equal(response.headers.get('Cache-Control'), 'no-store');
      assert.match((await response.json()).error, /temporarily unavailable/);
      assert.equal(harness.calls.length, 0);
    });
  }

  test('missing application URL uses the deployed default and subscription mode', async (t) => {
    const harness = setup(t, { APP_URL: undefined });
    assert.deepEqual(await (await harness.request('GET')).json(), { available: true, mode: 'subscription' });
    assert.equal((await harness.request()).status, 200);
    const params = new URLSearchParams(harness.calls[0].init.body);
    assert.equal(params.get('mode'), 'subscription');
    assert.equal(new URL(params.get('success_url')).origin, siteOrigin);
  });

  test('cross-origin browser POSTs are rejected before contacting Stripe', async (t) => {
    const harness = setup(t);
    const response = await harness.request('POST', { headers: { Origin: 'https://another-site.example' } });
    assert.equal(response.status, 403);
    assert.match((await response.json()).error, /this website/);
    assert.equal(harness.calls.length, 0);
  });

  for (const method of ['PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']) {
    test(`${method} returns 405 with allowed methods`, async (t) => {
      const harness = setup(t);
      const response = await harness.request(method);
      assert.equal(response.status, 405);
      assert.equal(response.headers.get('Allow'), 'GET, POST');
      assert.equal(harness.calls.length, 0);
    });
  }

  test('existing website paths are delegated to the static asset binding', async (t) => {
    const harness = setup(t);
    const request = new Request(`${siteOrigin}/existing-page?source=test`);
    assert.equal(await worker.fetch(request, harness.env), harness.assetResponse);
    assert.deepEqual(harness.assets, [request]);
    assert.equal(harness.calls.length, 0);
  });

  test('Stripe errors are sanitized without exposing credentials or provider details', async (t) => {
    const privateDetails = 'Provider diagnostic with sk_test_FixtureNeverARealCredential123';
    const harness = setup(t, {}, () => Response.json({
      error: { type: 'invalid_request_error', message: privateDetails, param: 'line_items' },
    }, { status: 400 }));
    const response = await harness.request();
    assert.equal(response.status, 502);
    const text = await response.text();
    assert.deepEqual(JSON.parse(text), {
      error: 'Checkout could not be opened. Please try again or use an existing payment link.',
    });
    assert.ok(!text.includes(privateDetails));
    assert.ok(!text.includes(harness.env.STRIPE_SECRET_KEY));
    assert.equal(harness.calls.length, 1);
  });

  for (const returnedUrl of [null, 'http://checkout.stripe.com/insecure', 'javascript:alert(1)', 'not a URL']) {
    test(`rejects unusable session URL ${JSON.stringify(returnedUrl)}`, async (t) => {
      const harness = setup(t, {}, () => Response.json({
        id: 'cs_test_fixture', object: 'checkout.session', url: returnedUrl,
      }));
      const response = await harness.request();
      assert.equal(response.status, 502);
      const body = await response.json();
      assert.match(body.error, /^Checkout could not be opened/);
      assert.ok(!('url' in body));
      assert.equal(harness.calls.length, 1);
    });
  }
});
