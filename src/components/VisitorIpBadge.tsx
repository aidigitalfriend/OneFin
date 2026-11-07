import React, { useState } from 'react';
import { Globe, Copy, Check, RefreshCw, Activity, ShieldCheck, ChevronRight } from 'lucide-react';
import { VisitorTelemetry } from '../services/visitorInfo.ts';

interface VisitorIpBadgeProps {
  telemetry: VisitorTelemetry | null;
  isLoading: boolean;
  onRefresh: () => void;
  onOpenDetails: () => void;
}

export const VisitorIpBadge: React.FC<VisitorIpBadgeProps> = ({
  telemetry,
  isLoading,
  onRefresh,
  onOpenDetails
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyIp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!telemetry?.ip || telemetry.ip === 'Resolving...') return;
    navigator.clipboard.writeText(telemetry.ip);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ipDisplay = telemetry?.ip || 'Resolving...';
  const locationDisplay = telemetry?.city && telemetry?.country
    ? `${telemetry.city}, ${telemetry.country}`
    : telemetry?.country || 'Cloudflare Edge';

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {/* Main Interactive Pill Container */}
      <button
        type="button"
        onClick={onOpenDetails}
        className="group relative inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-mono bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/60 hover:border-sky-500/50 shadow-sm shadow-sky-950/40 backdrop-blur-md transition-all text-slate-300 hover:text-white"
        title="Click to view detailed browser, network and hardware diagnostics"
      >
        {/* Glowing Radar Live Indicator */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>

        {/* IP text & Location */}
        <div className="flex items-center gap-1.5 truncate">
          <span className="text-[11px] sm:text-xs text-sky-400 font-semibold tracking-wide">
            {isLoading ? 'Detecting IP...' : ipDisplay}
          </span>

          <span className="text-slate-600 hidden md:inline">·</span>

          <span className="text-[11px] text-slate-400 truncate max-w-[110px] hidden md:inline font-sans">
            {locationDisplay}
          </span>
        </div>

        {/* Quick Action: Copy IP Button */}
        <span
          role="button"
          tabIndex={0}
          onClick={handleCopyIp}
          className="p-0.5 rounded text-slate-400 hover:text-sky-300 hover:bg-slate-700/60 transition-colors ml-0.5"
          title="Copy IP address"
        >
          {copied ? (
            <Check className="w-3 h-3 text-emerald-400" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </span>

        {/* Arrow to indicate clickable modal */}
        <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all hidden sm:inline" />
      </button>

      {/* Quick Refresh Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRefresh();
        }}
        disabled={isLoading}
        className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-colors disabled:opacity-50"
        title="Refresh visitor IP & network connection data"
      >
        <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
      </button>
    </div>
  );
};
