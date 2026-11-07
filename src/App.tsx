import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { Hero } from './components/Hero.tsx';
import { PortalsSection } from './components/PortalsSection.tsx';
import { SecuritySection } from './components/SecuritySection.tsx';
import { FaqSection } from './components/FaqSection.tsx';
import { ContactSection } from './components/ContactSection.tsx';
import { Footer } from './components/Footer.tsx';
import { BrowserInfoModal } from './components/BrowserInfoModal.tsx';
import { detectVisitorTelemetry, VisitorTelemetry } from './services/visitorInfo.ts';
import { Check, ShieldCheck, Activity } from 'lucide-react';

export default function App() {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<VisitorTelemetry | null>(null);
  const [isTelemetryLoading, setIsTelemetryLoading] = useState(true);
  const [isBrowserModalOpen, setIsBrowserModalOpen] = useState(false);

  const loadVisitorTelemetry = async () => {
    setIsTelemetryLoading(true);
    try {
      const data = await detectVisitorTelemetry();
      setTelemetry(data);
    } catch (err) {
      console.error('Failed to load visitor telemetry:', err);
    } finally {
      setIsTelemetryLoading(false);
    }
  };

  useEffect(() => {
    loadVisitorTelemetry();
  }, []);

  const handleCopyLink = (url: string, name: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(url);
      setToastMessage(`Copied link for "${name}" to clipboard`);
      setTimeout(() => {
        setCopiedUrl(null);
      }, 2500);
      setTimeout(() => {
        setToastMessage(null);
      }, 3500);
    }).catch(() => {
      setCopiedUrl(url);
      setToastMessage(`Link ready: ${url}`);
      setTimeout(() => setCopiedUrl(null), 2000);
      setTimeout(() => setToastMessage(null), 3000);
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-sky-500 selection:text-white overflow-x-hidden w-full relative">
      {/* Top Banner indicating Cloudflare Edge & Custom Domain */}
      <div className="bg-slate-900/90 border-b border-slate-800 text-xs py-2 px-4 text-center text-slate-300 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <span className="font-semibold text-white flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            OneFin Solution Hub
          </span>
          <span className="text-slate-600 hidden sm:inline">·</span>
          <span className="hidden sm:inline">Official Client Billing Directory</span>
          <span className="text-slate-600 hidden sm:inline">·</span>
          <span>Domain: <strong className="text-sky-400 font-mono">onefinsolution.xyz</strong></span>
          <span className="text-slate-600 hidden md:inline">·</span>
          <button
            type="button"
            onClick={() => setIsBrowserModalOpen(true)}
            className="text-sky-400 hover:text-sky-300 font-medium underline underline-offset-2 transition-colors ml-1 inline-flex items-center gap-1"
          >
            <Activity className="w-3 h-3" />
            <span>Inspect Visitor &amp; Browser Diagnostics</span>
          </button>
        </div>
      </div>

      {/* Main Header with Visitor IP badge integration */}
      <Header
        telemetry={telemetry}
        isLoading={isTelemetryLoading}
        onRefreshIp={loadVisitorTelemetry}
        onOpenBrowserInfo={() => setIsBrowserModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        <Hero
          telemetry={telemetry}
          onOpenBrowserInfo={() => setIsBrowserModalOpen(true)}
        />
        <PortalsSection onCopyLink={handleCopyLink} copiedUrl={copiedUrl} />
        <SecuritySection />
        <FaqSection />
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Browser & Device Information Modal */}
      <BrowserInfoModal
        isOpen={isBrowserModalOpen}
        onClose={() => setIsBrowserModalOpen(false)}
        telemetry={telemetry}
        isLoading={isTelemetryLoading}
        onRefresh={loadVisitorTelemetry}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900/95 border border-sky-500/40 text-xs text-white shadow-2xl shadow-slate-950/90 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
