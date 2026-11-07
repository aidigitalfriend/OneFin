import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  ShieldCheck,
  Globe,
  Monitor,
  Cpu,
  Wifi,
  Search,
  HardDrive,
  Eye,
  RefreshCw,
  ExternalLink,
  Laptop,
  Layers,
  Sparkles
} from 'lucide-react';
import { VisitorTelemetry } from '../services/visitorInfo.ts';

interface BrowserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: VisitorTelemetry | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const BrowserInfoModal: React.FC<BrowserInfoModalProps> = ({
  isOpen,
  onClose,
  telemetry,
  isLoading,
  onRefresh
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'network' | 'browser' | 'hardware' | 'display'>('all');
  const [searchFilter, setSearchFilter] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyValue = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyFullReport = () => {
    if (!telemetry) return;
    const report = JSON.stringify(telemetry, null, 2);
    handleCopyValue(report, 'full_report');
  };

  interface MetricItem {
    id: string;
    label: string;
    value: string;
    category: 'network' | 'browser' | 'hardware' | 'display';
    subtext?: string;
    badge?: string;
    copyable?: boolean;
    highlight?: boolean;
  }

  const allMetrics: MetricItem[] = telemetry
    ? [
        // Network & IP
        {
          id: 'ip',
          label: 'Public IP Address',
          value: telemetry.ip,
          category: 'network',
          badge: telemetry.ipVersion,
          copyable: true,
          highlight: true,
          subtext: `Verified via ${telemetry.source}`
        },
        {
          id: 'location',
          label: 'Estimated Location',
          value: [telemetry.city, telemetry.region, telemetry.country].filter(Boolean).join(', ') || 'Cloudflare Edge Routed',
          category: 'network',
          copyable: true
        },
        {
          id: 'timezone',
          label: 'Local Timezone',
          value: telemetry.timezone || 'UTC',
          category: 'network'
        },
        {
          id: 'isp',
          label: 'Internet Service Provider (ISP)',
          value: telemetry.isp || (telemetry.asn ? `Autonomous System ${telemetry.asn}` : 'Encrypted Transit Network'),
          category: 'network',
          subtext: telemetry.asn || undefined
        },
        {
          id: 'colo',
          label: 'Cloudflare Edge PoP (Colo)',
          value: telemetry.colo ? `${telemetry.colo} (Edge Node)` : 'Global Anycast Edge',
          category: 'network'
        },
        {
          id: 'effective_type',
          label: 'Connection Quality',
          value: telemetry.effectiveType || telemetry.connectionType || 'Broadband / Cellular',
          category: 'network',
          subtext: telemetry.downlinkSpeed ? `Downlink ~${telemetry.downlinkSpeed} · RTT ${telemetry.roundTripTime || 'optimal'}` : undefined
        },

        // Browser & Environment
        {
          id: 'browser',
          label: 'Browser Application',
          value: `${telemetry.browserName} ${telemetry.browserVersion}`,
          category: 'browser',
          subtext: `Rendering Engine: ${telemetry.engine}`,
          highlight: true
        },
        {
          id: 'os',
          label: 'Operating System',
          value: `${telemetry.osName} ${telemetry.osVersion}`.trim(),
          category: 'hardware',
          badge: telemetry.deviceType,
          subtext: `Platform Identifier: ${telemetry.platform}`
        },
        {
          id: 'languages',
          label: 'System & Browser Languages',
          value: telemetry.languages.join(', ') || telemetry.primaryLanguage,
          category: 'browser'
        },
        {
          id: 'cookies',
          label: 'Cookie Support',
          value: telemetry.cookieEnabled ? 'Enabled & Active' : 'Blocked / Disabled',
          category: 'browser',
          badge: telemetry.cookieEnabled ? 'Active' : 'Disabled'
        },
        {
          id: 'local_storage',
          label: 'LocalStorage Storage Engine',
          value: telemetry.localStorageAvailable ? 'Supported & Operational' : 'Restricted',
          category: 'browser'
        },
        {
          id: 'do_not_track',
          label: 'Global Privacy Control (DNT)',
          value: telemetry.doNotTrack === '1' ? 'Enabled (Opted Out)' : telemetry.doNotTrack === '0' ? 'Disabled' : 'Unspecified',
          category: 'browser'
        },

        // Hardware & Concurrency
        {
          id: 'cpu',
          label: 'CPU Thread Concurrency',
          value: String(telemetry.cpuCores),
          category: 'hardware',
          subtext: 'Hardware concurrency via W3C Navigation API'
        },
        {
          id: 'memory',
          label: 'Device RAM (Approximate)',
          value: String(telemetry.deviceMemoryGb),
          category: 'hardware',
          subtext: 'Reported by browser deviceMemory API (quantized)'
        },
        {
          id: 'touch',
          label: 'Touchscreen Support',
          value: telemetry.touchSupport ? `Yes (${telemetry.maxTouchPoints} Touch Points)` : 'No (Mouse / Trackpad Primary)',
          category: 'hardware'
        },

        // Display & Screen
        {
          id: 'screen_res',
          label: 'Physical Screen Resolution',
          value: telemetry.screenResolution,
          category: 'display',
          subtext: `${telemetry.colorDepth}-bit Color Depth`
        },
        {
          id: 'viewport',
          label: 'Active Browser Viewport',
          value: telemetry.viewportSize,
          category: 'display',
          subtext: `Orientation: ${telemetry.screenOrientation}`
        },
        {
          id: 'dpr',
          label: 'Device Pixel Ratio (DPR)',
          value: `${telemetry.devicePixelRatio}x (Retina HiDPI)`,
          category: 'display'
        }
      ]
    : [];

  const filteredMetrics = allMetrics.filter((m) => {
    const matchesTab = activeTab === 'all' || m.category === activeTab;
    const matchesSearch =
      searchFilter === '' ||
      m.label.toLowerCase().includes(searchFilter.toLowerCase()) ||
      m.value.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (m.subtext && m.subtext.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glass Modal Window */}
      <div className="relative w-full max-w-3xl bg-slate-950/90 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl shadow-slate-950/90 max-h-[90vh] flex flex-col overflow-hidden backdrop-blur-2xl">
        {/* Top Gradient Hairline Accent */}
        <div className="h-1 w-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500" />

        {/* Modal Header */}
        <div className="px-5 sm:px-7 py-4 border-b border-slate-800/80 flex items-center justify-between gap-4 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-sky-500/20 shrink-0">
              <ShieldCheck className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base sm:text-lg font-bold text-white tracking-tight">
                  Visitor &amp; System Intelligence
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Edge Telemetry
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                onefinsolution.xyz · Cloudflare Network Protected
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors disabled:opacity-50"
              title="Refresh telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter bar: Search & Categorical Tabs */}
        <div className="px-5 sm:px-7 py-3 border-b border-slate-800/60 bg-slate-900/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Categorical Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto py-1 sm:py-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                activeTab === 'all'
                  ? 'bg-sky-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              All Metrics ({allMetrics.length})
            </button>
            <button
              onClick={() => setActiveTab('network')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all flex items-center gap-1 ${
                activeTab === 'network'
                  ? 'bg-sky-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Wifi className="w-3 h-3" />
              <span>IP &amp; Network</span>
            </button>
            <button
              onClick={() => setActiveTab('browser')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all flex items-center gap-1 ${
                activeTab === 'browser'
                  ? 'bg-sky-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>Browser</span>
            </button>
            <button
              onClick={() => setActiveTab('hardware')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all flex items-center gap-1 ${
                activeTab === 'hardware'
                  ? 'bg-sky-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Cpu className="w-3 h-3" />
              <span>Hardware</span>
            </button>
            <button
              onClick={() => setActiveTab('display')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all flex items-center gap-1 ${
                activeTab === 'display'
                  ? 'bg-sky-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Monitor className="w-3 h-3" />
              <span>Display</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[180px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter metrics..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900/80 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-4 text-xs">
          {isLoading && !telemetry ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin text-sky-400 mx-auto" />
              <p className="font-mono text-xs">Querying Cloudflare Edge &amp; Device Telemetry...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredMetrics.map((item) => {
                const isCopied = copiedKey === item.id;

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      item.highlight
                        ? 'bg-sky-950/30 border-sky-500/40 shadow-sm shadow-sky-500/5'
                        : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700/80'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="font-medium text-slate-300">{item.label}</span>
                      <div className="flex items-center gap-1.5">
                        {item.badge && (
                          <span className="px-1.5 py-0.2 rounded-full font-mono text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20">
                            {item.badge}
                          </span>
                        )}
                        {item.copyable && (
                          <button
                            type="button"
                            onClick={() => handleCopyValue(item.value, item.id)}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Copy value"
                          >
                            {isCopied ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="font-mono text-xs sm:text-sm font-semibold text-white break-words">
                      {item.value}
                    </div>

                    {item.subtext && (
                      <p className="text-[11px] text-slate-500 mt-1 font-sans">
                        {item.subtext}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* User-Agent String Section */}
          {telemetry && (
            <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-300 text-xs flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 text-sky-400" />
                  Raw User-Agent Header
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyValue(telemetry.userAgent, 'ua')}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-sky-400 hover:text-sky-300"
                >
                  {copiedKey === 'ua' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy UA</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 font-mono text-[11px] text-slate-400 break-all leading-relaxed select-all">
                {telemetry.userAgent}
              </div>
            </div>
          )}

          {/* Privacy & Zero-Storage Assurance */}
          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/70 text-[11px] text-slate-400 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200">Zero Server-Side Storage Policy: </span>
              This diagnostics payload is evaluated client-side and via Cloudflare transient edge headers solely for your current session. OneFin Solution never logs, stores, or profiles your IP address or hardware specifications.
            </div>
          </div>
        </div>

        {/* Modal Footer Bar */}
        <div className="px-5 sm:px-7 py-3.5 border-t border-slate-800/80 bg-slate-900/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
            <span>Edge Protocol: {telemetry?.tlsVersion || 'TLS 1.3'}</span>
            <span>·</span>
            <span>Generated: {telemetry?.timestamp || 'Live'}</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopyFullReport}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-colors"
            >
              {copiedKey === 'full_report' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Report Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy All JSON</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-xl transition-colors"
            >
              Close Diagnostics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
