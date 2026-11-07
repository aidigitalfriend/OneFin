import React from 'react';
import { ShieldCheck, Lock, CheckCircle2, Server, Key, FileCheck } from 'lucide-react';

export const SecuritySection: React.FC = () => {
  const points = [
    {
      icon: ShieldCheck,
      title: 'PCI-DSS Level 1 Certified Infrastructure',
      description:
        'All transactions occur entirely on Stripe-hosted checkout pages. Stripe is certified as a PCI Service Provider Level 1—the most stringent standard in the financial payments industry.'
    },
    {
      icon: Lock,
      title: 'Direct Stripe Passwordless Login',
      description:
        'Customer Billing Portal authentication is performed on official Stripe domains (billing.stripe.com). Authentication utilizes passwordless one-time email magic links issued directly by Stripe.'
    },
    {
      icon: Server,
      title: 'Zero Credential & Card Storage',
      description:
        'OneFin Solution does not collect, validate, transmit, or store credit card numbers, CVVs, expiration dates, passwords, session tokens, or payment credentials on our static servers.'
    },
    {
      icon: Key,
      title: 'End-to-End 256-Bit SSL/TLS Encryption',
      description:
        'All data transit between your browser and Stripe\'s servers is secured via 256-bit AES encryption with modern TLS protocols and enforced HTTPS.'
    },
    {
      icon: FileCheck,
      title: 'Automated Tax-Compliant PDF Receipts',
      description:
        'Upon successful settlement on Stripe, official tax-ready PDF receipts are automatically generated and dispatched directly to your registered billing email address.'
    },
    {
      icon: CheckCircle2,
      title: 'Direct Stripe External Links',
      description:
        'Every link on this hub redirects cleanly to verified Stripe endpoints (billing.stripe.com and buy.stripe.com), ensuring complete transaction transparency.'
    }
  ];

  return (
    <section id="security" className="py-16 lg:py-24 bg-slate-900/40 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 mb-3">
            <Lock className="w-3.5 h-3.5" />
            <span>Bank-Grade Payment Security</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
            Enterprise Security Architecture
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
            Our landing page serves as a convenient access hub. All payment processing, card tokenization, and authentication occur exclusively within Stripe's hardened environment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {points.map((pt, i) => {
            const Icon = pt.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex flex-col justify-between hover:border-slate-700/80 transition-colors"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-base font-bold text-white mb-2">
                    {pt.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {pt.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
