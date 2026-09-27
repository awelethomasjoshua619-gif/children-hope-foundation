import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { Campaign } from '../types';
import { ProgressBar } from './ProgressBar';

interface CampaignCardProps {
  campaign: Campaign;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all hover:-translate-y-1 flex flex-col h-full group">
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={campaign.imageUrl || 'https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?q=80&w=800&fit=crop'}
          alt={campaign.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-blue-600 font-bold text-xs px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
          {campaign.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
        <div className="space-y-3">
          <Link to={`/campaigns/${campaign.slug}`}>
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
              {campaign.title}
            </h3>
          </Link>
          <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
            {campaign.description}
          </p>
        </div>

        <div className="space-y-4">
          <ProgressBar raised={campaign.raisedAmount} goal={campaign.goalAmount} />

          <Link
            to={`/campaigns/${campaign.slug}`}
            className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md group-hover:shadow-blue-600/30"
          >
            <Heart className="w-4 h-4 fill-current text-rose-400 group-hover:text-white transition-colors" />
            <span>Support This Cause</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
