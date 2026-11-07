# OneFin Solution — Client Payments & Billing Hub

Official centralized landing page for **OneFin Solution**, hosted at **[onefinsolution.xyz](https://onefinsolution.xyz)** via **Cloudflare Pages**.

The sole purpose of this website is to provide customers with convenient, secure access to five official external Stripe payment and billing URLs from one centralized location.

> **Architecture Notice**: This is a high-performance static web application with Cloudflare Pages edge functions. It is **NOT** a custom payment processing application, authentication platform, customer management system, or backend service. All payment transactions, card tokenization, customer authentication, and tax invoice generation are handled entirely by Stripe.

---

## 5 External Stripe Destinations

All five URLs remain unchanged and redirect directly to Stripe's hosted infrastructure:

1. **Customer Account & Billing Portal**  
   - **URL**: `https://billing.stripe.com/p/login/4gM14n5n0fkw6q3bMB1oI00`  
   - **Type**: Stripe-hosted self-service portal (Passwordless email authentication).  
   - **Function**: Manage payment cards, view billing history, download official tax receipts, and manage subscriptions.

2. **Strategic Advisory & Retainer Payment**  
   - **URL**: `https://buy.stripe.com/00w00j7v82xK6q37wl1oI08`  
   - **Type**: Stripe Checkout link.  
   - **Function**: Monthly advisory retainers and strategic financial consulting engagements.

3. **Financial Solutions & Setup Fee**  
   - **URL**: `https://buy.stripe.com/5kQ6oHcPs3BO7u7g2R1oI06`  
   - **Type**: Stripe Checkout link.  
   - **Function**: Client onboarding and account intake setup settlements.

4. **Corporate Financial & Accounting Services**  
   - **URL**: `https://buy.stripe.com/00wbJ1cPs3BO8yb4k91oI05`  
   - **Type**: Stripe Checkout link.  
   - **Function**: Structured business accounting workflows and corporate reviews.

5. **Custom Solutions & Enterprise Billing**  
   - **URL**: `https://buy.stripe.com/8x28wP16Ka0cbKnaIx1oI07`  
   - **Type**: Stripe Checkout link.  
   - **Function**: Milestone payments and custom enterprise statements of work.

---

## Visitor Telemetry & Edge Functions

- **Cloudflare Edge Detection**: Native Cloudflare Pages Functions endpoint in `/functions/api/visitor-info.ts` extracts verified visitor IP and geolocation metadata (`cf-connecting-ip`, `request.cf` country, city, region, ISP, and ASN) directly at the edge with zero database storage or tracking.
- **Client System Telemetry**: Browser-side metrics detect viewport, screen resolution, DPR, color depth, browser engine, operating system, device category, network connection, hardware concurrency, and device memory.
- **Privacy First**: IP and device telemetry are displayed strictly in the visitor's current browser session and never stored or harvested.

---

## Security & Customer Authentication

- **Authentication**: When a customer clicks the Customer Billing Portal, they are redirected to Stripe's hosted login page. The customer enters their registered email, and Stripe delivers a one-time verification magic link directly.
- **Zero Credential Storage**: Our website never collects, validates, transmits, or stores credit cards, CVVs, passwords, or session tokens.
- **PCI Compliance**: All financial operations are managed by Stripe, a certified PCI Level 1 Service Provider.

---

## Deployment to Cloudflare Pages (`onefinsolution.xyz`)

The website is hosted on **Cloudflare Pages** with GitHub as the source repository:

1. **Build Settings in Cloudflare Pages**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`
   - **Root Directory**: `/`
2. **Serverless Edge Functions**:
   - Cloudflare Pages automatically detects and mounts `/functions/api/visitor-info.ts` as an edge API route at `/api/visitor-info`.
3. **Custom Domain**:
   - Primary domain: `onefinsolution.xyz`
   - Configured in Cloudflare DNS with Cloudflare proxy and edge SSL/TLS encryption.

---

## Local Development

```bash
# Install dependencies
npm install

# Run Vite dev server (includes dev visitor-info API plugin)
npm run dev

# Compile production bundle for Cloudflare Pages
npm run build

# Run TypeScript type check
npm run lint
```
