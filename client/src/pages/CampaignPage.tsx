import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, Share2, CheckCircle2 } from 'lucide-react';
import { campaignApi } from '../lib/api';
import { Campaign } from '../types';
import { ProgressBar } from '../components/ProgressBar';
import { DonateForm } from '../components/DonateForm';

export const CampaignPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    campaignApi
      .getBySlug(slug)
      .then((res) => {
        if (res.data?.campaign) {
          setCampaign(res.data.campaign);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="h-96 bg-slate-100 animate-pulse rounded-3xl" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Campaign Not Found</h2>
        <Link to="/campaigns" className="text-blue-600 font-semibold hover:underline">
          ← Back to all causes
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Link to="/campaigns" className="text-xs font-bold text-slate-500 hover:text-blue-600">
            ← Causes
          </Link>
          <span className="text-slate-300">•</span>
          <span className="bg-blue-100 text-blue-800 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            {campaign.category}
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          {campaign.title}
        </h1>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Col: Image & Story */}
        <div className="lg:col-span-7 space-y-8">
          <div className="aspect-[16/10] rounded-3xl overflow-hidden shadow-xl bg-slate-100 border border-slate-100">
            <img
              src={campaign.imageUrl || 'https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?q=80&w=800&fit=crop'}
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900">Campaign Story</h3>
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-blue-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 transition-colors"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? 'Link Copied!' : 'Share Campaign'}</span>
              </button>
            </div>

            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-line text-base">
              {campaign.story}
            </div>
          </div>
        </div>

        {/* Right Col: Progress & Donation Form */}
        <div className="lg:col-span-5 space-y-6 sticky top-28">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-md space-y-4">
            <ProgressBar raised={campaign.raisedAmount} goal={campaign.goalAmount} />
            <div className="flex justify-between text-xs text-slate-500 font-semibold pt-2 border-t border-slate-100">
              <span>Verified Donors: <strong className="text-slate-800">{campaign._count?.donations || 0}</strong></span>
              <span className="flex items-center space-x-1 text-emerald-600 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Direct Impact</span>
              </span>
            </div>
          </div>

          <DonateForm campaignId={campaign.id} campaignTitle={campaign.title} />
        </div>
      </div>
    </div>
  );
};
