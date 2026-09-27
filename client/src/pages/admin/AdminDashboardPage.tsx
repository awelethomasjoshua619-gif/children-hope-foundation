import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Users, Heart, Zap, ArrowUpRight } from 'lucide-react';
import { adminApi } from '../../lib/api';
import { AdminStats } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .getStats()
      .then((res) => {
        if (res.data) setStats(res.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const formatMoney = (kobo: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(kobo / 100);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (error || !stats) {
    return <div className="p-12 text-center text-rose-600 font-semibold">Failed to load stats: {error}</div>;
  }

  const statCards = [
    { label: 'Total Raised', value: formatMoney(stats.totalRaised), icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Campaigns', value: stats.activeCampaigns.toLocaleString(), icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Donors', value: stats.totalDonors.toLocaleString(), icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Total Donations', value: stats.totalDonations.toLocaleString(), icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Admin Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time platform statistics and recent activity</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className={`w-10 h-10 ${card.bg} ${card.color} rounded-xl flex items-center justify-center`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{card.value}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Donations */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-bold text-slate-900">Recent Donations</h2>
          <Link to="/admin/donations" className="text-xs font-bold text-blue-600 flex items-center space-x-1">
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <th className="py-3 px-5">Donor</th>
                <th className="py-3 px-5">Campaign</th>
                <th className="py-3 px-5">Amount</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {stats.recentDonations.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400 text-sm">
                    No donations yet.
                  </td>
                </tr>
              )}
              {stats.recentDonations.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-5 font-semibold text-slate-800">
                    {d.isAnonymous ? 'Anonymous' : (d.donorName || d.donorEmail)}
                  </td>
                  <td className="py-3 px-5 text-slate-500 text-xs">{d.campaign?.title}</td>
                  <td className="py-3 px-5 font-bold text-blue-600">{formatMoney(d.amount)}</td>
                  <td className="py-3 px-5">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        d.status === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-800'
                          : d.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-slate-400 text-xs">{new Date(d.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
