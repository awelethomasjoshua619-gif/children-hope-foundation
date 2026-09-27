import React, { useEffect, useState } from 'react';
import { ShieldCheck, FileText, Scale, Droplets, BookOpen, Utensils } from 'lucide-react';
import { campaignApi } from '../lib/api';
import { Campaign } from '../types';
import { ProgressBar } from '../components/ProgressBar';

export const TransparencyPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    campaignApi
      .list({ limit: 12 })
      .then((res) => {
        if (res.data?.campaigns) setCampaigns(res.data.campaigns);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatMoney = (kobo: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(kobo / 100);

  const allocations = [
    { icon: Droplets, label: 'Water & Sanitation', pct: 30, color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: BookOpen, label: 'Education & Schools', pct: 30, color: 'text-violet-600', bg: 'bg-violet-50' },
    { icon: Utensils, label: 'Food & Nutrition', pct: 25, color: 'text-amber-600', bg: 'bg-amber-50' },
    { icon: Scale, label: 'Operations & Audit', pct: 15, color: 'text-slate-600', bg: 'bg-slate-100' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Accountability</span>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">100% Financial Transparency</h1>
        <p className="text-slate-600 leading-relaxed">
          Every Naira is tracked from donation to delivery. Here is exactly how funds are allocated and how every
          campaign is verified on the ground.
        </p>
      </div>

      {/* Allocation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {allocations.map((a) => (
          <div key={a.label} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center space-y-4">
            <div className={`w-12 h-12 ${a.bg} ${a.color} rounded-2xl flex items-center justify-center mx-auto`}>
              <a.icon className="w-6 h-6" />
            </div>
            <div className="text-3xl font-black text-slate-900">{a.pct}%</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{a.label}</div>
            <ProgressBar raised={a.pct} goal={100} showLabels={false} />
          </div>
        ))}
      </div>

      {/* Live campaign funding */}
      <div className="space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Live Data</span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Campaign Funding Tracker</h2>
          </div>
        </div>

        {loading ? (
          <div className="h-64 bg-slate-100 animate-pulse rounded-3xl" />
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <th className="py-3 px-5">Campaign</th>
                  <th className="py-3 px-5">Raised</th>
                  <th className="py-3 px-5">Goal</th>
                  <th className="py-3 px-5 w-56">Progress</th>
                  <th className="py-3 px-5">Donors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="py-4 px-5 font-bold text-slate-900">{c.title}</td>
                    <td className="py-4 px-5 font-bold text-emerald-600">{formatMoney(c.raisedAmount)}</td>
                    <td className="py-4 px-5 text-slate-500">{formatMoney(c.goalAmount)}</td>
                    <td className="py-4 px-5">
                      <ProgressBar raised={c.raisedAmount} goal={c.goalAmount} showLabels={false} />
                    </td>
                    <td className="py-4 px-5 text-slate-500">{c._count?.donations ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Commitments */}
      <div className="bg-slate-900 rounded-3xl p-10 md:p-14 text-white grid md:grid-cols-2 gap-10">
        <div className="space-y-4">
          <ShieldCheck className="w-10 h-10 text-emerald-400" />
          <h3 className="text-2xl font-extrabold">Our Commitments</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Trust is earned with receipts. Payments are processed by Paystack — we never see or store your card
            details, and every donor receives an instant emailed receipt with a unique reference.
          </p>
        </div>
        <ul className="space-y-4 text-sm">
          {[
            'Every donor receives an emailed receipt with a unique reference',
            'Campaign progress is computed live from verified donations only',
            'Annual reports published each January covering programs and spending',
            'Independent annual audit of all foundation accounts',
          ].map((item) => (
            <li key={item} className="flex items-start space-x-3 text-slate-300">
              <FileText className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
