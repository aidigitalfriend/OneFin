import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import worker from '../worker.ts';

// Every identifier and credential below is a fixture. All fetch calls are mocked;
// the real Stripe SDK is exercised without contacting Stripe or taking payments.
const siteOrigin = 'https://onefinsolution.xyz';
const endpoint = `${siteOrigin}/api/create-checkout-session`;
const selectedPriceId = 'price_FixtureLicensed123';
const checkoutUrl = 'https://checkout.stripe.com/c/pay/cs_test_fixture';
const clientSecret = 'cs_test_fixture_secret_FakeClientSecretOnly';
const privateMetadata = 'FixturePrivateMetadataNeverPublic';

function price(overrides = {}) {
  return {
    id: selectedPriceId,
    object: 'price',
    active: true,
    type: 'recurring',
    recurring: { interval: 'month', interval_count: 1, usage_type: 'licensed' },
    product: {
      id: 'prod_FixturePlan123', object: 'product', active: true,
      name: 'Fixture Plan', description: 'Fixture subscription description',
      metadata: { private: privateMetadata },
    },
    currency: 'usd',
    unit_amount: 1299,
    unit_amount_decimal: '1299',
    billing_scheme: 'per_unit',
    transform_quantity: null,
    nickname: 'FixtureInternalNickname',
    metadata: { private: privateMetadata },
    ...overrides,
  };
}

const catalogDto = {
  id: selectedPriceId,
  product_id: 'prod_FixturePlan123',
  name: 'Fixture Plan',
  description: 'Fixture subscription description',
  currency: 'usd',
  unit_amount: 1299,
  unit_amount_decimal: '1299',
  billing_scheme: 'per_unit',
  transform_quantity: false,
  interval: 'month',
  interval_count: 1,
  usage_type: 'licensed',
};

function listing(data, hasMore = false) {
  return Response.json({ object: 'list', url: '/v1/prices', data, has_more: hasMore });
}

function providerError(code = 'fixture_provider_error') {
  return Response.json({ error: {
    type: 'invalid_request_error', code,
    message: `Fixture provider diagnostic ${privateMetadata} ${clientSecret}`,
  } }, { status: 400 });
}

function setup(t, { env: overrides = {}, onList, onRetrieve, onSession } = {}) {
  const calls = [];
  const assets = [];
  const logs = [];
  for (const method of ['log', 'info', 'warn', 'error', 'debug']) {
    t.mock.method(console, method, (...args) => logs.push(args));
  }
  t.mock.method(globalThis, 'fetch', async (rawUrl, init) => {
    const url = new URL(String(rawUrl));
    const call = { url, init };
    calls.push(call);
    assert.equal(url.origin, 'https://api.stripe.com');
    if (url.pathname === '/v1/prices' && init.method === 'GET') {
      return onList ? onList(call) : listing([price()]);
    }
    if (url.pathname.startsWith('/v1/prices/') && init.method === 'GET') {
      return onRetrieve ? onRetrieve(call) : Response.json(price({ id: url.pathname.split('/').at(-1) }));
    }
    if (url.pathname === '/v1/checkout/sessions' && init.method === 'POST') {
      return onSession ? onSession(call) : Response.json({
        id: 'cs_test_fixture', object: 'checkout.session', client_secret: clientSecret,
      });
    }
    assert.fail(`Unexpected mocked request: ${init.method} ${url.pathname}`);
  });
  const assetResponse = new Response('existing website');
  const env = {
    APP_URL: siteOrigin,
    STRIPE_SECRET_KEY: 'sk_test_FixtureNeverARealCredential123',
    ASSETS: { async fetch(request) { assets.push(request); return assetResponse; } },
    ...overrides,
  };
  t.after(() => {
    const output = JSON.stringify(logs);
    for (const secret of [clientSecret, privateMetadata, env.STRIPE_SECRET_KEY].filter(Boolean)) {
      assert.ok(!output.includes(secret), 'fixture secrets and provider details must never be logged');
    }
  });
  return {
    calls, assets, assetResponse, env,
    request(method = 'POST', options = {}) {
      return worker.fetch(new Request(endpoint, {
        method,
        ...(method === 'POST' ? {
          headers: { Origin: siteOrigin, 'Content-Type': 'application/json' },
          body: JSON.stringify({ price_id: selectedPriceId }),
        } : {}),
        ...options,
      }), env);
    },
  };
}

