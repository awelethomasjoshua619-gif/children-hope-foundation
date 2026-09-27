import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Calendar, ArrowUpRight, Award } from 'lucide-react';
import { donationApi } from '../lib/api';
import { Donation } from '../types';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    donationApi
      .getMyDonations()
      .then((res) => {
        if (res.data?.donations) {
          setDonations(res.data.donations);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalDonatedKobo = donations
    .filter((d) => d.status === 'SUCCESS')
    .reduce((acc, d) => acc + d.amount, 0);

  const formatMoney = (kobo: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(kobo / 100);
  };

  const statusBadge = (status: string) => {
    if (status === 'SUCCESS')
      return (
        <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
          CONFIRMED
        </span>
      );
    if (status === 'PENDING')
      return (
        <span className="inline-block bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
          PENDING
        </span>
      );
    return (
      <span className="inline-block bg-rose-100 text-rose-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-3xl p-8 md:p-12 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest bg-white/20 text-white px-3 py-1 rounded-full">
            Donor Dashboard
          </span>
          <h1 className="text-3xl font-black">Welcome back, {user?.name}!</h1>
          <p className="text-blue-100 text-sm">Thank you for being a part of transforming lives across Africa.</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl text-right min-w-[200px]">
          <div className="text-xs font-bold text-blue-200 uppercase tracking-wider">Total Impact Contributed</div>
          <div className="text-3xl font-black mt-1">{formatMoney(totalDonatedKobo)}</div>
        </div>
      </div>

      {/* Donation History Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <Heart className="w-5 h-5 text-rose-500 fill-current" />
              <span>Your Donation History</span>
            </h2>
            <p className="text-xs text-slate-500">All verified contributions made from this account</p>
          </div>
          <Link
            to="/campaigns"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>Donate Again</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading your history...</div>
        ) : donations.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Donations Recorded Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Make your first contribution to start tracking your impact here.
            </p>
            <Link
              to="/campaigns"
              className="inline-block bg-blue-600 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md"
            >
              Explore Causes
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Cause / Campaign</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Reference</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {donations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 text-slate-500 text-xs whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(donation.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {donation.campaign?.title || 'General Fund'}
                    </td>
                    <td className="py-4 px-6 font-extrabold text-blue-600">
                      {formatMoney(donation.amount)}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-500">
                      {donation.paystackRef}
                    </td>
                    <td className="py-4 px-6">
                      {statusBadge(donation.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
