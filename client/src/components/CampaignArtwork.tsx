import React from 'react';
import { BookOpen, Droplets, HeartPulse, Sprout, Utensils } from 'lucide-react';

const artworkByCategory: Record<string, { Icon: typeof BookOpen; eyebrow: string }> = {
  Education: { Icon: BookOpen, eyebrow: 'Learning opens doors' },
  Healthcare: { Icon: HeartPulse, eyebrow: 'Care for every child' },
  'Food Relief': { Icon: Utensils, eyebrow: 'Nourishment and care' },
  Water: { Icon: Droplets, eyebrow: 'Clean water access' },
  General: { Icon: Sprout, eyebrow: 'A place to grow' },
};

export const CampaignArtwork: React.FC<{ category: string; className?: string }> = ({ category, className = '' }) => {
  const artwork = artworkByCategory[category] ?? artworkByCategory.General;
  const { Icon } = artwork;

  return (
    <div
      role="img"
      aria-label={`${category} illustration`}
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-[#e9e8dc] ${className}`}
    >
      <div aria-hidden="true" className="absolute -right-10 -top-12 h-44 w-44 rounded-full border border-[#b79a51]/35 sm:h-56 sm:w-56" />
      <div aria-hidden="true" className="absolute -right-2 -top-4 h-32 w-32 rounded-full border border-[#b79a51]/25 sm:h-40 sm:w-40" />
      <div className="relative flex flex-col items-center gap-3 text-center text-[#16352f]">
        <span className="flex h-16 w-16 items-center justify-center rounded-full border border-[#b79a51]/40 bg-[#fffdf8]/75 text-[#8a702f] shadow-sm sm:h-20 sm:w-20">
          <Icon className="h-8 w-8 sm:h-9 sm:w-9" strokeWidth={1.5} />
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#66766a]">{artwork.eyebrow}</span>
      </div>
    </div>
  );
};