const ineligiblePrices = [
  ['archived price', () => price({ active: false })],
  ['one-time price', () => price({ type: 'one_time' })],
  ['missing recurring configuration', () => price({ recurring: null })],
  ['unexpanded product', () => price({ product: 'prod_FixturePlan123' })],
  ['missing product', () => price({ product: null })],
  ['deleted product', () => price({ product: { id: 'prod_FixtureDeleted', deleted: true } })],
  ['archived product', () => price({ product: { ...price().product, active: false } })],
];

describe('checkout Worker catalog and embedded form (no network)', { concurrency: false }, () => {
  test('GET reads Stripe subscriptions and exposes only the public catalog DTO', async (t) => {
    const harness = setup(t);
    const response = await harness.request('GET');
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    const text = await response.text();
    assert.deepEqual(JSON.parse(text), { available: true, mode: 'subscription', prices: [catalogDto] });
    for (const secret of [clientSecret, privateMetadata, harness.env.STRIPE_SECRET_KEY, 'FixtureInternalNickname']) {
      assert.ok(!text.includes(secret));
    }
    assert.equal(harness.calls.length, 1);
    assert.equal(harness.calls[0].init.method, 'GET');
    assert.equal(harness.calls[0].url.pathname, '/v1/prices');
    assert.deepEqual(Object.fromEntries(harness.calls[0].url.searchParams), {
      active: 'true', type: 'recurring', limit: '100', 'expand[0]': 'data.product',
    });
  });

  test('GET paginates beyond 100 prices using the last unfiltered Stripe item as its cursor', async (t) => {
    const firstPage = Array.from({ length: 100 }, (_, index) => price({
      id: `price_PageOne${index}`, active: index !== 99,
    }));
    const secondPage = [price({ id: 'price_PageTwo0' }), price({ id: 'price_PageTwo1' })];
    let page = 0;
    const harness = setup(t, { onList: ({ url }) => {
      if (page++ === 0) {
        assert.equal(url.searchParams.has('starting_after'), false);
        return listing(firstPage, true);
      }
      assert.equal(url.searchParams.get('starting_after'), firstPage[99].id);
      assert.equal(url.searchParams.get('expand[0]'), 'data.product');
      return listing(secondPage);
    } });
    const response = await harness.request('GET');
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.prices.length, 101);
    assert.ok(body.prices.some(({ id }) => id === 'price_PageTwo1'));
    assert.ok(!body.prices.some(({ id }) => id === firstPage[99].id));
    assert.equal(harness.calls.length, 2);
    assert.ok(harness.calls.every(({ init }) => init.method === 'GET'));
  });

  test('GET filters inactive or unusable subscriptions and sorts names then price IDs', async (t) => {
    const harness = setup(t, { onList: () => listing([
      ...ineligiblePrices.map(([, fixture]) => fixture()),
      price({ id: 'price_Zeta', product: { ...price().product, name: 'Zeta' } }),
      price({ id: 'price_AlphaB', product: { ...price().product, name: 'Alpha' } }),
      price({ id: 'price_AlphaA', product: { ...price().product, name: 'Alpha' } }),
    ]) });
    const body = await (await harness.request('GET')).json();
    assert.equal(body.available, true);
    assert.deepEqual(body.prices.map(({ id }) => id), ['price_AlphaA', 'price_AlphaB', 'price_Zeta']);
  });

  test('GET preserves metered, tiered, decimal, and transformed pricing information', async (t) => {
    const harness = setup(t, { onList: () => listing([price({
      unit_amount: null, unit_amount_decimal: '0.125', billing_scheme: 'tiered',
      transform_quantity: { divide_by: 100, round: 'up' },
      recurring: { interval: 'year', interval_count: 2, usage_type: 'metered' },
    })]) });
    const body = await (await harness.request('GET')).json();
    assert.deepEqual(body.prices, [{
      ...catalogDto, unit_amount: null, unit_amount_decimal: '0.125', billing_scheme: 'tiered',
      transform_quantity: true, interval: 'year', interval_count: 2, usage_type: 'metered',
    }]);
  });

  test('GET returns unavailable for an empty eligible catalog without creating Stripe objects', async (t) => {
    const harness = setup(t, { onList: () => listing(ineligiblePrices.map(([, fixture]) => fixture())) });
    assert.deepEqual(await (await harness.request('GET')).json(), {
      available: false, mode: 'subscription', prices: [],
    });
    assert.ok(harness.calls.every(({ init }) => init.method === 'GET'));
  });

  test('GET catalog failures return a safe unavailable response', async (t) => {
    const harness = setup(t, { onList: () => providerError() });
    const response = await harness.request('GET');
    assert.equal(response.status, 502);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.deepEqual(await response.json(), {
      available: false, mode: 'subscription', prices: [], error: 'The subscription catalog is temporarily unavailable.',
    });
    assert.equal(harness.calls.length, 1);
  });

  for (const [name, env] of [
    ['missing secret', { STRIPE_SECRET_KEY: undefined }],
    ['publishable key', { STRIPE_SECRET_KEY: 'pk_test_FixtureOnly123' }],
    ['invalid application URL', { APP_URL: 'not a URL' }],
    ['insecure public application URL', { APP_URL: 'http://onefinsolution.xyz' }],
  ]) {
    test(`${name} makes GET unavailable and POST return 503 without provider calls`, async (t) => {
      const harness = setup(t, { env });
      const readiness = await harness.request('GET');
      assert.equal(readiness.status, 200);
      assert.deepEqual(await readiness.json(), { available: false, mode: 'subscription', prices: [] });
      const response = await harness.request();
      assert.equal(response.status, 503);
      assert.match((await response.json()).error, /temporarily unavailable/);
      assert.equal(harness.calls.length, 0);
    });
  }

  test('POST retrieves the selected price and creates exactly the intended embedded subscription', async (t) => {
    const harness = setup(t, { env: { STRIPE_CHECKOUT_MODE: 'payment', APP_URL: undefined } });
    const response = await harness.request('POST', {
      headers: { Origin: siteOrigin, 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        price_id: selectedPriceId, amount: 1, unit_amount: 1, quantity: 999, mode: 'payment',
        line_items: [{ price: 'price_CallerCannotOverride', quantity: 999 }],
      }),
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.match(response.headers.get('Content-Type'), /^application\/json/);
    assert.equal(response.headers.get('Location'), null);
    assert.deepEqual(await response.json(), { client_secret: clientSecret });
    assert.equal(harness.calls.length, 2);
    const [retrieval, session] = harness.calls;
    assert.equal(retrieval.init.method, 'GET');
    assert.equal(retrieval.url.pathname, `/v1/prices/${selectedPriceId}`);
    assert.deepEqual(Object.fromEntries(retrieval.url.searchParams), { 'expand[0]': 'product' });
    assert.equal(session.init.method, 'POST');
    assert.equal(session.url.pathname, '/v1/checkout/sessions');
    assert.equal(new Headers(session.init.headers).get('Authorization'), `Bearer ${harness.env.STRIPE_SECRET_KEY}`);
    assert.match(new Headers(session.init.headers).get('Content-Type'), /^application\/x-www-form-urlencoded/);
    assert.deepEqual(Object.fromEntries(new URLSearchParams(session.init.body)), {
      ui_mode: 'form', mode: 'subscription', billing_address_collection: 'auto',
      'phone_number_collection[enabled]': 'false', 'automatic_tax[enabled]': 'false',
      payment_method_collection: 'always', submit_type: 'auto',
      'name_collection[individual][enabled]': 'true', 'name_collection[individual][optional]': 'true',
      integration_identifier: 'custom_embedded_web_0001',
      'line_items[0][price]': selectedPriceId, 'line_items[0][quantity]': '1',
    });
  });

  test('POST omits quantity for a freshly retrieved metered subscription', async (t) => {
    const harness = setup(t, { onRetrieve: () => Response.json(price({
      recurring: { interval: 'month', interval_count: 1, usage_type: 'metered' },
    })) });
    assert.equal((await harness.request()).status, 200);
    const params = new URLSearchParams(harness.calls[1].init.body);
    assert.equal(params.get('line_items[0][price]'), selectedPriceId);
    assert.equal(params.has('line_items[0][quantity]'), false);
  });

  test('POST validates a fresh price even after an earlier catalog listed it as active', async (t) => {
    let currentlyActive = true;
    const harness = setup(t, { onRetrieve: () => Response.json(price({ active: currentlyActive })) });
    assert.equal((await (await harness.request('GET')).json()).available, true);
    currentlyActive = false;
    const response = await harness.request();
    assert.equal(response.status, 400);
    assert.match((await response.json()).error, /no longer available/);
    assert.deepEqual(harness.calls.map(({ url, init }) => `${init.method} ${url.pathname}`), [
      'GET /v1/prices', `GET /v1/prices/${selectedPriceId}`,
    ]);
  });

  for (const [name, fixture] of ineligiblePrices) {
    test(`POST rejects ${name} without creating a session`, async (t) => {
      const harness = setup(t, { onRetrieve: () => Response.json(fixture()) });
      const response = await harness.request();
      assert.equal(response.status, 400);
      assert.match((await response.json()).error, /no longer available/);
      assert.equal(harness.calls.length, 1);
      assert.equal(harness.calls[0].init.method, 'GET');
    });
  }

  test('POST treats a Stripe resource_missing error as a stale selection', async (t) => {
    const harness = setup(t, { onRetrieve: () => providerError('resource_missing') });
    const response = await harness.request();
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), {
      error: 'This subscription is no longer available. Please refresh the catalog.',
    });
    assert.equal(harness.calls.length, 1);
  });

  for (const failureAt of ['retrieve', 'session']) {
    test(`POST sanitizes a Stripe ${failureAt} error`, async (t) => {
      const harness = setup(t, failureAt === 'retrieve'
        ? { onRetrieve: () => providerError() }
        : { onSession: () => providerError() });
      const response = await harness.request();
      assert.equal(response.status, 502);
      assert.deepEqual(await response.json(), {
        error: 'Checkout could not be opened. Please try again or use an existing payment link.',
      });
      assert.equal(harness.calls.length, failureAt === 'retrieve' ? 1 : 2);
    });
  }

  for (const [name, options, status] of [
    ['missing Content-Type', { headers: {} }, 415],
    ['form content', { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }, 415],
    ['invalid JSON', { body: '{invalid' }, 400],
    ['null body', { body: 'null' }, 400],
    ['missing price', { body: '{}' }, 400],
    ['non-string price', { body: JSON.stringify({ price_id: 42 }) }, 400],
    ['sample price', { body: JSON.stringify({ price_id: 'price_...' }) }, 400],
    ['path injection', { body: JSON.stringify({ price_id: 'price_Fixture/other' }) }, 400],
  ]) {
    test(`POST rejects ${name} before contacting Stripe`, async (t) => {
      const harness = setup(t);
      assert.equal((await harness.request('POST', options)).status, status);
      assert.equal(harness.calls.length, 0);
    });
  }

  test('cross-origin browser POSTs are rejected before contacting Stripe', async (t) => {
    const harness = setup(t);
    const response = await harness.request('POST', { headers: {
      Origin: 'https://another-site.example', 'Content-Type': 'application/json',
    } });
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

  for (const returnedSecret of [undefined, null, '', 42, true, {}]) {
    test(`rejects unusable client secret ${JSON.stringify(returnedSecret)} despite a hosted URL`, async (t) => {
      const harness = setup(t, { onSession: () => Response.json({
        id: 'cs_test_fixture', object: 'checkout.session', client_secret: returnedSecret, url: checkoutUrl,
      }) });
      const response = await harness.request();
      assert.equal(response.status, 502);
      assert.equal(response.headers.get('Cache-Control'), 'no-store');
      assert.equal(response.headers.get('Location'), null);
      const body = await response.json();
      assert.match(body.error, /^Checkout could not be opened/);
      assert.ok(!('url' in body));
      assert.ok(!('client_secret' in body));
      assert.equal(harness.calls.length, 2);
    });
  }

  test('returns only the form client secret and never falls back to a session URL', async (t) => {
    const harness = setup(t, { onSession: () => Response.json({
      id: 'cs_test_fixture', object: 'checkout.session', client_secret: clientSecret,
      url: 'http://obsolete-hosted-url.example',
    }) });
    const response = await harness.request();
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.equal(response.headers.get('Location'), null);
    assert.deepEqual(await response.json(), { client_secret: clientSecret });
    assert.equal(harness.calls.length, 2);
  });
});
