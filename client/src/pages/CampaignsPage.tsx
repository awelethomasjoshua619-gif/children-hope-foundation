import React, { useState, useEffect } from 'react';
import { campaignApi } from '../lib/api';
import { Campaign } from '../types';
import { CampaignCard } from '../components/CampaignCard';

const CATEGORIES = ['All', 'Education', 'Healthcare', 'Food Relief'];

export const CampaignsPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const categoryFilter = selectedCategory === 'All' ? undefined : selectedCategory;

    campaignApi
      .list({ category: categoryFilter, limit: 12 })
      .then((res) => {
        if (res.data?.campaigns) {
          setCampaigns(res.data.campaigns);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24 space-y-12">
      <div className="max-w-3xl space-y-4">
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#99782b]">Current work</span>
        <h1 className="font-serif text-4xl leading-[1.05] tracking-[-0.04em] text-[#16352f] sm:text-5xl">Choose where your support can go.</h1>
        <p className="max-w-2xl text-base leading-relaxed text-[#5e7069]">
          Browse the foundation’s education, healthcare, and food-support campaigns. Donation totals show only payments confirmed by Paystack; a fundraising target appears only when one has been set.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap justify-start gap-2 sm:justify-center sm:gap-3">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all border sm:px-6 ${
              selectedCategory === category
                ? 'bg-[#16352f] text-white border-[#16352f]'
                : 'bg-[#fffdf8] text-[#52655f] border-[#d8ddd5] hover:bg-[#ece9df]'
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
            <div key={i} className="h-96 bg-[#e7e8e1] animate-pulse" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 bg-[#fffdf8] border border-[#d8ddd5]">
          <p className="text-[#6d7d75] font-semibold">No active campaigns found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  );
};
