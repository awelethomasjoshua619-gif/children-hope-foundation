import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Download, ArrowRight, XCircle } from 'lucide-react';
import { donationApi } from '../lib/api';
import { Donation } from '../types';

export const DonateSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref') || searchParams.get('reference') || searchParams.get('trxref');

  const [loading, setLoading] = useState(true);
  const [donation, setDonation] = useState<(Donation & { campaignTitle?: string }) | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ref) {
      setLoading(false);
      setError('No transaction reference found');
      return;
    }

    donationApi
      .verify(ref)
      .then((res) => {
        if (res.data?.donation) {
          setDonation(res.data.donation as any);
        }
      })
      .catch((err) => {
        setError(err.message || 'Payment verification failed');
      })
      .finally(() => setLoading(false));
  }, [ref]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-32 text-center space-y-4">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Verifying Payment with Paystack...</h2>
        <p className="text-xs text-slate-500">Please do not close or refresh this page.</p>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <XCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Payment Verification Issue</h2>
        <p className="text-sm text-slate-600">{error || 'Could not confirm payment'}</p>
        <Link
          to="/campaigns"
          className="inline-block bg-blue-600 text-white font-bold px-6 py-3 rounded-xl text-sm"
        >
          Return to Campaigns
        </Link>
      </div>
    );
  }

  const formatMoney = (kobo: number, curr: string) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: curr || 'NGN',
    }).format(kobo / 100);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-2xl space-y-8 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Payment Confirmed</span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Thank You For Your Support!</h1>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            Your generous gift has been received and confirmed. A formal tax-deductible receipt has been sent to{' '}
            <strong className="text-slate-900">{donation.donorEmail}</strong>.
          </p>
        </div>

        {/* Receipt Box */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-left space-y-3">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Donation Details</span>
            <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
              {donation.status}
            </span>
          </div>

          <div className="flex justify-between text-sm py-1">
            <span className="text-slate-500">Amount</span>
            <span className="font-bold text-blue-600">{formatMoney(donation.amount, donation.currency)}</span>
          </div>

          <div className="flex justify-between text-sm py-1">
            <span className="text-slate-500">Cause</span>
            <span className="font-semibold text-slate-800">{donation.campaignTitle || donation.campaign?.title || 'General Fund'}</span>
          </div>

          <div className="flex justify-between text-sm py-1">
            <span className="text-slate-500">Reference</span>
            <span className="font-mono text-xs text-slate-600">{donation.paystackRef}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3.5 px-4 rounded-xl text-sm transition-colors flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>

          <Link
            to="/campaigns"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-colors shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2"
          >
            <span>Explore Other Causes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
