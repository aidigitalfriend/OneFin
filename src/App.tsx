import React, { useState } from 'react';
import { Header } from './components/Header.tsx';
import { Hero } from './components/Hero.tsx';
import { PortalsSection } from './components/PortalsSection.tsx';
import { SecuritySection } from './components/SecuritySection.tsx';
import { FaqSection } from './components/FaqSection.tsx';
import { ContactSection } from './components/ContactSection.tsx';
import { Footer } from './components/Footer.tsx';
import { Check } from 'lucide-react';

export default function App() {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-sky-500 selection:text-white overflow-x-hidden w-full">
      {/* Top Banner indicating official domain */}
      <div className="bg-slate-900 border-b border-slate-800 text-xs py-2 px-4 text-center text-slate-300">
        <span className="font-semibold text-white">OneFin Solution Hub</span>
        <span className="mx-2 text-slate-600">·</span>
        <span>Official Client Payment &amp; Billing Directory</span>
        <span className="mx-2 text-slate-600">·</span>
        <span className="text-sky-400 font-mono">onefinsolution.xyz</span>
      </div>

      {/* Main Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-grow">
        <Hero />
        <PortalsSection onCopyLink={handleCopyLink} copiedUrl={copiedUrl} />
        <SecuritySection />
        <FaqSection />
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 border border-sky-500/40 text-xs text-white shadow-xl shadow-slate-950/80 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
