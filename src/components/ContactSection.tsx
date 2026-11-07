import React, { useState } from 'react';
import { Mail, Clock, ShieldCheck, Check, Send } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    portalTopic: 'Customer Billing Portal',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setFormSubmitted(true);
  };

  return (
    <section id="contact" className="py-16 lg:py-24 bg-slate-900/30 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs text-sky-400 font-semibold uppercase tracking-wider">
            Dedicated Client Support
          </span>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mt-1">
            Need Help With a Payment or Portal?
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-2">
            Our billing operations team is here to assist with invoice reconciliations, corporate agreements, and portal inquiries.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Support Information */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-3">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-display text-base font-bold text-white mb-1">
                Direct Email Assistance
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Send invoice references or inquiries directly to our billing desk:
              </p>
              <a
                href="mailto:support@onefinsolution.xyz"
                className="text-sm font-mono text-sky-400 hover:text-sky-300 underline font-semibold"
              >
                support@onefinsolution.xyz
              </a>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-display text-base font-bold text-white mb-1">
                Operating Hours &amp; Response SLA
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Monday &ndash; Friday: 8:00 AM &ndash; 6:00 PM EST. Urgent settlement inquiries are monitored continuously. Standard inquiry response within 2-4 business hours.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-display text-base font-bold text-white mb-1">
                Zero Credential Policy
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Never send credit card numbers, CVVs, or bank login codes via email. All payment details must be entered solely on official Stripe checkout pages.
              </p>
            </div>
          </div>

          {/* Quick Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
              <h3 className="font-display text-lg font-bold text-white mb-2">
                Send a Billing Inquiry
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Submit your inquiry and our billing coordinator will follow up directly.
              </p>

              {formSubmitted ? (
                <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center animate-in fade-in">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-3">
                    <Check className="w-5 h-5" />
                  </div>
                  <h4 className="font-display text-base font-bold text-white mb-1">
                    Inquiry Received
                  </h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto mb-4">
                    Thank you, {formData.name}. Our billing operations desk will review your inquiry and reach out to <strong className="text-white">{formData.email}</strong> shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setFormSubmitted(false);
                      setFormData({ name: '', email: '', portalTopic: 'Customer Billing Portal', message: '' });
                    }}
                    className="px-4 py-2 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Billing Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="sarah@company.com"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Relevant Portal Destination
                    </label>
                    <select
                      value={formData.portalTopic}
                      onChange={(e) => setFormData({ ...formData, portalTopic: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                    >
                      <option value="Customer Billing Portal">01 · Customer Account &amp; Billing Portal</option>
                      <option value="Strategic Advisory">02 · Strategic Advisory &amp; Retainer Payment</option>
                      <option value="Setup Fee">03 · Financial Solutions &amp; Setup Fee</option>
                      <option value="Corporate Accounting">04 · Corporate Financial &amp; Accounting Services</option>
                      <option value="Custom Enterprise">05 · Custom Solutions &amp; Enterprise Billing</option>
                      <option value="General Invoicing">General Invoice or Receipt Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Message / Invoice Reference *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please include any invoice number or specific details regarding your inquiry..."
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 active:bg-sky-500 rounded-xl transition-all shadow-md shadow-sky-500/20"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Inquiry to Billing Operations</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
