# Stripe Checkout integration

This is the single source of truth for remaining checkout setup. Scenario B applies: the repository had payment links, but no Checkout Session API call.

## Values to Replace

**Files containing sample defaults:**

- [.env.example](.env.example)
- [worker.ts](worker.ts)

| Field | Current value | What to set |
| --- | --- | --- |
| `STRIPE_PRICE_ID` / `line_items[0].price` | `price_...` | The actual recurring Stripe Price ID for the intended subscription, from the same Stripe account and test/live mode as the key. Quantity is fixed at 1 on the server. |
| `STRIPE_SECRET_KEY` | `sk_test_...` | A server-only test/sandbox key first, then the matching live key. A restricted `rk_` key permitted to create Checkout Sessions is also accepted. Store this as a Cloudflare Worker secret, never in Git or a `VITE_` variable. |

Return URLs already use this repository's actual domain; confirm that these destinations are appropriate for the selected product:

| Field | Configured value |
| --- | --- |
| `APP_URL` | `https://onefinsolution.xyz` |
| `success_url` | `https://onefinsolution.xyz/checkout/success?session_id={CHECKOUT_SESSION_ID}` |
| `cancel_url` | `https://onefinsolution.xyz/checkout/cancel` |

Keep the literal `{CHECKOUT_SESSION_ID}` template. Returning to the site does **not** verify payment; the new section displays a neutral return message.

## Configured Parameters

**File containing the Checkout Studio parameters:** [worker.ts](worker.ts)

| Parameter | Value |
| --- | --- |
| `ui_mode` | `hosted_page` (installed Stripe SDK 23.1.0, above the supplied 21.0.0 threshold) |
| `mode` | `subscription`, explicitly selected in the user's follow-up code |
| `billing_address_collection` | `auto` |
| `phone_number_collection.enabled` | `true` |
| `automatic_tax.enabled` | `false` |
| `allow_promotion_codes` | `false` |
| `payment_method_collection` | `always` (this flow is in `subscription` mode) |
| `submit_type` | `auto` |
| `name_collection.individual.enabled` | `true` |
| `name_collection.individual.optional` | `true` |
| `saved_payment_method_options.payment_method_save` | `enabled` |
| `integration_identifier` | `hosted_web_0001` |
| `origin_context` | `web` |

No explicit Stripe API version is supplied to the client. Payment methods use the Stripe account's dynamic configuration.

## Setup and next steps

1. Confirm the intended Stripe account, recurring product/Price, amount, currency, and billing interval. Subscription mode is already configured from the supplied code. No product or price was created or changed by this integration.
2. On the existing Cloudflare **Worker `onefin`**, add secret `STRIPE_SECRET_KEY` and variable `STRIPE_PRICE_ID` in its runtime Variables and Secrets settings. `APP_URL` is already configured in [wrangler.jsonc](wrangler.jsonc). Deployment preserves dashboard variables with `keep_vars: true`.
3. Deploy the repository using the existing **Cloudflare Workers Builds** Git integration, with `npm run build` followed by `npx wrangler deploy`. The Wrangler configuration now includes the server entry and the `dist` assets. Keep the existing custom domain attached to the same Worker.
4. Verify `GET https://onefinsolution.xyz/api/create-checkout-session` returns JSON, not the SPA HTML. It returns `available: false` until the key, Price, and return origin pass configuration checks. `available: true` means configured; it does not verify key permissions, Price validity, or a completed payment.
5. Complete a test/sandbox checkout and verify its Session and payment in the **matching Stripe Dashboard account**. Test cancellation and payment failure as well. Then configure the corresponding live key and live Price and verify the deployed flow again.

Do not rely on the existing `.github/workflows/deploy.yml` for the server: that workflow targets static GitHub Pages. The verified current successful deployment check is **Workers Builds: onefin**. Cloudflare DNS alone cannot execute a Pages Functions folder. The old `functions/api/visitor-info.ts` remains a Pages-only implementation; this checkout change does not route it through the Worker.

### Local development and verification

Dependencies include `stripe` and development dependency `wrangler`; use Node.js 24 for the included endpoint tests.

Copy [.env.example](.env.example) to ignored `.dev.vars` for Wrangler and replace the samples with matching test/sandbox values. Use `APP_URL=http://localhost:8787` locally. A `.env` file is not a substitute for production Worker secrets.

```sh
npm ci
npm run lint
npm run build
node --test scripts/test-checkout.mjs
npx wrangler deploy --dry-run
npx wrangler dev
```

Open Wrangler's local URL (normally `http://localhost:8787`). Plain `npm run dev` serves Vite's frontend and does not run this checkout API; the section correctly remains unavailable there. No publishable key or Stripe.js is needed for a hosted redirect.

### Flow and files

- [src/components/CheckoutSection.tsx](src/components/CheckoutSection.tsx): new block mounted after the hero in [src/App.tsx](src/App.tsx); checks availability, starts checkout, and links to the subscription preview.
- [src/components/CheckoutPreviewPage.tsx](src/components/CheckoutPreviewPage.tsx): `/checkout` preview, `/checkout/success` neutral return page, and `/checkout/cancel` cancellation page. The preview uses OneFin's branding and support email; no sample book, invented price, or placeholder email is displayed. [vite.config.ts](vite.config.ts) uses root-relative asset paths so nested return pages load correctly.
- [worker.ts](worker.ts): `GET /api/create-checkout-session` reports configuration availability; `POST` creates a Session with a server-owned Price and mode, and returns its hosted URL. Other paths go to the static asset binding. No request-supplied pricing is accepted.
- [wrangler.jsonc](wrangler.jsonc): deploys to the existing Worker name `onefin`; routes the checkout API before SPA asset handling.
- [scripts/test-checkout.mjs](scripts/test-checkout.mjs): endpoint tests with mocked Stripe transport; no real payments or Stripe API calls.

The existing five Stripe destination URLs remain unchanged. When the new checkout is unavailable, visitors can still use those links. No datastore or account model existed, so no customer/subscription persistence or additional authentication infrastructure was added.

### Test payments and fulfillment

Use Stripe test/sandbox mode only for test cards: `4242 4242 4242 4242` for a successful card payment, or `4000 0000 0000 0002` for a declined card, with any future expiry and any three-digit CVC. Never submit these cards in live mode. See [Stripe testing](https://docs.stripe.com/testing).

No new webhook, fulfillment, subscription entitlement, or order-tracking system was added, as requested. Review Sessions and payments in Stripe. If the chosen product needs automatic delivery or access, implement verified webhook-based fulfillment before enabling that automation; never fulfill from the return URL. See [Checkout fulfillment](https://docs.stripe.com/checkout/fulfillment).

### Verification status

- Price/product selection and authenticated Stripe test/live checkout remain pending; no real Stripe key or Price was supplied.
- Local checks passed: 23 endpoint tests, TypeScript checks, frontend production build, Wrangler deployment dry run, and desktop/mobile browser checks of the preview and return/cancel routes. The local Worker returns JSON configuration status and a safe 503 for unconfigured checkout. These checks do not establish a completed Stripe payment.
- The Stripe Codex plugin was installed with `codex plugin add stripe@openai-curated`. Account connection is still needed to inspect this project's Stripe account through that plugin. Plugin installation does not configure the Worker's Stripe secret.

Resources: [Stripe support](https://support.stripe.com), [Checkout Session API](https://docs.stripe.com/api/checkout/sessions/create), [Cloudflare Worker assets](https://developers.cloudflare.com/workers/static-assets/binding/).
