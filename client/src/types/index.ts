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
  goalAmount: number | null; // Optional USD cents target
  raisedAmount: number; // confirmed USD cents
  category: string;
  imageUrl?: string | null;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  createdAt: string;
  _count?: {
    donations: number;
  };
}

export interface Donation {
  id: string;
  amount: number; // smallest unit of currency (USD cents for new donations)
  currency: string;
  donorEmail: string;
  donorName?: string | null;
  isAnonymous: boolean;
  isRecurring: boolean;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  paystackRef: string;
  campaignId: string;
  campaign?: {
    title: string;
    slug: string;
    imageUrl?: string | null;
  };
  createdAt: string;
}

export interface AdminStats {
  totalDonations: number;
  totalRaised: number; // USD cents
  thisMonthRaised: number;
  thisMonthCount: number;
  totalDonors: number;
  activeCampaigns: number;
  recentDonations: (Donation & { campaign: { title: string } })[];
}

export interface DonationReceipt {
  id: string;
  amount: number;
  currency: string;
  campaignTitle: string;
  donorName: string | null;
  donorEmail: string;
  reference: string;
  date: string;
}

export interface ImpactStat {
  id: string;
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
