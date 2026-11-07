export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'in_review';

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  serviceTitle: string;
  portalCategory: string;
  checkoutUrl?: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
  stripeReceiptId?: string;
  notes?: string;
  items: InvoiceLineItem[];
}

export const SAMPLE_INVOICES: InvoiceItem[] = [
  {
    id: 'inv_01',
    invoiceNumber: 'INV-2026-0841',
    clientName: 'Apex Capital Partners LLC',
    clientEmail: 'finance@apexcap.com',
    serviceTitle: 'Strategic Financial Advisory Retainer (November 2026)',
    portalCategory: 'Portal 02 · Strategic Advisory',
    checkoutUrl: 'https://buy.stripe.com/00w00j7v82xK6q37wl1oI08',
    amount: 3500.00,
    currency: 'USD',
    status: 'paid',
    issueDate: '2026-11-01',
    dueDate: '2026-11-15',
    paidDate: '2026-11-03',
    paymentMethod: 'Corporate Visa ending in 4242',
    stripeReceiptId: 'rcpt_1Ok942Jk381nF9',
    notes: 'Cleared via Stripe automated direct checkout. Receipt issued to finance desk.',
    items: [
      { description: 'Executive Advisory Block & Capital Planning', quantity: 1, unitPrice: 2800.00 },
      { description: 'Monthly Cash Flow & Valuation Modeling', quantity: 1, unitPrice: 700.00 }
    ]
  },
  {
    id: 'inv_02',
    invoiceNumber: 'INV-2026-0922',
    clientName: 'Vanguard Biometrics Inc.',
    clientEmail: 'billing@vanguardbio.io',
    serviceTitle: 'Corporate Financial & Accounting Settlement',
    portalCategory: 'Portal 04 · Corporate Accounting',
    checkoutUrl: 'https://buy.stripe.com/00wbJ1cPs3BO8yb4k91oI05',
    amount: 4850.00,
    currency: 'USD',
    status: 'pending',
    issueDate: '2026-11-02',
    dueDate: '2026-11-16',
    notes: 'Awaiting scheduled card settlement or direct Stripe portal authorization.',
    items: [
      { description: 'Multi-Entity Reconciliation & Audit Preparation', quantity: 1, unitPrice: 3200.00 },
      { description: 'Tax Compliance & Ledger Restructuring', quantity: 1, unitPrice: 1650.00 }
    ]
  },
  {
    id: 'inv_03',
    invoiceNumber: 'INV-2026-0419',
    clientName: 'Horizon Global Logistics',
    clientEmail: 'ap@horizonglobal.net',
    serviceTitle: 'Financial Solutions Client Onboarding & Setup',
    portalCategory: 'Portal 03 · Setup Fee',
    checkoutUrl: 'https://buy.stripe.com/5kQ6oHcPs3BO7u7g2R1oI06',
    amount: 1750.00,
    currency: 'USD',
    status: 'overdue',
    issueDate: '2026-10-15',
    dueDate: '2026-10-30',
    notes: 'Payment grace period expired. Immediate settlement required to maintain portal synchronization.',
    items: [
      { description: 'Core Entity Intake & Treasury Setup', quantity: 1, unitPrice: 1250.00 },
      { description: 'Portal Credentials & Gateway Tokenization', quantity: 1, unitPrice: 500.00 }
    ]
  },
  {
    id: 'inv_04',
    invoiceNumber: 'INV-2026-1055',
    clientName: 'Meridian Health Systems',
    clientEmail: 'accounting@meridianhealth.org',
    serviceTitle: 'Custom Enterprise Milestone Billing (Phase 1 Clearance)',
    portalCategory: 'Portal 05 · Custom Enterprise',
    checkoutUrl: 'https://buy.stripe.com/8x28wP16Ka0cbKnaIx1oI07',
    amount: 12500.00,
    currency: 'USD',
    status: 'in_review',
    issueDate: '2026-11-04',
    dueDate: '2026-11-18',
    notes: 'ACH / Wire Transfer confirmation uploaded. Settlement verification currently underway by treasury operations.',
    items: [
      { description: 'Enterprise Master Services Mandate - Milestone 1', quantity: 1, unitPrice: 10000.00 },
      { description: 'Dedicated Controller Support & Reporting Desk', quantity: 1, unitPrice: 2500.00 }
    ]
  },
  {
    id: 'inv_05',
    invoiceNumber: 'INV-2026-0780',
    clientName: 'Kallisto Media Ventures',
    clientEmail: 'finance@kallistomedia.com',
    serviceTitle: 'Strategic Advisory & Retainer Payment (October 2026)',
    portalCategory: 'Portal 02 · Strategic Advisory',
    checkoutUrl: 'https://buy.stripe.com/00w00j7v82xK6q37wl1oI08',
    amount: 3500.00,
    currency: 'USD',
    status: 'paid',
    issueDate: '2026-10-01',
    dueDate: '2026-10-15',
    paidDate: '2026-10-04',
    paymentMethod: 'Mastercard ending in 8891',
    stripeReceiptId: 'rcpt_1Nj391Zk094pL2',
    notes: 'Paid on time via Stripe customer billing link.',
    items: [
      { description: 'Monthly Executive Retainer & Board Reporting', quantity: 1, unitPrice: 3500.00 }
    ]
  }
];
