# Stripe Embedded Form integration

This is the single source of truth for remaining checkout setup. The existing Checkout Session call uses the supplied Embedded Form configuration and subscription mode. Products and recurring prices now load automatically from the matching Stripe account's catalog.

## Values to Replace

**Files containing sample defaults or references to required configuration:**

- [.env.example](.env.example)
- [worker.ts](worker.ts)
- [src/components/CheckoutSection.tsx](src/components/CheckoutSection.tsx)

| Field | Current sample | What to set |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | `sk_test_...` | A fresh server-only test/sandbox key, or restricted key permitted to read Prices/Products and create Checkout Sessions. Store it as a Cloudflare Worker secret. Rotate the secret exposed in chat; it was not copied into source, configuration, or Git. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | Matching publishable key in the Cloudflare Workers Builds **build environment**, then rebuild. Vite reads it at build time; a runtime-only Worker binding does not configure the browser bundle. |

Subscription mode is already selected. No product, Price, or subscription was created during implementation.

No manual `STRIPE_PRICE_ID` is required. Active recurring Prices attached to active Products are loaded from Stripe when the page opens, including additional pages of results. One-time and archived products/prices are excluded from this subscription flow. Catalog changes appear on the next page load without a code change or manual sync.

## Configured Parameters

**Server configuration:** [worker.ts](worker.ts)

| Parameter | Value |
| --- | --- |
| `ui_mode` | `form` |
| `mode` | `subscription` |
| `billing_address_collection` | `auto` |
| `phone_number_collection.enabled` | `false` |
| `automatic_tax.enabled` | `false` |
| `payment_method_collection` | `always` |
| `submit_type` | `auto` |
| `name_collection.individual.enabled` | `true` |
| `name_collection.individual.optional` | `true` |
| `integration_identifier` | `custom_embedded_web_0001` |

The prior `allow_promotion_codes`, `saved_payment_method_options`, `origin_context`, `success_url`, and `cancel_url` were removed because they are absent from the supplied Field Intents. The response is now `{client_secret: session.client_secret}` in no-store JSON, as required by the client integration; there is no hosted URL redirect.

Installed server SDK `stripe` 23.1.0 defaults to API `2026-10-28.endive`, later than the required `2026-03-25.dahlia`. No API-version override or preview/beta header was added. Payment methods retain Stripe's dynamic configuration.

**Client configuration:** [index.html](index.html), [src/components/CheckoutSection.tsx](src/components/CheckoutSection.tsx)

- Stripe.js loads directly in the HTML head from `https://js.stripe.com/dahlia/stripe.js`; it is not bundled or self-hosted.
- `@stripe/stripe-js` 10.2.1 supplies types only. Initialization uses the script's `window.Stripe` and `VITE_STRIPE_PUBLISHABLE_KEY`.
- Uses `initCheckoutFormSdk`, `createForm({layout: 'expanded'})`, `loadActions`, and a confirm event connected to `actions.confirm`.
- Appearance matches the supplied configuration: Stripe theme, spaced inputs, automatic labels, 4px radius/spacing, white background, blue `#0570de` primary, `#df1b41` danger, `#00c853` success, `#30313d` text, default font, 16px base size.
- Confirmation passes same-origin `/checkout/success` as client-side `returnUrl`, since no server `return_url` is configured. `redirect: 'if_required'` keeps supported payments inline and allows payment-method authentication redirects. The existing `/checkout/cancel` route remains available.
- Submission/return messages do not assert settlement. Returned/thrown errors are handled; forms are destroyed on unmount or retry.

## Setup and next steps

