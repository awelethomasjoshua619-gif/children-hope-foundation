import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { campaignApi } from '../lib/api';
import { Campaign } from '../types';
import { CampaignCard } from '../components/CampaignCard';

export const HomePage: React.FC = () => {
  const [featuredCampaigns, setFeaturedCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    campaignApi.list({ limit: 3 }).then((res) => setFeaturedCampaigns(res.data?.campaigns ?? [])).catch(() => setFeaturedCampaigns([])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="overflow-hidden bg-[#f7f5ef]">
      <section className="bg-[#16352f] pb-12 pt-10 text-white sm:pb-16 lg:pb-20 lg:pt-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.02fr_.98fr] lg:items-center lg:gap-16 lg:px-8">
          <div className="max-w-2xl">
            <div className="mb-6 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#ddcb8d]"><span className="h-px w-8 bg-[#ddcb8d]" />Children Hope Foundation</div>
            <h1 className="max-w-xl font-serif text-4xl leading-[1.02] tracking-[-0.045em] text-[#fffdf7] sm:text-6xl lg:text-7xl">A future where every child can thrive.</h1>
            <p className="mt-7 max-w-lg text-base leading-8 text-[#d6e0d9] sm:text-lg">Our mission is to support children in Africa through education, healthcare, and food assistance. Campaigns and funding totals are published here as they are established and confirmed.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link to="/campaigns" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#d8b661] px-6 py-3.5 text-sm font-bold text-[#16352f] transition hover:bg-[#eed286]">Browse campaigns <ArrowUpRight className="h-4 w-4" /></Link>
              <Link to="/transparency" className="inline-flex items-center justify-center gap-2 rounded-full border border-[#789087] px-6 py-3.5 text-sm font-bold text-white transition hover:border-[#d8b661] hover:text-[#f4df9d]">See our approach</Link>
            </div>
            <div className="mt-11 flex flex-wrap gap-x-7 gap-y-3 border-t border-white/15 pt-6 text-xs font-medium text-[#cedad3]">
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#d8b661]" /> Campaign totals update after verified payments</span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="absolute -right-8 -top-8 hidden h-40 w-40 rounded-full border border-[#d8b661]/50 lg:block" />
            <div className="relative flex min-h-[340px] flex-col justify-between overflow-hidden rounded-t-[6rem] rounded-bl-[5rem] rounded-br-[2rem] border border-white/20 bg-[#23473f] p-6 pt-24 shadow-2xl shadow-black/20 sm:min-h-[500px] sm:rounded-t-[9rem] sm:rounded-bl-[7rem] sm:p-10 sm:pt-36">
              <div className="absolute -right-20 top-20 h-72 w-72 rounded-full border border-[#d8b661]/40" /><div className="absolute -right-8 top-32 h-48 w-48 rounded-full border border-[#d8b661]/25" />
              <div className="relative max-w-xs"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#ddcb8d]">A clear place to start</p><h2 className="mt-4 font-serif text-3xl leading-tight text-[#fffdf7] sm:text-4xl">Education. Healthcare. Food support.</h2></div>
              <div className="relative border-t border-white/20 pt-5"><p className="max-w-sm text-sm leading-6 text-[#d6e0d9]">Campaign details, targets, and confirmed contributions will appear here when published.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mb-11 flex flex-col justify-between gap-6 md:flex-row md:items-end"><div className="max-w-xl"><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#99782b]">Where help is needed now</p><h2 className="mt-3 font-serif text-4xl leading-none tracking-[-0.035em] text-[#16352f] sm:text-5xl">Ways to make a direct difference.</h2></div><Link to="/campaigns" className="inline-flex items-center gap-2 text-sm font-bold text-[#16352f] hover:text-[#99782b]">Explore all campaigns <ArrowRight className="h-4 w-4" /></Link></div>
        {loading ? <div className="grid grid-cols-1 gap-6 md:grid-cols-3">{[1, 2, 3].map((i) => <div key={i} className="h-[430px] animate-pulse bg-[#e7e8e1]" />)}</div> : featuredCampaigns.length === 0 ? <div className="border border-[#d8ddd5] bg-[#fffdf8] px-6 py-12 text-center"><h3 className="font-serif text-2xl text-[#16352f]">No active campaigns yet</h3><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#5e7069]">Campaigns will appear here when they are created and published.</p></div> : <div className="grid grid-cols-1 gap-6 md:grid-cols-3">{featuredCampaigns.map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} />)}</div>}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28"><div className="grid gap-8 border-y border-[#d8ddd5] py-10 md:grid-cols-[.75fr_1.25fr] md:gap-16"><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7c6628]">Accountability</p><h2 className="mt-3 font-serif text-3xl leading-tight text-[#16352f]">See the figures that are actually recorded.</h2></div><div><p className="max-w-xl text-sm leading-7 text-[#4f625a]">Campaign totals on this site change only after a payment provider confirms a donation. Any campaign target is shown separately from money received.</p><Link to="/transparency" className="mt-5 inline-flex items-center gap-2 border-b border-[#16352f] pb-1 text-sm font-bold text-[#16352f] hover:border-[#99782b] hover:text-[#99782b]">View campaign funding <ArrowRight className="h-4 w-4" /></Link></div></div></section>
    </div>
  );
};
