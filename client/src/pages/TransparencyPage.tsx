import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import { campaignApi } from '../lib/api';
import { Campaign } from '../types';
import { ProgressBar } from '../components/ProgressBar';
import { formatUsd } from '../lib/currency';

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

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="max-w-3xl space-y-4">
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#99782b]">Accountability</span>
        <h1 className="font-serif text-4xl leading-[1.05] tracking-[-0.04em] text-[#16352f] sm:text-5xl">Follow the numbers as they change.</h1>
        <p className="text-base leading-7 text-[#5e7069]">
          The foundation may set a target for a campaign. Funds raised and donor counts update only after Paystack confirms a donation.
        </p>
      </div>

      <div className="space-y-8">
        <h2 className="font-serif text-3xl text-[#16352f]">Campaign funding</h2>

        {loading ? (
          <div className="h-64 animate-pulse bg-[#e7e8e1]" />
        ) : campaigns.length === 0 ? (
          <div className="border border-[#d8ddd5] bg-[#fffdf8] px-6 py-12 text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-[#99782b]" />
            <h3 className="mt-4 font-serif text-2xl text-[#16352f]">No campaigns have been published yet</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#5e7069]">When the foundation publishes a campaign, its goal, verified donations, and live progress will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#d8ddd5] bg-[#fffdf8]">
            <table className="w-full min-w-[760px] text-left">
              <thead><tr className="border-b border-[#e3e5dc] bg-[#f1f0e9] text-[10px] font-bold uppercase tracking-[0.14em] text-[#63746c]">
                  <th className="px-5 py-4">Campaign</th><th className="px-5 py-4">Raised</th><th className="px-5 py-4">Goal</th><th className="w-56 px-5 py-4">Progress</th><th className="px-5 py-4">Confirmed gifts</th><th className="px-5 py-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8e8e1] text-sm">
                {campaigns.map((c) => <tr key={c.id}>
                  <td className="px-5 py-4 font-semibold text-[#16352f]">{c.title}</td><td className="px-5 py-4 font-bold text-[#16352f]">{formatUsd(c.raisedAmount)}</td><td className="px-5 py-4 text-[#5e7069]">{c.goalAmount ? formatUsd(c.goalAmount) : 'Not set'}</td><td className="px-5 py-4"><ProgressBar raised={c.raisedAmount} goal={c.goalAmount} showLabels={false} /></td><td className="px-5 py-4 text-[#5e7069]">{c._count?.donations ?? 0}</td><td className="px-5 py-4"><a href={`/campaigns/${c.slug}`} className="inline-flex items-center gap-1 font-bold text-[#876a27]">View <ArrowUpRight className="h-3.5 w-3.5" /></a></td>
                </tr>)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
