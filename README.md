# OneFin Solution — Client Payments & Billing Hub

Official centralized landing page for **OneFin Solution**, hosted at **[onefinsolution.xyz](https://onefinsolution.xyz)** via **GitHub Pages**.

The sole purpose of this website is to provide customers with convenient, secure access to five official external Stripe payment and billing URLs from one centralized location.

> **Architecture Notice**: This is a static directory website. It is **NOT** a custom payment processing application, authentication platform, customer management system, or backend service. All payment transactions, card tokenization, customer authentication, and tax invoice generation are handled entirely by Stripe.

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

## Security & Customer Authentication

- **Authentication**: When a customer clicks the Customer Billing Portal, they are redirected to Stripe's hosted login page. The customer enters their registered email, and Stripe delivers a one-time verification magic link directly.
- **Zero Credential Storage**: Our website never collects, validates, transmits, or stores credit cards, CVVs, passwords, or session tokens.
- **PCI Compliance**: All financial operations are managed by Stripe, a certified PCI Level 1 Service Provider.

---

## Deployment to GitHub Pages (`onefinsolution.xyz`)

1. **Automated CI/CD**: Pushing to the `main` branch triggers `.github/workflows/deploy.yml` which builds the static bundle and deploys it to GitHub Pages.
2. **Custom Domain**: A static `CNAME` file is located in `/public/CNAME` containing `onefinsolution.xyz`.
3. **DNS Setup**:
   - 4 Apex `A` Records pointing `@` to GitHub Pages IPs:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
   - `CNAME` record pointing `www` to `[your-github-username].github.io`.

---

## Local Development

```bash
# Install dependencies
npm install

# Run Vite dev server
npm run dev

# Compile production bundle for GitHub Pages
npm run build

# Run TypeScript type check
npm run lint
```
