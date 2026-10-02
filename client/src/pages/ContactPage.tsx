import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { contactApi } from '../lib/api';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await contactApi.send({ name, email, subject, message });
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send your message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="max-w-3xl space-y-4">
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#99782b]">Get in touch</span>
        <h1 className="font-serif text-4xl leading-[1.05] tracking-[-0.04em] text-[#16352f] sm:text-5xl">Send us a message.</h1>
        <p className="text-[#5e7069]">Submit a question or note using the form. Your message will be saved to the foundation’s contact records.</p>
      </div>

      <div className="max-w-3xl">
          {sent ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 sm:p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="font-serif text-3xl text-[#16352f]">Message saved.</h2>
              <p className="text-sm text-[#5e7069] max-w-sm mx-auto">
                Thank you, {name.split(' ')[0]}. Your message has been recorded.
              </p>
              <button
                onClick={() => {
                  setSent(false);
                  setName('');
                  setEmail('');
                  setSubject('');
                  setMessage('');
                }}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-100 shadow-xl space-y-5">
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-4 rounded-2xl">{error}</div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Your Name *</label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Subject *</label>
                <input
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Message *</label>
                <textarea
                  required
                  rows={6}
                  maxLength={2000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-sm resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-8 py-3.5 rounded-xl text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Sending...' : 'Send Message'}</span>
              </button>
            </form>
          )}
        </div>
    </div>
  );
};
