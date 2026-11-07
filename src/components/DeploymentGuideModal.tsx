import React, { useState } from 'react';
import { X, Check, Copy, Globe, Terminal, ShieldCheck, ExternalLink } from 'lucide-react';

interface DeploymentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeploymentGuideModal: React.FC<DeploymentGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const aRecords = [
    '185.199.108.153',
    '185.199.109.153',
    '185.199.110.153',
    '185.199.111.153'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-white">
                GitHub Pages &amp; Custom Domain Guide
              </h3>
              <span className="text-xs text-sky-400 font-mono">onefinsolution.xyz</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Step 1: Pre-configured CNAME */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider text-sky-400 mb-2">
              1. CNAME File (Already Configured)
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              The repository includes a static CNAME file inside the <code className="text-sky-300">/public</code> folder which Vite copies to <code className="text-sky-300">/dist</code> during build:
            </p>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-emerald-400 flex items-center justify-between">
              <span>onefinsolution.xyz</span>
              <button
                onClick={() => copyText('onefinsolution.xyz', 'cname')}
                className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1"
              >
                {copiedKey === 'cname' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'cname' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Step 2: DNS Records at Domain Registrar */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider text-sky-400 mb-2">
              2. DNS Records Configuration (Your Registrar)
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              In your domain DNS manager (GoDaddy, Namecheap, Cloudflare, Google Domains), configure the following 4 GitHub Pages A records for the root apex domain (<code>@</code>):
            </p>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3">Host / Name</th>
                    <th className="py-2 px-3">IP Target Value</th>
                    <th className="py-2 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/60 text-slate-300">
                  {aRecords.map((ip, i) => (
                    <tr key={i}>
                      <td className="py-2 px-3 text-sky-400 font-bold">A</td>
                      <td className="py-2 px-3">@</td>
                      <td className="py-2 px-3 text-slate-200">{ip}</td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => copyText(ip, `ip_${i}`)}
                          className="text-slate-400 hover:text-white inline-flex items-center gap-1 text-[11px]"
                        >
                          {copiedKey === `ip_${i}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="py-2 px-3 text-sky-400 font-bold">CNAME</td>
                    <td className="py-2 px-3">www</td>
                    <td className="py-2 px-3 text-slate-200">[username].github.io</td>
                    <td className="py-2 px-3 text-right">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Step 3: GitHub Repository Settings */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider text-sky-400 mb-2">
              3. GitHub Repository Settings
            </h4>
            <ol className="list-decimal list-inside text-xs text-slate-300 space-y-2 leading-relaxed">
              <li>Navigate to your GitHub repository: <strong>Settings &rarr; Pages</strong>.</li>
              <li>Under <strong>Build and deployment</strong>, set Source to <strong>GitHub Actions</strong>.</li>
              <li>Under <strong>Custom domain</strong>, verify that <code>onefinsolution.xyz</code> is detected.</li>
              <li>Check <strong>Enforce HTTPS</strong> once the DNS propagation passes SSL certificate checks.</li>
            </ol>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">onefinsolution.xyz ready</span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
