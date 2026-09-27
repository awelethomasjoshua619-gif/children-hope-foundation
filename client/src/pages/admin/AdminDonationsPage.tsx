import React, { useEffect, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { adminApi } from '../../lib/api';
import { Donation } from '../../types';

const STATUSES = ['ALL', 'SUCCESS', 'PENDING', 'FAILED', 'ABANDONED'];

export const AdminDonationsPage: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('ALL');
  const [query, setQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    adminApi
      .getDonations({ status: status === 'ALL' ? undefined : status, q: query || undefined })
      .then((res) => {
        if (res.data?.donations) setDonations(res.data.donations);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status, query]);

  const formatMoney = (kobo: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(kobo / 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Donations</h1>
          <p className="text-sm text-slate-500 mt-1">{donations.length} records</p>
        </div>
        <a
          href={adminApi.exportCsvUrl()}
          className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-md transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </a>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search donor, email or reference..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-sm bg-white"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-sm bg-white font-semibold"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === 'ALL' ? 'All statuses' : s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <th className="py-3 px-5">Reference</th>
                <th className="py-3 px-5">Donor</th>
                <th className="py-3 px-5">Campaign</th>
                <th className="py-3 px-5">Amount</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {donations.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No donations match these filters.
                  </td>
                </tr>
              )}
              {donations.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-5 font-mono text-xs text-slate-500">{d.paystackRef}</td>
                  <td className="py-3 px-5">
                    <div className="font-semibold text-slate-800">
                      {d.isAnonymous ? 'Anonymous' : d.donorName || '—'}
                    </div>
                    <div className="text-xs text-slate-400">{d.donorEmail}</div>
                  </td>
                  <td className="py-3 px-5 text-slate-600 text-xs">{d.campaign?.title}</td>
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
                  <td className="py-3 px-5 text-slate-400 text-xs">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
