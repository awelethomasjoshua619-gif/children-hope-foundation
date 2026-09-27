import React, { useState, useEffect } from 'react';
import { campaignApi } from '../lib/api';
import { Campaign } from '../types';
import { CampaignCard } from '../components/CampaignCard';

const CATEGORIES = ['All', 'Education', 'Healthcare', 'Food Relief', 'Water', 'Emergency', 'General'];

export const CampaignsPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    const categoryFilter = selectedCategory === 'All' ? undefined : selectedCategory;

    campaignApi
      .list({ category: categoryFilter, limit: 12 })
      .then((res) => {
        if (res.data?.campaigns) {
          setCampaigns(res.data.campaigns);
          const p = (res.data as any).pagination;
          setHasMore(p ? p.page < p.pages : false);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  const loadMore = () => {
    setLoadingMore(true);
    const categoryFilter = selectedCategory === 'All' ? undefined : selectedCategory;
    campaignApi
      .list({ category: categoryFilter, limit: 12, page: page + 1 })
      .then((res) => {
        if (res.data?.campaigns) {
          setCampaigns((prev) => [...prev, ...res.data!.campaigns]);
          setPage((p) => p + 1);
          const p = (res.data as any).pagination;
          setHasMore(p ? p.page < p.pages : false);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Active Causes</span>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Support an Active Campaign</h1>
        <p className="text-slate-600 text-base leading-relaxed">
          Choose a cause close to your heart. 100% of your gift directly funds supplies, clean water wells, healthcare clinics, and school fees.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex justify-center flex-wrap gap-3">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all border ${
              selectedCategory === category
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/30'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Campaign Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 bg-slate-100 animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
          <p className="text-slate-500 font-semibold">No active campaigns found in this category.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
          {hasMore && (
            <div className="text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="bg-white hover:bg-slate-50 text-slate-700 font-bold px-8 py-4 rounded-2xl border border-slate-200 shadow-sm transition-colors disabled:opacity-50"
              >
                {loadingMore ? 'Loading…' : 'Load More Causes'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
