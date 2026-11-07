import React, { useState } from 'react';
import { Layers, Menu, X, Activity } from 'lucide-react';
import { VisitorTelemetry } from '../services/visitorInfo.ts';
import { VisitorIpBadge } from './VisitorIpBadge.tsx';

interface HeaderProps {
  telemetry: VisitorTelemetry | null;
  isLoading: boolean;
  onRefreshIp: () => void;
  onOpenBrowserInfo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  telemetry,
  isLoading,
  onRefreshIp,
  onOpenBrowserInfo
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'All Portals', href: '#portals' },
    { label: 'Customer Portal', href: '#billing-portal' },
    { label: 'Direct Payments', href: '#checkout-links' },
    { label: 'Security & Trust', href: '#security' },
    { label: 'Billing FAQ', href: '#faq' },
    { label: 'Contact Support', href: '#contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Brand wordmark */}
        <a href="#" className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <Layers className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          </div>
          <span className="font-display font-bold text-base sm:text-lg tracking-tight text-white">
            OneFin Solution
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-xs lg:text-sm font-medium text-slate-300">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Section: Visitor IP Badge & Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <VisitorIpBadge
            telemetry={telemetry}
            isLoading={isLoading}
            onRefresh={onRefreshIp}
            onOpenDetails={onOpenBrowserInfo}
          />

          {/* Mobile menu toggle button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800/80 bg-slate-950/95 px-4 pt-3 pb-5 space-y-1 backdrop-blur-lg animate-in fade-in duration-150">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
};
