import React, { useState } from 'react';
import {
  ExternalLink,
  Copy,
  Check,
  Search,
  Receipt,
  Sparkles,
  ArrowUpRight,
  Lock,
  AlertTriangle,
  Filter,
  RefreshCw
} from 'lucide-react';
import { PORTALS, PortalItem, PortalStatus } from '../data/portals.ts';

interface PortalsSectionProps {
  onCopyLink: (url: string, name: string) => void;
  copiedUrl: string | null;
}

interface PortalStatusBadgeProps {
  status: PortalStatus;
  size?: 'sm' | 'md';
}

export const PortalStatusBadge: React.FC<PortalStatusBadgeProps> = ({ status, size = 'sm' }) => {
  const configs: Record<PortalStatus, {
    label: string;
    wrapperClass: string;
    dotClass: string;
    tooltip: string;
  }> = {
    Active: {
      label: 'Active',
      wrapperClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20',
      dotClass: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]',
      tooltip: 'Live and actively processing instant checkout payments via Stripe'
    },
    Beta: {
      label: 'Beta',
      wrapperClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/20',
      dotClass: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]',
      tooltip: 'Beta gateway: corporate reconciliation and enhanced checkout release'
    },
    Maintenance: {
      label: 'Maintenance',
      wrapperClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/20',
      dotClass: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.7)]',
      tooltip: 'Scheduled gateway maintenance underway for high-limit transaction rails'
    }
  };

  const config = configs[status] || configs.Active;

  return (
    <span
      title={config.tooltip}
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-wide select-none transition-colors ${
        size === 'md' ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-[11px]'
      } ${config.wrapperClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dotClass}`} />
      <span>{config.label}</span>
    </span>
  );
};

export const PortalsSection: React.FC<PortalsSectionProps> = ({ onCopyLink, copiedUrl }) => {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'billing' | 'checkout'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | PortalStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const customerPortal = PORTALS.find((p) => p.isCustomerPortal);
  const checkoutPortals = PORTALS.filter((p) => !p.isCustomerPortal);

  const activeCount = PORTALS.filter((p) => p.status === 'Active').length;
  const betaCount = PORTALS.filter((p) => p.status === 'Beta').length;
  const maintenanceCount = PORTALS.filter((p) => p.status === 'Maintenance').length;

  const filteredPortals = PORTALS.filter((item) => {
    const matchesCategory =
      activeCategoryFilter === 'all' ||
      (activeCategoryFilter === 'billing' && item.category === 'billing') ||
      (activeCategoryFilter === 'checkout' && item.category === 'checkout');

    const matchesStatus =
      statusFilter === 'all' || item.status === statusFilter;

    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.bestFor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tag.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesStatus && matchesSearch;
  });

  const shouldShowCustomerPortal =
    customerPortal &&
    (activeCategoryFilter === 'all' || activeCategoryFilter === 'billing') &&
    (statusFilter === 'all' || customerPortal.status === statusFilter) &&
    (searchQuery === '' ||
      customerPortal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerPortal.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerPortal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerPortal.bestFor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerPortal.tag.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <section id="portals" className="py-16 lg:py-24 bg-slate-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold uppercase tracking-wider mb-2">
              <span>Stripe Destinations Directory</span>
              <span aria-hidden="true">·</span>
              <span>5 External Access Points</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 font-medium">{activeCount} Active</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              Choose Your Billing or Payment Destination
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl">
              Navigate directly to our official Stripe-hosted payment gateways and customer billing portal. All transactions, authentication, and security are managed on Stripe.
            </p>
          </div>

          {/* Category Filter segmented control */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl shrink-0">
              <button
                onClick={() => setActiveCategoryFilter('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  activeCategoryFilter === 'all'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                All Links ({PORTALS.length})
              </button>
              <button
                onClick={() => setActiveCategoryFilter('billing')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  activeCategoryFilter === 'billing'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Customer Portal (1)
              </button>
              <button
                onClick={() => setActiveCategoryFilter('checkout')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  activeCategoryFilter === 'checkout'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Checkout ({checkoutPortals.length})
              </button>
            </div>
          </div>
        </div>

        {/* Filter bar: Search + Status Badge filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          {/* Search Bar filter */}
          <div className="max-w-md w-full">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search portals or status (e.g. Active, Beta, Retainer)..."
                className="w-full pl-10 pr-16 py-2 text-xs sm:text-sm bg-slate-900/90 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Quick Status Filter Pill Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Status:</span>
            </span>

            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 text-xs rounded-full font-medium transition-all ${
                statusFilter === 'all'
                  ? 'bg-slate-700 text-white border border-slate-600 shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              All ({PORTALS.length})
            </button>

            <button
              onClick={() => setStatusFilter('Active')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-medium transition-all ${
                statusFilter === 'Active'
                  ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-500/50 shadow-sm'
                  : 'bg-emerald-500/10 text-emerald-400/90 hover:text-emerald-300 border border-emerald-500/20'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Active ({activeCount})</span>
            </button>

            <button
              onClick={() => setStatusFilter('Beta')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-medium transition-all ${
                statusFilter === 'Beta'
                  ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-sm'
                  : 'bg-amber-500/10 text-amber-300/90 hover:text-amber-200 border border-amber-500/20'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Beta ({betaCount})</span>
            </button>

            <button
              onClick={() => setStatusFilter('Maintenance')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-medium transition-all ${
                statusFilter === 'Maintenance'
                  ? 'bg-rose-500/25 text-rose-200 border border-rose-500/50 shadow-sm'
                  : 'bg-rose-500/10 text-rose-300/90 hover:text-rose-200 border border-rose-500/20'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span>Maintenance ({maintenanceCount})</span>
            </button>
          </div>
        </div>

        {/* Featured Section: Portal #01 (Stripe Customer Account & Billing Portal) */}
        {shouldShowCustomerPortal && customerPortal && (
          <div id="billing-portal" className="mb-14 scroll-mt-24">
            <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border-2 border-sky-500/30 p-6 sm:p-8 lg:p-10 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
                {/* Left side details */}
                <div className="lg:col-span-8 flex flex-col">
                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-400 mb-3 font-medium">
                    <span className="text-sky-400 font-bold tracking-wider uppercase">Portal 01</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-slate-300 font-medium">Self-Service Account Center</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="font-mono text-slate-400">billing.stripe.com</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <PortalStatusBadge status={customerPortal.status} size="sm" />
                  </div>

                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
                    {customerPortal.title}
                  </h3>

                  <p className="text-sm sm:text-base text-sky-200/90 font-medium mb-4">
                    {customerPortal.subtitle}
                  </p>

                  <p className="text-sm text-slate-300 leading-relaxed mb-6">
                    {customerPortal.description}
                  </p>

                  {/* Feature checklist */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {customerPortal.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                        <Receipt className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Best for explanation */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
                    <span className="font-semibold text-white">Recommended for: </span>
                    {customerPortal.bestFor}
                  </div>
                </div>

                {/* Right side CTA Box */}
                <div className="lg:col-span-4 flex flex-col justify-between h-full bg-slate-950/90 border border-slate-800/90 rounded-xl p-6 shadow-inner">
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gateway Status</span>
                      <PortalStatusBadge status={customerPortal.status} size="sm" />
                    </div>

                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Authentication</span>
                      <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Stripe Hosted
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 space-y-2 mb-6">
                      <p>
                        <strong className="text-white">Direct Stripe Authentication:</strong>
                      </p>
                      <ol className="list-decimal list-inside space-y-1.5 text-slate-400 pl-1">
                        <li>Click below to open Stripe's official login screen.</li>
                        <li>Enter your registered billing email address.</li>
                        <li>Stripe sends an authentication magic link to your email.</li>
                      </ol>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <a
                      href={customerPortal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3.5 text-sm font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 active:bg-sky-500 rounded-xl transition-all shadow-md shadow-sky-500/20"
                    >
                      <span>{customerPortal.ctaLabel}</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => onCopyLink(customerPortal.url, customerPortal.title)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
                    >
                      {copiedUrl === customerPortal.url ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Portal URL Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy Portal URL</span>
                        </>
                      )}
                    </button>

                    <div className="text-center">
                      <span className="text-[11px] font-mono text-slate-500 truncate block">
                        billing.stripe.com/p/login/...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Direct Checkout Links Section Header */}
        <div id="checkout-links" className="mb-6 scroll-mt-24">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Direct Stripe Payment Links</span>
              <span className="text-xs font-normal text-slate-400">({checkoutPortals.length} gateways configured)</span>
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Instant checkouts for designated service packages, advisory fees, and invoice settlements directly on Stripe.
          </p>
        </div>

        {/* Grid for the 4 Direct Checkout Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {filteredPortals
            .filter((p) => !p.isCustomerPortal)
            .map((item) => {
              const isCopied = copiedUrl === item.url;
              const isMaintenance = item.status === 'Maintenance';
              const isBeta = item.status === 'Beta';

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl bg-slate-900/70 border p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 group relative shadow-lg ${
                    isMaintenance
                      ? 'border-rose-900/40 hover:border-rose-700/60'
                      : isBeta
                      ? 'border-amber-900/40 hover:border-amber-700/60'
                      : 'border-slate-800 hover:border-slate-700 hover:shadow-sky-500/5'
                  }`}
                >
                  <div>
                    {/* Top metadata line with Status Pill Badge */}
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-400 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-sky-400">{item.number}</span>
                        <span aria-hidden="true" className="text-slate-700">·</span>
                        <span className="text-slate-300 font-medium">{item.tag}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <PortalStatusBadge status={item.status} size="sm" />
                        <span className="hidden sm:flex font-mono text-[11px] text-slate-500 items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-400" />
                          {item.domainDisplay}
                        </span>
                      </div>
                    </div>

                    {/* Card Title & Subtitle */}
                    <h4 className="font-display text-lg sm:text-xl font-bold text-white group-hover:text-sky-300 transition-colors mb-1.5">
                      {item.title}
                    </h4>

                    <p className="text-xs sm:text-sm font-medium text-slate-300 mb-3">
                      {item.subtitle}
                    </p>

                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                      {item.description}
                    </p>

                    {/* Specific Contextual Banner for Maintenance or Beta */}
                    {isMaintenance && (
                      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300 mb-5">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold block text-rose-200">Scheduled Gateway Maintenance</span>
                          <span className="text-rose-300/90 text-[11px] leading-tight block mt-0.5">
                            Undergoing banking rail upgrades. Checkout link remains available for reference &amp; test submissions.
                          </span>
                        </div>
                      </div>
                    )}

                    {isBeta && (
                      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-300 mb-5">
                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold block text-amber-200">Beta Direct Checkout</span>
                          <span className="text-amber-300/90 text-[11px] leading-tight block mt-0.5">
                            Enhanced corporate reconciliation workflow. Active and encrypted under Stripe preview specifications.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Features bullet list */}
                    <div className="space-y-2 mb-5">
                      {item.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* Best for box */}
                    <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 mb-6">
                      <span className="font-medium text-slate-200">Scope: </span>
                      {item.bestFor}
                    </div>
                  </div>

                  {/* Actions & Payment Method Badges */}
                  <div>
                    {/* Payment methods row */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-4 pt-3 border-t border-slate-800/80">
                      <span>Accepted methods on Stripe:</span>
                      <span className="font-mono text-slate-400">Cards, Apple Pay, Google Pay</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all shadow-sm ${
                          isMaintenance
                            ? 'bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30'
                            : isBeta
                            ? 'bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-slate-950 font-bold shadow-amber-600/20'
                            : 'bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white shadow-sky-600/20'
                        }`}
                      >
                        <span>{item.ctaLabel}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>

                      <button
                        onClick={() => onCopyLink(item.url, item.title)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition-colors"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {filteredPortals.length === 0 && (
          <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800">
            <p className="text-sm text-slate-400">No portals match your current search or status filter.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategoryFilter('all');
                setStatusFilter('all');
              }}
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-sky-400 hover:underline font-medium"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset all filters &amp; search</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
