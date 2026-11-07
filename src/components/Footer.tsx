import React from 'react';
import { Layers, ShieldCheck, ExternalLink } from 'lucide-react';
import { PORTALS } from '../data/portals.ts';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 mb-12">
          {/* Brand & Mission column */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-slate-950 font-bold">
                  <Layers className="w-4 h-4 stroke-[2.5]" />
                </div>
                <span className="font-display font-bold text-base text-white">
                  OneFin Solution
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm mb-4">
                Centralized directory providing convenient navigation to official external Stripe payment and billing portals. All payments and authentications are hosted securely on Stripe.
              </p>
              <div className="flex items-center gap-3 text-slate-400">
                <span className="font-mono text-sky-400">onefinsolution.xyz</span>
                <span>·</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Stripe PCI Level 1
                </span>
              </div>
            </div>
          </div>

          {/* Quick links to the 5 Stripe portals */}
          <div className="md:col-span-4">
            <h4 className="font-display font-semibold text-white uppercase tracking-wider text-xs mb-3">
              Direct Stripe Portals
            </h4>
            <ul className="space-y-2">
              {PORTALS.map((portal) => (
                <li key={portal.id}>
                  <a
                    href={portal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-sky-400 transition-colors flex items-center justify-between group py-0.5"
                  >
                    <span className="truncate pr-2">{portal.title}</span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-medium border ${
                          portal.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : portal.status === 'Beta'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                        }`}
                      >
                        {portal.status}
                      </span>
                      <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-sky-400 shrink-0" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Compliance & Help desk */}
          <div className="md:col-span-3">
            <h4 className="font-display font-semibold text-white uppercase tracking-wider text-xs mb-3">
              Billing Support
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed mb-3">
              Need assistance with an invoice adjustment, corporate retainer agreement, or payment portal?
            </p>
            <div className="space-y-1.5 font-mono text-slate-300">
              <p>Email: <a href="mailto:support@onefinsolution.xyz" className="hover:text-sky-400 underline decoration-slate-700">support@onefinsolution.xyz</a></p>
              <p>Portal: billing.stripe.com</p>
            </div>
            <div className="mt-3">
              <a
                href="#contact"
                className="inline-flex items-center gap-1 font-sans text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors"
              >
                <span>Send Support Inquiry</span>
                <span>&rarr;</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>&copy; {new Date().getFullYear()} OneFin Solution (onefinsolution.xyz). All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Official Stripe Hosted Pages</span>
            <span>·</span>
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
