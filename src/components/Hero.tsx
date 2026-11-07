import React from 'react';
import { ExternalLink, ArrowDown, Lock, Receipt, CheckCircle2, ShieldCheck, Globe, Activity, Laptop, ChevronRight } from 'lucide-react';
import { TRUST_METRICS } from '../data/portals.ts';
import { VisitorTelemetry } from '../services/visitorInfo.ts';

interface HeroProps {
  onOpenBrowserInfo: () => void;
  telemetry: VisitorTelemetry | null;
}

export const Hero: React.FC<HeroProps> = ({ onOpenBrowserInfo, telemetry }) => {
  const ipDisplay = telemetry?.ip || 'Resolving...';
  const locationDisplay = telemetry?.city && telemetry?.country
    ? `${telemetry.city}, ${telemetry.country}`
    : telemetry?.country || 'Cloudflare Edge Routed';

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-slate-800/60">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-5xl h-96 bg-gradient-to-b from-sky-500/10 via-blue-600/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Futuristic Cloudflare Edge Telemetry Banner */}
        <div className="mb-6 inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 text-xs text-slate-300 backdrop-blur-xl shadow-inner max-w-full">
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span className="text-slate-400">Cloudflare Edge:</span>
          <span className="text-sky-400 font-mono font-semibold">{ipDisplay}</span>
          <span className="text-slate-600 hidden sm:inline">·</span>
          <span className="text-slate-300 hidden sm:inline font-sans">{locationDisplay}</span>
          <span className="text-slate-600 hidden md:inline">·</span>
          <button
            type="button"
            onClick={onOpenBrowserInfo}
            className="text-sky-400 hover:text-sky-300 font-medium underline underline-offset-2 flex items-center gap-0.5 ml-1 transition-colors"
          >
            <span>View Client Telemetry</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Value Proposition & CTAs */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Domain & Trust Metadata line */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-4 font-medium">
              <span className="text-sky-400 font-semibold tracking-wide uppercase">Official Client Portal</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="font-mono text-slate-300">onefinsolution.xyz</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="flex items-center gap-1 text-slate-300">
                <Lock className="w-3 h-3 text-emerald-400" />
                Stripe-Powered Portals
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-5 leading-[1.15]" style={{ textWrap: 'balance' }}>
              Centralized Client Billing &amp; Payment Hub
            </h1>

            <p className="text-base sm:text-lg text-slate-300/90 leading-relaxed mb-8 max-w-2xl">
              Welcome to the official directory for <strong className="text-white font-semibold">OneFin Solution</strong>. Conveniently access our five external Stripe-hosted destinations: manage your customer account, update payment cards, download official receipts, or fulfill scheduled retainers directly through Stripe.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-10">
              <a
                href="https://billing.stripe.com/p/login/4gM14n5n0fkw6q3bMB1oI00"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-semibold text-slate-950 bg-gradient-to-r from-sky-400 via-sky-300 to-blue-400 hover:brightness-110 active:brightness-95 rounded-xl transition-all shadow-lg shadow-sky-500/20 whitespace-nowrap"
              >
                <Receipt className="w-4 h-4 text-slate-950" />
                <span>Customer Billing Portal</span>
                <ExternalLink className="w-4 h-4 text-slate-950/70" />
              </a>

              <a
                href="#portals"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-medium text-slate-200 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all whitespace-nowrap"
              >
                <span>View All 5 Stripe Links</span>
                <ArrowDown className="w-4 h-4 text-slate-400" />
              </a>
            </div>

            {/* Quick trust assurance bullet row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant automated receipt</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Card, Apple &amp; Google Pay</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero stored card numbers</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Trust & Network Telemetry Panel */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-700/60 shadow-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950/90 p-5 sm:p-7 backdrop-blur-2xl">
              {/* Decorative top ambient glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-5">
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    <span className="text-xs font-semibold text-white tracking-wide uppercase">Direct Stripe Gateway</span>
                  </div>
                  <span className="text-[11px] font-mono text-sky-400">PCI Level 1 Certified</span>
                </div>

                {/* 5 Portals Quick Summary List */}
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-white block">01 · Customer Billing Portal</span>
                      <span className="text-[11px] text-slate-400 font-mono">billing.stripe.com</span>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Active
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-white block">02 · Strategic Advisory Retainer</span>
                      <span className="text-[11px] text-slate-400 font-mono">buy.stripe.com/00w00j...</span>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Active
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-white block">03 · Financial Solutions Setup Fee</span>
                      <span className="text-[11px] text-slate-400 font-mono">buy.stripe.com/5kQ6oH...</span>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Active
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-white block">04 · Corporate Accounting Services</span>
                      <span className="text-[11px] text-slate-400 font-mono">buy.stripe.com/00wbJ1...</span>
                    </div>
                    <span className="text-[11px] font-semibold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      Beta
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-white block">05 · Custom Enterprise Solutions</span>
                      <span className="text-[11px] text-slate-400 font-mono">buy.stripe.com/8x28wP...</span>
                    </div>
                    <span className="text-[11px] font-semibold text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                      Maintenance
                    </span>
                  </div>
                </div>

                {/* Visitor Network Diagnostics Inset */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onOpenBrowserInfo}
                    className="w-full p-3 rounded-xl bg-sky-950/40 hover:bg-sky-900/40 border border-sky-500/30 text-left transition-all group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                        <Activity className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white group-hover:text-sky-300 transition-colors">
                          Your Connection: <span className="font-mono text-sky-400">{ipDisplay}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {telemetry?.browserName || 'Browser'} on {telemetry?.osName || 'System'} · Inspect Telemetry
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-sky-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Column Trust Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-slate-800/80">
          {TRUST_METRICS.map((metric, i) => (
            <div key={i} className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <span className="font-display text-2xl sm:text-3xl font-bold text-sky-400 block mb-1">
                {metric.value}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-white block mb-0.5">
                {metric.label}
              </span>
              <span className="text-[11px] text-slate-400 block leading-tight">
                {metric.detail}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
