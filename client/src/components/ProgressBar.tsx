import React from 'react';

interface ProgressBarProps {
  raised: number; // in kobo or main currency units
  goal: number;
  showLabels?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ raised, goal, showLabels = true }) => {
  const percentage = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

  const formatMoney = (kobo: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(kobo / 100);
  };

  return (
    <div className="space-y-2">
      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
        <div
          className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {showLabels && (
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-slate-900 font-bold">
            {formatMoney(raised)} <span className="text-slate-500 font-normal">raised</span>
          </span>
          <span className="text-blue-600 font-bold">{percentage}%</span>
          <span className="text-slate-500">
            Goal: <span className="text-slate-700 font-bold">{formatMoney(goal)}</span>
          </span>
        </div>
      )}
    </div>
  );
};
