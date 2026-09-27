export interface User {
  id: string;
  email: string;
  name: string;
  role: 'DONOR' | 'ADMIN';
  createdAt?: string;
}

export interface Campaign {
  id: string;
  title: string;
  slug: string;
  description: string;
  story?: string;
  goalAmount: number; // in kobo
  raisedAmount: number; // in kobo
  category: string;
  imageUrl?: string | null;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'DRAFT' | 'ARCHIVED';
  createdAt: string;
  updatedAt?: string;
  country?: string | null;
  summary?: string;
  raised?: number; // naira (compat with newer API)
  targetAmount?: number; // naira (compat)
  donorCount?: number;
  progress?: number;
  _count?: {
    donations: number;
  };
}

export interface Donation {
  id: string;
  amount: number; // in kobo
  currency: string;
  donorEmail: string;
  donorName?: string | null;
  isAnonymous: boolean;
  isRecurring: boolean;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'ABANDONED';
  paystackRef: string;
  reference?: string;
  campaignId: string;
  message?: string | null;
  paidAt?: string | null;
  campaign?: {
    title: string;
    slug: string;
    imageUrl?: string | null;
  };
  createdAt: string;
}

export interface AdminStats {
  totalDonations: number;
  totalRaised: number; // in kobo
  thisMonthRaised: number;
  thisMonthCount: number;
  totalDonors: number;
  activeCampaigns: number;
  recentDonations: (Donation & { campaign: { title: string } })[];
}

export interface ImpactStat {
  id: string;
  key: string;
  label: string;
  value: number;
  icon: string;
  sortOrder: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}
