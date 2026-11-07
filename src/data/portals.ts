export type PortalStatus = 'Active' | 'Maintenance' | 'Beta';

export interface PortalItem {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  badge: string;
  status: PortalStatus;
  statusNote?: string;
  category: 'billing' | 'checkout';
  isCustomerPortal?: boolean;
  featured?: boolean;
  url: string;
  domainDisplay: string;
  description: string;
  bestFor: string;
  features: string[];
  ctaLabel: string;
  paymentMethods: string[];
  tag: string;
}

export const PORTALS: PortalItem[] = [
  {
    id: 'customer-billing-portal',
    number: '01',
    title: 'Customer Account & Billing Portal',
    subtitle: 'Manage Subscriptions, Tax Invoices & Payment Cards',
    badge: 'Self-Service Portal',
    status: 'Active',
    statusNote: 'Live & operational on Stripe. Passwordless email authentication.',
    category: 'billing',
    isCustomerPortal: true,
    featured: true,
    url: 'https://billing.stripe.com/p/login/4gM14n5n0fkw6q3bMB1oI00',
    domainDisplay: 'billing.stripe.com',
    description:
      'Access your centralized client billing profile. Enter your registered email on Stripe to receive a secure login link to update payment methods, download official PDF tax invoices, review billing history, and manage recurring services.',
    bestFor: 'Existing clients managing subscriptions, downloading past receipts, or updating company billing cards.',
    features: [
      'Passwordless one-time email magic link authentication handled by Stripe',
      'Download itemized historical invoices & official receipts',
      'Update or replace credit/debit card on file directly with Stripe',
      'View upcoming scheduled billing cycles and renewal dates'
    ],
    ctaLabel: 'Log In to Billing Portal',
    paymentMethods: ['Saved Cards', 'Bank Account', 'Auto-Pay'],
    tag: 'Account Management'
  },
  {
    id: 'advisory-consulting-payment',
    number: '02',
    title: 'Strategic Advisory & Retainer Payment',
    subtitle: 'Direct Payment for Consulting & Monthly Retainers',
    badge: 'Direct Checkout',
    status: 'Active',
    statusNote: 'Active payment link. Instant clearance and automated tax receipting.',
    category: 'checkout',
    url: 'https://buy.stripe.com/00w00j7v82xK6q37wl1oI08',
    domainDisplay: 'buy.stripe.com',
    description:
      'Fulfill scheduled financial strategy retainers, dedicated advisory blocks, and consulting engagements with instant automated payment receipt generation directly through Stripe checkout.',
    bestFor: 'Clients under ongoing financial advisory agreements or scheduled consulting retainers.',
    features: [
      'One-click checkout powered by Stripe Infrastructure',
      'Instant automated email invoice receipt',
      'Supports corporate credit/debit cards, Apple Pay & Google Pay',
      'Encrypted transaction logged to your client account'
    ],
    ctaLabel: 'Pay Advisory Retainer',
    paymentMethods: ['Visa', 'Mastercard', 'Amex', 'Apple Pay', 'Google Pay'],
    tag: 'Advisory Retainer'
  },
  {
    id: 'starter-setup-fee',
    number: '03',
    title: 'Financial Solutions & Setup Fee',
    subtitle: 'Standard Engagement Onboarding & Setup Settlement',
    badge: 'Direct Checkout',
    status: 'Active',
    statusNote: 'Active onboarding gateway with verified 256-bit AES encryption.',
    category: 'checkout',
    url: 'https://buy.stripe.com/5kQ6oHcPs3BO7u7g2R1oI06',
    domainDisplay: 'buy.stripe.com',
    description:
      'Process initial client onboarding, setup retainers, and baseline financial service fees securely with real-time clearance on Stripe.',
    bestFor: 'New client onboarding packages, intake setup fees, and standardized single-session deliverables.',
    features: [
      'Streamlined single-transaction checkout',
      'Immediate payment confirmation delivered to your inbox',
      'Verified bank-grade 256-bit AES encryption',
      'Compliant expense receipt for accounting'
    ],
    ctaLabel: 'Pay Setup Fee',
    paymentMethods: ['Visa', 'Mastercard', 'Amex', 'Apple Pay', 'Google Pay'],
    tag: 'Setup & Onboarding'
  },
  {
    id: 'corporate-accounting-services',
    number: '04',
    title: 'Corporate Financial & Accounting Services',
    subtitle: 'Professional Business Solutions & Comprehensive Billing',
    badge: 'Direct Checkout',
    status: 'Beta',
    statusNote: 'Beta checkout release with enhanced corporate ledger reconciliation.',
    category: 'checkout',
    url: 'https://buy.stripe.com/00wbJ1cPs3BO8yb4k91oI05',
    domainDisplay: 'buy.stripe.com',
    description:
      'Settlement link for mid-tier corporate engagements, financial statement analysis, accounting workflows, and structured business reviews.',
    bestFor: 'Growing enterprises, multi-entity corporate structuring, and scheduled accounting service fees.',
    features: [
      'Itemized corporate billing compatible with commercial cards',
      'Instant billing verification notification to finance managers',
      'Official Stripe receipt for company tax compliance',
      'Priority settlement reconciliation'
    ],
    ctaLabel: 'Pay Corporate Service',
    paymentMethods: ['Visa', 'Mastercard', 'Amex', 'Apple Pay', 'Google Pay'],
    tag: 'Corporate Accounting'
  },
  {
    id: 'custom-enterprise-solutions',
    number: '05',
    title: 'Custom Solutions & Enterprise Billing',
    subtitle: 'Tailored Scope Settlement & Dedicated Milestone Payments',
    badge: 'Direct Checkout',
    status: 'Maintenance',
    statusNote: 'Scheduled system maintenance in progress for high-value banking rail updates.',
    category: 'checkout',
    url: 'https://buy.stripe.com/8x28wP16Ka0cbKnaIx1oI07',
    domainDisplay: 'buy.stripe.com',
    description:
      'Dedicated payment portal for custom-negotiated statements of work, executive financial mandates, and tailored corporate milestone billing.',
    bestFor: 'Enterprise clients, custom-scoped proposals, and tailored capital advisory agreements.',
    features: [
      'Direct linkage to custom client master service agreement',
      'High-limit commercial transaction processing',
      'Priority accounting support & dedicated invoicing proof',
      'Instant confirmation sent to both client and account manager'
    ],
    ctaLabel: 'Pay Enterprise Invoice',
    paymentMethods: ['Visa', 'Mastercard', 'Amex', 'Apple Pay', 'Google Pay'],
    tag: 'Custom Enterprise'
  }
];

