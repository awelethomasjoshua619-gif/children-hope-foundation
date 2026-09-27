import React, { useState } from 'react';
import { Heart, ShieldCheck, Lock, CreditCard } from 'lucide-react';
import { donationApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface DonateFormProps {
  campaignId: string;
  campaignTitle: string;
}

const PRESET_AMOUNTS = [
  { kobo: 500000, label: '₦5,000' },
  { kobo: 1500000, label: '₦15,000' },
  { kobo: 5000000, label: '₦50,000' },
  { kobo: 10000000, label: '₦100,000' },
];

export const DonateForm: React.FC<DonateFormProps> = ({ campaignId, campaignTitle }) => {
  const { user } = useAuth();
  const [selectedKobo, setSelectedKobo] = useState<number>(1500000);
  const [customNaira, setCustomNaira] = useState<string>('');
  const [donorEmail, setDonorEmail] = useState<string>(user?.email || '');
  const [donorName, setDonorName] = useState<string>(user?.name || '');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [isRecurring, setIsRecurring] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getEffectiveAmountKobo = (): number => {
    if (customNaira) {
      const val = parseFloat(customNaira);
      if (!isNaN(val) && val > 0) {
        return Math.round(val * 100);
      }
    }
    return selectedKobo;
  };

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountKobo = getEffectiveAmountKobo();
    if (amountKobo < 10000) { // ₦100 min
      setError('Minimum donation amount is ₦100');
      return;
    }

    if (!donorEmail) {
      setError('Please enter your email address for your receipt');
      return;
    }

    setLoading(true);

    try {
      const res = await donationApi.initialize({
        amount: amountKobo,
        campaignId,
        donorEmail,
        donorName: isAnonymous ? 'Anonymous' : donorName,
        isAnonymous,
        isRecurring,
      });

      if (res.data?.authorizationUrl) {
        // Redirect to Paystack checkout page
        window.location.href = res.data.authorizationUrl;
      } else {
        throw new Error('Failed to retrieve payment authorization link');
      }
    } catch (err: any) {
      setError(err.message || 'Payment initialization failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleDonate} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-2xl space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <Heart className="w-5 h-5 text-rose-500 fill-current" />
          <span>Make a Difference</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">Directly supporting: <strong className="text-slate-800">{campaignTitle}</strong></p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-4 rounded-2xl">
          {error}
        </div>
      )}

      {/* Preset amount selector */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Select Amount (NGN)
        </label>
        <div className="grid grid-cols-2 gap-3">
          {PRESET_AMOUNTS.map((preset) => (
            <button
              key={preset.kobo}
              type="button"
              onClick={() => {
                setSelectedKobo(preset.kobo);
                setCustomNaira('');
              }}
              className={`py-3.5 px-4 rounded-2xl text-sm font-bold transition-all border ${
                selectedKobo === preset.kobo && !customNaira
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/30'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom amount */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Or Enter Custom Amount (₦)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₦</span>
          <input
            type="number"
            min="100"
            placeholder="e.g. 25000"
            value={customNaira}
            onChange={(e) => setCustomNaira(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-slate-900 font-semibold"
          />
        </div>
      </div>

      {/* Frequency Toggle */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl">
        <button
          type="button"
          onClick={() => setIsRecurring(false)}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors ${
            !isRecurring ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          One-Off Donation
        </button>
        <button
          type="button"
          onClick={() => setIsRecurring(true)}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors ${
            isRecurring ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Monthly Recurring 💖
        </button>
      </div>

      {/* Donor info */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Email Address (for tax receipt) *
          </label>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={donorEmail}
            onChange={(e) => setDonorEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-slate-900 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Full Name (optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Sarah Connor"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-slate-900 text-sm"
          />
        </div>

        <label className="flex items-center space-x-3 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
          />
          <span className="text-xs text-slate-600 font-medium">
            Make my donation anonymous on public impact walls
          </span>
        </label>
      </div>

      {/* CTA Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl text-base shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center space-x-2"
      >
        {loading ? (
          <span>Connecting to Paystack...</span>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            <span>Proceed to Secure Paystack Checkout</span>
          </>
        )}
      </button>

      {/* Trust badges */}
      <div className="flex items-center justify-center space-x-4 pt-2 text-[11px] text-slate-400 font-semibold">
        <span className="flex items-center space-x-1">
          <Lock className="w-3.5 h-3.5 text-blue-500" />
          <span>256-bit Encrypted</span>
        </span>
        <span>•</span>
        <span className="flex items-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Paystack Verified</span>
        </span>
      </div>
    </form>
  );
};
