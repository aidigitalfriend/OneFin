import React, { useState, useMemo } from 'react';
import {
  Search,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  CreditCard,
  Building2,
  Calendar,
  DollarSign,
  ArrowRight,
  Printer,
  X,
  HelpCircle,
  ShieldCheck,
  Send
} from 'lucide-react';
import { SAMPLE_INVOICES, InvoiceItem, InvoiceStatus } from '../data/invoices.ts';

interface InvoiceTrackingProps {
  onOpenContactWithInvoice?: (invoiceNumber: string) => void;
}

export const InvoiceTracking: React.FC<InvoiceTrackingProps> = ({ onOpenContactWithInvoice }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(SAMPLE_INVOICES[1]); // Default to Pending invoice for immediate clarity
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(true);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tracker' | 'directory'>('tracker');
  const [directoryStatusFilter, setDirectoryStatusFilter] = useState<string>('all');
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Search logic
  const handleSearch = (queryToUse?: string) => {
    const q = (queryToUse !== undefined ? queryToUse : searchQuery).trim().toLowerCase();
    if (!q) return;

    setIsLoading(true);
    setHasSearched(true);

    setTimeout(() => {
      const match = SAMPLE_INVOICES.find(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.clientName.toLowerCase().includes(q) ||
          inv.serviceTitle.toLowerCase().includes(q) ||
          inv.id.toLowerCase() === q
      );

      setSelectedInvoice(match || null);
      setIsLoading(false);
    }, 350);
  };

  const handleSelectSample = (sampleNumber: string) => {
    setSearchQuery(sampleNumber);
    handleSearch(sampleNumber);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2200);
    });
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>PAID &amp; SETTLED</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/25">
            <Clock className="w-3.5 h-3.5" />
            <span>PAYMENT PENDING</span>
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/25 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>PAST DUE / OVERDUE</span>
          </span>
        );
      case 'in_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/25">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>CLEARING IN REVIEW</span>
          </span>
        );
    }
  };

  // Directory filtered list
  const filteredDirectory = useMemo(() => {
    return SAMPLE_INVOICES.filter((inv) => {
      if (directoryStatusFilter === 'all') return true;
      return inv.status === directoryStatusFilter;
    });
  }, [directoryStatusFilter]);

  return (
    <section id="invoice-tracker" className="py-16 lg:py-24 bg-slate-950 border-t border-slate-800/80 relative">
      {/* Ambient background decoration */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-6xl h-80 bg-sky-500/5 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold uppercase tracking-wider mb-2">
              <FileText className="w-3.5 h-3.5" />
              <span>Real-Time Invoice Verification</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>Stripe Synchronized</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              Client Invoice Tracking &amp; Status Lookup
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl">
              Track settlement status, download verified receipts, or fulfill pending invoices directly through official OneFin Solution payment gateways.
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-900 border border-slate-800 rounded-xl shrink-0">
            <button
              onClick={() => setActiveTab('tracker')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'tracker'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Lookup by Invoice #
            </button>
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'directory'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Recent Invoices Ledger ({SAMPLE_INVOICES.length})
            </button>
          </div>
        </div>

        {activeTab === 'tracker' ? (
          <div>
            {/* Search Input Box */}
            <div className="max-w-3xl mx-auto mb-10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}
                className="relative flex flex-col sm:flex-row gap-3"
              >
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <Search className="w-5 h-5 text-sky-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter Invoice # (e.g. INV-2026-0841, INV-2026-0922, INV-2026-0419)..."
                    className="w-full pl-11 pr-24 py-3.5 bg-slate-900/90 border border-slate-800 focus:border-sky-500 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 transition-all font-mono"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-2 py-1"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !searchQuery.trim()}
                  className="px-6 py-3.5 bg-sky-400 hover:bg-sky-300 active:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-semibold text-sm rounded-xl transition-all shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Checking...</span>
                    </>
                  ) : (
                    <>
                      <span>Check Status</span>
                      <ArrowRight className="w-4 h-4 text-slate-950" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Sample Invoice Pills */}
              <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="font-medium text-slate-400">Quick Test Invoices:</span>
                <button
                  type="button"
                  onClick={() => handleSelectSample('INV-2026-0841')}
                  className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:text-emerald-400 font-mono transition-colors text-[11px]"
                >
                  INV-2026-0841 (Paid)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSample('INV-2026-0922')}
                  className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 hover:border-sky-500/50 hover:text-sky-400 font-mono transition-colors text-[11px]"
                >
                  INV-2026-0922 (Pending)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSample('INV-2026-0419')}
                  className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 hover:border-rose-500/50 hover:text-rose-400 font-mono transition-colors text-[11px]"
                >
                  INV-2026-0419 (Overdue)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSample('INV-2026-1055')}
                  className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 hover:border-purple-500/50 hover:text-purple-400 font-mono transition-colors text-[11px]"
                >
                  INV-2026-1055 (In Review)
                </button>
              </div>
            </div>

            {/* Invoice Detail Card Display */}
            {selectedInvoice ? (
              <div className="max-w-4xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl overflow-hidden backdrop-blur-md">
                {/* Header status bar */}
                <div className="p-6 sm:p-8 bg-slate-950/60 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-xl sm:text-2xl font-bold text-white tracking-tight">
                        {selectedInvoice.invoiceNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(selectedInvoice.invoiceNumber, 'invNumber')}
                        className="p-1 rounded text-slate-500 hover:text-white transition-colors"
                        title="Copy invoice number"
                      >
                        {copiedText === 'invNumber' ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      {selectedInvoice.portalCategory}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(selectedInvoice.status)}
                  </div>
                </div>

                {/* Main Invoice Card Body */}
                <div className="p-6 sm:p-8 space-y-6">
                  {/* Status Banner Context */}
                  {selectedInvoice.status === 'paid' && (
                    <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="text-xs">
                          <span className="font-semibold text-white block mb-0.5">
                            Payment Verified &amp; Settled
                          </span>
                          <span className="text-slate-300">
                            Paid on {selectedInvoice.paidDate} via {selectedInvoice.paymentMethod}. Stripe Receipt ID:{' '}
                            <strong className="font-mono text-emerald-400">{selectedInvoice.stripeReceiptId}</strong>
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsReceiptModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold text-xs border border-emerald-500/30 transition-colors shrink-0"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>View Receipt</span>
                      </button>
                    </div>
                  )}

                  {selectedInvoice.status === 'pending' && (
                    <div className="p-4 rounded-xl bg-sky-950/30 border border-sky-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                        <div className="text-xs">
                          <span className="font-semibold text-white block mb-0.5">
                            Payment Outstanding · Due by {selectedInvoice.dueDate}
                          </span>
                          <span className="text-slate-300">
                            This invoice is scheduled for settlement. Complete payment directly using our secure Stripe link.
                          </span>
                        </div>
                      </div>
                      {selectedInvoice.checkoutUrl && (
                        <a
                          href={selectedInvoice.checkoutUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-semibold text-xs transition-colors shrink-0 shadow-sm shadow-sky-500/20"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay Invoice Now</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  )}

                  {selectedInvoice.status === 'overdue' && (
                    <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                        <div className="text-xs">
                          <span className="font-semibold text-rose-300 block mb-0.5">
                            Account Action Required · Past Due Since {selectedInvoice.dueDate}
                          </span>
                          <span className="text-slate-300">
                            The standard payment window has lapsed. Immediate settlement is requested to maintain active service allocations.
                          </span>
                        </div>
                      </div>
                      {selectedInvoice.checkoutUrl && (
                        <a
                          href={selectedInvoice.checkoutUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-semibold text-xs transition-colors shrink-0 shadow-sm shadow-rose-500/20"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Settle Overdue Balance</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  )}

                  {selectedInvoice.status === 'in_review' && (
                    <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-start gap-3">
                      <RefreshCw className="w-5 h-5 text-purple-400 shrink-0 mt-0.5 animate-spin" />
                      <div className="text-xs">
                        <span className="font-semibold text-purple-300 block mb-0.5">
                          Remittance Clearance In Progress
                        </span>
                        <span className="text-slate-300">
                          {selectedInvoice.notes || 'Wire or bank transfer submission received. Our accounting desk is validating ledger confirmation.'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Summary Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block mb-1">
                        Billed Client
                      </span>
                      <span className="text-sm font-semibold text-white block truncate">
                        {selectedInvoice.clientName}
                      </span>
                      <span className="text-xs text-slate-400 truncate block mt-0.5">
                        {selectedInvoice.clientEmail}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block mb-1">
                        Issue Date
                      </span>
                      <span className="text-sm font-semibold text-white block font-mono">
                        {selectedInvoice.issueDate}
                      </span>
                      <span className="text-xs text-slate-400 block mt-0.5">
                        Net 14 settlement terms
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block mb-1">
                        Due Date
                      </span>
                      <span className={`text-sm font-semibold block font-mono ${
                        selectedInvoice.status === 'overdue' ? 'text-rose-400' : 'text-white'
                      }`}>
                        {selectedInvoice.dueDate}
                      </span>
                      <span className="text-xs text-slate-400 block mt-0.5">
                        {selectedInvoice.status === 'paid' ? 'Settled on file' : 'Standard schedule'}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block mb-1">
                        Total Amount
                      </span>
                      <span className="text-xl font-bold text-white block font-mono tracking-tight text-sky-400">
                        ${selectedInvoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {selectedInvoice.currency} · 0% Sales Tax
                      </span>
                    </div>
                  </div>

                  {/* Line Items Breakdown Table */}
                  <div className="border border-slate-800 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                        Itemized Scope of Service
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        {selectedInvoice.items.length} line item(s)
                      </span>
                    </div>

                    <div className="divide-y divide-slate-800/60 text-xs">
                      {selectedInvoice.items.map((item, idx) => (
                        <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-950/40 transition-colors">
                          <div className="flex items-start gap-2.5">
                            <span className="font-mono text-slate-500 text-[11px] mt-0.5">0{idx + 1}.</span>
                            <div>
                              <p className="font-medium text-white">{item.description}</p>
                              <p className="text-[11px] text-slate-400">
                                Qty: {item.quantity} × ${item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>
                          <span className="font-mono font-semibold text-slate-200 text-sm self-end sm:self-center">
                            ${(item.quantity * item.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Table Footer Total */}
                    <div className="px-4 py-3.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300 uppercase tracking-wider">
                        Invoice Total Balance
                      </span>
                      <span className="font-mono text-base font-bold text-white">
                        ${selectedInvoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {selectedInvoice.currency}
                      </span>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {selectedInvoice.checkoutUrl && selectedInvoice.status !== 'paid' && (
                        <a
                          href={selectedInvoice.checkoutUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-semibold text-xs shadow-md shadow-sky-500/20 transition-all"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Fulfill Invoice via Stripe</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {selectedInvoice.status === 'paid' && (
                        <button
                          type="button"
                          onClick={() => setIsReceiptModalOpen(true)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold text-xs transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>View Official PDF Receipt</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            `Invoice: ${selectedInvoice.invoiceNumber}\nClient: ${selectedInvoice.clientName}\nAmount: $${selectedInvoice.amount} ${selectedInvoice.currency}\nStatus: ${selectedInvoice.status.toUpperCase()}\nDue: ${selectedInvoice.dueDate}`,
                            'summary'
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-colors"
                      >
                        {copiedText === 'summary' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied Summary!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span>Copy Invoice Summary</span>
                          </>
                        )}
                      </button>
                    </div>

                    <a
                      href="#contact"
                      className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors"
                    >
                      <span>Inquire about this invoice</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ) : hasSearched ? (
              /* Not Found State */
              <div className="max-w-2xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center backdrop-blur-md">
                <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-2">
                  No Direct Match Found for "{searchQuery}"
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
                  We could not find an invoice with that exact reference in the local cache. Invoices generated through direct custom statements of work can be looked up via your email on the Stripe Customer Portal.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
                  <a
                    href="https://billing.stripe.com/p/login/4gM14n5n0fkw6q3bMB1oI00"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Stripe Email Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href="#contact"
                    className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                  >
                    <span>Contact Billing Desk</span>
                  </a>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          /* Live Invoices Ledger Directory View */
          <div>
            {/* Filter buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">Filter by Status:</span>
                {(['all', 'paid', 'pending', 'overdue', 'in_review'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setDirectoryStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg font-medium capitalize transition-all ${
                      directoryStatusFilter === status
                        ? 'bg-sky-500 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <span className="text-xs text-slate-500 font-mono">
                Showing {filteredDirectory.length} of {SAMPLE_INVOICES.length} invoices
              </span>
            </div>

            {/* Invoices Table */}
            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60 backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6">Invoice #</th>
                      <th className="py-3.5 px-4">Client Entity</th>
                      <th className="py-3.5 px-4">Service Scope</th>
                      <th className="py-3.5 px-4">Amount</th>
                      <th className="py-3.5 px-4">Due Date</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredDirectory.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-950/40 transition-colors">
                        <td className="py-4 px-4 sm:px-6 font-mono font-semibold text-white">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-white font-medium block">{inv.clientName}</span>
                          <span className="text-slate-500 text-[11px] block">{inv.clientEmail}</span>
                        </td>
                        <td className="py-4 px-4 text-slate-300 max-w-xs truncate">
                          {inv.serviceTitle}
                        </td>
                        <td className="py-4 px-4 font-mono font-semibold text-white">
                          ${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-4 font-mono text-slate-400">
                          {inv.dueDate}
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(inv.status)}
                        </td>
                        <td className="py-4 px-4 sm:px-6 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setSearchQuery(inv.invoiceNumber);
                              setActiveTab('tracker');
                            }}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Official PDF Receipt Modal */}
      {isReceiptModalOpen && selectedInvoice && selectedInvoice.status === 'paid' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="rounded-2xl border border-slate-700 bg-slate-900 max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
            {/* Modal Actions */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="font-display font-semibold text-base text-white">
                  Official OneFin Solution Receipt
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-semibold border border-sky-500/30 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Canvas */}
            <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-6">
              <div className="flex justify-between items-start border-b border-slate-800 pb-5">
                <div>
                  <h3 className="font-display font-bold text-lg text-white">OneFin Solution</h3>
                  <p className="text-slate-400 text-[11px] font-mono mt-0.5">onefinsolution.xyz</p>
                  <p className="text-slate-500 text-[11px]">Financial Operations &amp; Client Billing Hub</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-white block text-sm">
                    {selectedInvoice.invoiceNumber}
                  </span>
                  <span className="text-emerald-400 font-semibold block text-[11px]">
                    STATUS: PAID IN FULL
                  </span>
                  <span className="text-slate-400 font-mono text-[11px] block mt-1">
                    Stripe Ref: {selectedInvoice.stripeReceiptId}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-800 text-slate-300">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-slate-500 block font-semibold mb-1">
                    Customer / Entity
                  </span>
                  <p className="font-semibold text-white">{selectedInvoice.clientName}</p>
                  <p className="text-slate-400 text-[11px]">{selectedInvoice.clientEmail}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] uppercase tracking-wider text-slate-500 block font-semibold mb-1">
                    Settlement Details
                  </span>
                  <p>Settled: <strong className="text-white font-mono">{selectedInvoice.paidDate}</strong></p>
                  <p className="text-slate-400 text-[11px]">{selectedInvoice.paymentMethod}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <table className="w-full text-left text-xs mb-4">
                  <thead className="text-slate-500 border-b border-slate-800 pb-2">
                    <tr>
                      <th className="py-2">Description</th>
                      <th className="py-2 text-center">Qty</th>
                      <th className="py-2 text-right">Rate</th>
                      <th className="py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {selectedInvoice.items.map((it, i) => (
                      <tr key={i}>
                        <td className="py-2 text-slate-200">{it.description}</td>
                        <td className="py-2 text-center text-slate-400">{it.quantity}</td>
                        <td className="py-2 text-right font-mono text-slate-300">
                          ${it.unitPrice.toFixed(2)}
                        </td>
                        <td className="py-2 text-right font-mono font-semibold text-white">
                          ${(it.quantity * it.unitPrice).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-sm font-semibold">
                  <span className="text-slate-300">Total Cleared Payment:</span>
                  <span className="font-mono text-emerald-400 text-base">
                    ${selectedInvoice.amount.toFixed(2)} {selectedInvoice.currency}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Verified Stripe PCI-DSS Level 1 Encrypted Transaction</span>
                <span className="font-mono">onefinsolution.xyz</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
