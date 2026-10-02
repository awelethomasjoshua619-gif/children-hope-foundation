import React from 'react';

type BrandMarkProps = {
  size?: number;
  className?: string;
};

/** A small book and growing leaf, drawn in the foundation's forest and gold palette. */
export const BrandMark: React.FC<BrandMarkProps> = ({ size = 40, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    role="img"
    aria-label="Children Hope Foundation logo"
    className={`shrink-0 ${className}`}
  >
    <rect width="48" height="48" rx="15" fill="#16352F" />
    <circle cx="24" cy="10.5" r="2.5" fill="#E5C978" />
    <path d="M21 16.5c-5.7-4.4-10.2-2.6-10.2 1.2 0 3.6 4.2 5.5 9.8 3.3" fill="#E5C978" />
    <path d="M27 16.5c5.7-4.4 10.2-2.6 10.2 1.2 0 3.6-4.2 5.5-9.8 3.3" fill="#E5C978" />
    <path d="M24 20v9" stroke="#FDFCF8" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M8.5 26.5c5.7-.7 10.6.8 15.5 5.1 4.9-4.3 9.8-5.8 15.5-5.1v7c-6.1-.5-10.9 1.2-15.5 5.8-4.6-4.6-9.4-6.3-15.5-5.8v-7Z" stroke="#FDFCF8" strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M24 31.5v7.3" stroke="#E5C978" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