export const TRUST_METRICS = [
  { value: '256-bit', label: 'AES Encryption', detail: 'Bank-grade SSL transaction security' },
  { value: 'Level 1', label: 'PCI-DSS Compliant', detail: 'Highest certified payment security standard' },
  { value: 'Instant', label: 'Automated Receipts', detail: 'Tax-ready PDF invoices sent immediately' },
  { value: '100%', label: 'Powered by Stripe', detail: 'Zero stored card data on external servers' }
];

export const FAQS = [
  {
    question: 'How do I access past invoices, receipts, and payment history?',
    answer:
      'Click on the "Customer Account & Billing Portal" (Link #01). You will be prompted on Stripe\'s secure login screen to enter the email address associated with your OneFin Solution account. Stripe will immediately send you a secure, passwordless magic link to log into your client portal, where you can view past receipts, download PDF invoices, and update billing methods.'
  },
  {
    question: 'Does OneFin Solution store my credit card or bank login info?',
    answer:
      'No. This website is a centralized landing directory providing convenient navigation to our five official Stripe URLs. All customer authentication and payment processing are handled entirely by Stripe (a certified PCI Level 1 provider). Our website never collects, validates, or stores credit cards, passwords, or authentication tokens.'
  },
  {
    question: 'Which direct payment link should I choose?',
    answer:
      'Each checkout link corresponds to a specific service package agreed upon in your engagement proposal or statement of work. For onboarding fees, choose Setup Fee (#03); for monthly advisory retainers, choose Strategic Advisory (#02); for corporate accounting, choose #04; and for custom enterprise invoices, choose #05.'
  },
  {
    question: 'What payment methods are supported through Stripe?',
    answer:
      'All major credit and debit cards (Visa, MasterCard, American Express, Discover), as well as mobile wallets like Apple Pay and Google Pay where enabled on your device.'
  },
  {
    question: 'Is my financial data secure?',
    answer:
      'Yes. All transactions are securely routed through Stripe, a certified PCI Service Provider Level 1—the most stringent level of security certification in the payments industry. Your sensitive card details are tokenized and processed directly by Stripe.'
  },
  {
    question: 'How is this site hosted and deployed?',
    answer:
      'OneFin Solution is hosted and deployed on Cloudflare Pages with custom domain onefinsolution.xyz. The GitHub repository serves as the source code repository, with Cloudflare providing global edge delivery, DDoS protection, and native serverless Pages Functions for visitor telemetry.'
  }
];
