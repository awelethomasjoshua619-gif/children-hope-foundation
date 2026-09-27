import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Users, Droplets, BookOpen, Utensils, ArrowRight } from 'lucide-react';
import { campaignApi, impactApi } from '../lib/api';
import { Campaign, ImpactStat } from '../types';
import { CampaignCard } from '../components/CampaignCard';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Droplets,
  BookOpen,
  Utensils,
  Users,
};

function formatStat(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
  if (value >= 100_000) return `${Math.round(value / 1000)}K`;
  return value.toLocaleString();
}

function renderHeadline(text: string): React.ReactNode {
  // The last comma-separated phrase is highlighted in blue, matching the original design.
  const parts = text.split(',');
  if (parts.length < 2) return text;
  const head = parts.slice(0, -1).join(',');
  const tail = parts[parts.length - 1];
  return (
    <>
      {head}, <span className="text-blue-600">{tail.trim()}</span>
    </>
  );
}

export const HomePage: React.FC = () => {
  const [featuredCampaigns, setFeaturedCampaigns] = useState<Campaign[]>([]);
  const [impactStats, setImpactStats] = useState<ImpactStat[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    campaignApi
      .list({ limit: 3 })
      .then((res) => {
        if (res.data?.campaigns) {
          setFeaturedCampaigns(res.data.campaigns);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    impactApi
      .get()
      .then((res) => {
        if (res.data?.stats) setImpactStats(res.data.stats);
        if (res.data?.settings) setSettings(res.data.settings);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-gradient-to-b from-blue-50/50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Col */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-blue-100/70 border border-blue-200 text-blue-800 text-xs font-extrabold px-4 py-2 rounded-full uppercase tracking-wider">
                <Heart className="w-3.5 h-3.5 fill-current text-blue-600" />
                <span>{settings.hero_headline_badge ?? 'Empowering Communities Across Africa'}</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                {renderHeadline(settings.hero_headline ?? 'Every Child Deserves Hope, Education & Clean Water.')}
              </h1>

              <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Join thousands of monthly donors supporting clean water drilling, emergency food relief, schools, and medical care in underserved communities across Africa.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/campaigns"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-2xl text-base shadow-xl shadow-blue-600/30 transition-all hover:-translate-y-0.5 text-center"
                >
                  Explore Causes & Donate
                </Link>
                <Link
                  to="/transparency"
                  className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 font-bold px-8 py-4 rounded-2xl text-base border border-slate-200 shadow-sm transition-colors text-center"
                >
                  How Money Is Used
                </Link>
              </div>

              {/* Trust Callout */}
              <div className="pt-6 border-t border-slate-200 flex items-center justify-center lg:justify-start space-x-6 text-xs text-slate-500 font-semibold">
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>100% Verified Impact</span>
                </div>
                <div>•</div>
                <div>Tax-Deductible Receipts</div>
                <div>•</div>
                <div>Paystack Secure</div>
              </div>
            </div>

            {/* Right Col: Hero Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&fit=crop"
                  alt="Children smiling"
                  className="w-full h-[460px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex flex-col justify-end p-8 text-white">
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-300">Active Impact</span>
                  <h4 className="text-2xl font-bold mt-1">{settings.hero_card_title ?? '1,000+ Children Enrolled for 2024'}</h4>
                  <p className="text-xs text-slate-300 mt-2">Thanks to your monthly contributions across Nigeria and East Africa.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats Section — live from DB */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-[3rem] p-10 sm:p-16 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center relative z-10">
            {(impactStats.length > 0
              ? impactStats
              : [
                  { id: '1', key: 'wells', label: 'Clean Water Wells', value: 0, icon: 'Droplets', sortOrder: 1 },
                  { id: '2', key: 'students', label: 'Students Supported', value: 0, icon: 'BookOpen', sortOrder: 2 },
                  { id: '3', key: 'meals', label: 'Meals Served', value: 0, icon: 'Utensils', sortOrder: 3 },
                  { id: '4', key: 'patients', label: 'Medical Patients', value: 0, icon: 'Users', sortOrder: 4 },
                ]
            ).map((stat, i) => {
              const Icon = ICONS[stat.icon] ?? Heart;
              const palette = [
                'bg-blue-500/20 text-blue-400',
                'bg-emerald-500/20 text-emerald-400',
                'bg-amber-500/20 text-amber-400',
                'bg-rose-500/20 text-rose-400',
              ];
              return (
                <div key={stat.id} className="space-y-2">
                  <div className={`w-12 h-12 ${palette[i % 4]} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-4xl font-black tracking-tight text-white">{formatStat(stat.value)}</div>
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Campaigns Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Urgent Needs</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Featured Campaigns</h2>
          </div>
          <Link
            to="/campaigns"
            className="mt-4 md:mt-0 font-bold text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>View All Causes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-slate-100 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </section>

      {/* Transparency Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-blue-600 rounded-3xl p-10 md:p-14 text-white flex flex-col md:flex-row items-center justify-between shadow-xl shadow-blue-600/20">
          <div className="space-y-3 text-center md:text-left mb-6 md:mb-0">
            <h3 className="text-2xl md:text-3xl font-extrabold">100% Financial Transparency Guarantee</h3>
            <p className="text-blue-100 max-w-xl text-sm leading-relaxed">
              Every Naira and Dollar donated is tracked directly to on-the-ground projects. Download our annual impact reports and audit summaries at any time.
            </p>
          </div>
          <Link
            to="/transparency"
            className="bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl hover:bg-slate-100 transition-colors shadow-md shrink-0"
          >
            Review Financials
          </Link>
        </div>
      </section>
    </div>
  );
};
