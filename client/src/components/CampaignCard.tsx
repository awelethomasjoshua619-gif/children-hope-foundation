import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Campaign } from '../types';
import { ProgressBar } from './ProgressBar';
import { CampaignArtwork } from './CampaignArtwork';

interface CampaignCardProps { campaign: Campaign; }

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => (
  <article className="group flex h-full flex-col overflow-hidden border border-[#d8ddd5] bg-[#fffdf8] transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#16352f]/10">
    <Link to={`/campaigns/${campaign.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-[#e7e8e1]">
      {campaign.imageUrl ? <img src={campaign.imageUrl} alt={campaign.imageUrl.includes('-illustrative.') ? `${campaign.category} illustrative stock photo` : campaign.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" /> : <CampaignArtwork category={campaign.category} />}
      <span className="absolute left-4 top-4 bg-[#fffdf8] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6f622c]">{campaign.category}</span>
      {campaign.imageUrl?.includes('-illustrative.') && <span className="absolute bottom-3 right-3 rounded-full bg-[#102a25]/85 px-3 py-1 text-[9px] font-semibold tracking-wide text-white">Illustrative photo</span>}
    </Link>
    <div className="flex flex-1 flex-col p-6">
      <Link to={`/campaigns/${campaign.slug}`}><h3 className="font-serif text-2xl leading-7 text-[#16352f] transition group-hover:text-[#8c702b]">{campaign.title}</h3></Link>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#5e7069]">{campaign.description}</p>
      <div className="mt-7"><ProgressBar raised={campaign.raisedAmount} goal={campaign.goalAmount} /></div>
      <Link to={`/campaigns/${campaign.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#16352f] transition hover:text-[#9a7d31]">View campaign <ArrowRight className="h-4 w-4" /></Link>
    </div>
  </article>
);
