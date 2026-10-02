import React from 'react';
import { formatUsd } from '../lib/currency';

interface ProgressBarProps {
  raised: number; // USD cents
  goal: number | null;
  showLabels?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ raised, goal, showLabels = true }) => {
  const percentage = goal && goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : null;

  return (
    <div className="space-y-2">
      <div className="h-1.5 w-full overflow-hidden bg-[#e4e6de]">
        <div
          className="h-full bg-[#b28c32] transition-all duration-700 ease-out"
          style={{ width: `${percentage ?? 0}%` }}
        />
      </div>

      {showLabels && (
        <div className="flex items-center justify-between gap-2 text-xs font-semibold">
          <span className="font-bold text-[#16352f]">
            {formatUsd(raised)} <span className="font-normal text-[#718078]">raised</span>
          </span>
          {goal ? <span className="shrink-0 font-bold text-[#97752a]">{percentage}%</span> : <span className="shrink-0 text-[#718078]">No target set</span>}
          {goal ? <span className="shrink-0 text-[#718078]">Goal: <span className="font-bold text-[#40564d]">{formatUsd(goal)}</span></span> : null}
        </div>
      )}
    </div>
  );
};
