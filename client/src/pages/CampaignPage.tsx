import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, Share2, CheckCircle2 } from 'lucide-react';
import { campaignApi } from '../lib/api';
import { Campaign } from '../types';
import { ProgressBar } from '../components/ProgressBar';
import { DonateForm } from '../components/DonateForm';
import { CampaignArtwork } from '../components/CampaignArtwork';

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
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Left Col: Image & Story */}
        <div className="lg:col-span-7 space-y-8">
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-slate-100 bg-slate-100 shadow-xl">
            {campaign.imageUrl ? <img src={campaign.imageUrl} alt={campaign.imageUrl.includes('-illustrative.') ? `${campaign.category} illustrative stock photo` : campaign.title} className="h-full w-full object-cover" /> : <CampaignArtwork category={campaign.category} />}
            {campaign.imageUrl?.includes('-illustrative.') && <span className="absolute bottom-4 left-4 rounded-full bg-[#102a25]/85 px-3 py-1.5 text-[10px] font-semibold tracking-wide text-white">Illustrative photo · not a project photo</span>}
          </div>

          <div className="bg-white p-5 sm:p-8 md:p-10 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col items-start gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
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
              {campaign.story || campaign.description}
            </div>
          </div>
        </div>

        {/* Right Col: Progress & Donation Form */}
        <div className="space-y-6 lg:sticky lg:top-28 lg:col-span-5">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-md space-y-4">
            <ProgressBar raised={campaign.raisedAmount} goal={campaign.goalAmount} />
            <div className="flex flex-col gap-2 border-t border-slate-100 pt-2 text-xs font-semibold text-slate-500 sm:flex-row sm:justify-between">
              <span>Verified Donors: <strong className="text-slate-800">{campaign._count?.donations || 0}</strong></span>
                <span className="flex items-center space-x-1 text-emerald-600 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Confirmed payment totals</span>
              </span>
            </div>
          </div>

          <DonateForm campaignId={campaign.id} campaignTitle={campaign.title} />
        </div>
      </div>
    </div>
  );
};
