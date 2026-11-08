import React from 'react';
import { ArrowLeft, Layers, ShieldCheck } from 'lucide-react';
import { CheckoutSection } from './CheckoutSection.tsx';

interface CheckoutPreviewPageProps {
  status?: 'returned' | 'canceled';
}

export const CheckoutPreviewPage: React.FC<CheckoutPreviewPageProps> = ({ status }) => (
  <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-sky-500 selection:text-white">
    <header className="border-b border-slate-800 bg-slate-950/85">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-wrap items-center justify-between gap-4">
        <a href="/" className="inline-flex items-center gap-2.5 font-display text-lg font-bold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-400 text-slate-950">
            <Layers className="h-4 w-4" aria-hidden="true" />
          </span>
          OneFin Solution
        </a>
        <a href="/" className="inline-flex items-center gap-2 text-sm font-medium text-sky-400 hover:text-sky-300">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to billing hub
        </a>
      </div>
    </header>
    <main className="max-w-7xl mx-auto pb-12 sm:pb-20">
      <div className="px-4 pt-12 sm:px-6 sm:pt-20 lg:px-8 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-sky-400 mb-3">OneFin subscription</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
          {status === 'returned' ? 'Back from Stripe' : 'Your subscription checkout'}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-300">
          Review your OneFin subscription on Stripe, including the price and billing frequency, before you confirm.
        </p>
      </div>
      <CheckoutSection status={status} showPreviewLink={false} paymentLinksHref="/#checkout-links" />
      <div className="px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-slate-400">
        <p className="inline-flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0 text-sky-400" aria-hidden="true" />
          Payment details are entered securely on Stripe.
        </p>
        <a href="mailto:support@onefinsolution.xyz" className="text-sky-400 hover:text-sky-300 underline underline-offset-4">
          support@onefinsolution.xyz
        </a>
      </div>
    </main>
  </div>
);