1. Rotate the exposed test secret in the intended Stripe account. Follow [Stripe key management](https://docs.stripe.com/keys-best-practices). Do not reuse the pasted secret or commit keys.
2. Configure the rotated `STRIPE_SECRET_KEY` on the existing Cloudflare **Worker `onefin`** under runtime Variables and Secrets. Its account/test mode determines which Stripe catalog is shown. Add/manage active Products with active recurring Prices in Stripe Dashboard; the site lists them automatically.
3. Configure matching publishable `VITE_STRIPE_PUBLISHABLE_KEY` in the **Workers Builds build environment**, then rebuild and deploy through the existing Git integration: `npm run build`, then `npx wrangler deploy`. Keep the existing Worker and custom domain. `keep_vars: true` preserves runtime dashboard variables.
4. Verify `GET https://onefinsolution.xyz/api/create-checkout-session` returns JSON with `prices`. `available: true` means an eligible catalog was read successfully, not that a Checkout Session or payment was accepted. The browser also requires a matching valid publishable key before enabling the form.
5. Open `/checkout`, select a catalog subscription, load the embedded form, and complete a test/sandbox payment in the matching account. Verify its Session, subscription, and payment in Stripe Dashboard. Test decline, retry, cancellation, authentication/redirect returns, and mobile rendering before switching to matching live keys and the live catalog.

If Stripe rejects initialization, inspect the matching account's API logs and verify form availability for that account. Account-specific API acceptance and payments remain unverified.

### Local development and verification

Use Node.js 24 for the endpoint tests. Keep the public key in ignored `.env.local` as `VITE_STRIPE_PUBLISHABLE_KEY` for Vite. Keep the server key in ignored `.dev.vars` for Wrangler. Variable names match [.env.example](.env.example). Never put a server secret in a `VITE_` variable.

```sh
npm ci
npm run lint
node --test scripts/test-checkout.mjs
npm run build
npx wrangler deploy --dry-run
npx wrangler dev
```

Open Wrangler's local URL, normally `http://localhost:8787`. Plain Vite `npm run dev` does not run the Worker API. Without configuration, checkout remains unavailable and existing payment links remain usable.

### Flow and files

- [worker.ts](worker.ts): existing `GET` reads the active recurring Stripe catalog using automatic pagination and returns only public display fields. `POST` accepts a selected `price_id`, retrieves it fresh from Stripe, rejects unavailable/nonrecurring products/prices, and creates the Session using Stripe's pricing. Browser amounts/quantities are ignored; licensed prices use quantity 1, while metered prices omit quantity as Stripe requires. Origin/method/error checks and static fallback are preserved.
- [src/components/CheckoutSection.tsx](src/components/CheckoutSection.tsx): shared homepage/checkout block shows catalog selection, mounts the form on request, and wires confirmation, errors, retry, and cleanup. Currency labels follow Stripe's minor-unit rules. Complex/fractional/usage prices direct visitors to review pricing in the secure form. Selection is locked while its form is active.
- [src/components/CheckoutPreviewPage.tsx](src/components/CheckoutPreviewPage.tsx): existing `/checkout` and neutral return/cancel pages. [src/App.tsx](src/App.tsx) retains its route selection; no new routes were added.
- [index.html](index.html): direct Stripe.js script. [wrangler.jsonc](wrangler.jsonc) retains the existing Worker deployment and assets.
- [scripts/test-checkout.mjs](scripts/test-checkout.mjs): SDK request/response and server guard tests with mocked transport, without Stripe API calls.

The five existing Stripe destination URLs remain unchanged. No datastore, authentication, webhook, fulfillment, or order tracking was added. The legacy `functions/api/visitor-info.ts` remains Pages-only. The separate GitHub Pages workflow is not the live Cloudflare deployment.

### Test payments and fulfillment

In Stripe test/sandbox mode only, use `4242 4242 4242 4242` for success or `4000 0000 0000 0002` for a decline, with future expiry and three-digit CVC. See [Stripe testing](https://docs.stripe.com/testing).

Review Sessions/subscriptions/payments in Stripe. Future automatic delivery or access requires verified server-side fulfillment; do not grant access from client success or return URLs. See [Checkout fulfillment](https://docs.stripe.com/checkout/fulfillment).

### Verification status

- Matching publishable key, rotated server-secret configuration, and authenticated Stripe catalog/payment verification remain pending. No manual Price ID is needed.
- Passed 45 endpoint tests, TypeScript checks, production build, and Worker deployment dry run. Mocked desktop/mobile browser checks passed for catalog/currency display, selection, embedded form mounting, early/duplicate confirmation, errors/retry, cleanup, and neutral return states. Missing-key and empty/error catalog states remain unavailable safely. These checks do not establish real Stripe API acceptance or payment success.

Resources: [Stripe support](https://support.stripe.com), [Stripe MCP](https://docs.stripe.com/mcp), [Checkout Session API](https://docs.stripe.com/api/checkout/sessions/create), [Form SDK](https://docs.stripe.com/js/custom_checkout/form_init), [confirmation](https://docs.stripe.com/js/custom_checkout/confirm).
