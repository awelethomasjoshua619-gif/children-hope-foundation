import axios from 'axios';
import { ApiResponse, Campaign, Donation, User, AdminStats, ImpactStat } from '../types';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for clean error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// ── Shapers: adapt the current backend's responses to the old design's types ──

const toKobo = (naira: number | null | undefined) => Math.round(Number(naira ?? 0) * 100);
const toNaira = (kobo: number | null | undefined) => Number(kobo ?? 0) / 100;

function shapeCampaign(raw: any): Campaign {
  const raisedNaira = raw.raised !== undefined ? Number(raw.raised) : toNaira(raw.raisedAmount);
  const targetNaira =
    raw.targetAmount !== undefined ? Number(raw.targetAmount) : toNaira(raw.goalAmount);
  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    description: raw.summary ?? raw.description ?? '',
    story: raw.description ?? raw.story ?? '',
    summary: raw.summary ?? raw.description ?? '',
    goalAmount: toKobo(targetNaira),
    raisedAmount: toKobo(raisedNaira),
    category: raw.category,
    imageUrl: raw.coverImage ?? raw.imageUrl ?? null,
    status: raw.status,
    country: raw.country ?? null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    raised: raisedNaira,
    targetAmount: targetNaira,
    donorCount: raw.donorCount ?? raw._count?.donations ?? 0,
    progress: raw.progress,
    _count: { donations: raw.donorCount ?? raw._count?.donations ?? 0 },
  };
}

function shapeDonation(raw: any): Donation {
  return {
    id: raw.id,
    amount: toKobo(raw.amount),
    currency: raw.currency ?? 'NGN',
    donorEmail: raw.donorEmail,
    donorName: raw.donorName,
    isAnonymous: raw.anonymous ?? raw.isAnonymous ?? false,
    isRecurring: raw.isRecurring ?? false,
    status: raw.status,
    paystackRef: raw.reference ?? raw.paystackRef,
    reference: raw.reference ?? raw.paystackRef,
    campaignId: raw.campaignId,
    message: raw.message ?? null,
    paidAt: raw.paidAt ?? null,
    campaign: raw.campaign
      ? { title: raw.campaign.title, slug: raw.campaign.slug, imageUrl: raw.campaign.imageUrl ?? null }
      : undefined,
    createdAt: raw.createdAt,
  };
}

// ── API groups (old design surface, current backend underneath) ──

export const authApi = {
  register: async (data: { email: string; password: string; name: string }) => {
    const res = await api.post<{ user: User }>('/auth/register', data);
    return { success: true, data: { user: res.data.user, token: 'cookie' } } as ApiResponse<{ user: User; token: string }>;
  },
  login: async (data: { email: string; password: string }) => {
    const res = await api.post<{ user: User }>('/auth/login', data);
    return { success: true, data: { user: res.data.user, token: 'cookie' } } as ApiResponse<{ user: User; token: string }>;
  },
  logout: async () => {
    await api.post('/auth/logout');
    return { success: true } as ApiResponse;
  },
  getMe: async () => {
    const res = await api.get<{ user: User }>('/auth/me');
    return { success: true, data: { user: res.data.user } } as ApiResponse<{ user: User }>;
  },
};

export const campaignApi = {
  list: async (params?: {
    category?: string;
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const query: Record<string, string> = {};
    if (params?.category && params.category !== 'All') {
      const map: Record<string, string> = { 'Food Relief': 'FOOD' };
      query.category = map[params.category] ?? params.category.toUpperCase();
    }
    if (params?.page) query.page = String(params.page);
    if (params?.limit) query.limit = String(params.limit);
    const res = await api.get<{ campaigns: any[]; pagination?: { page: number; limit: number; total: number; pages: number } }>(
      '/campaigns',
      { params: query },
    );
    const campaigns = res.data.campaigns.map(shapeCampaign);
    const p = res.data.pagination;
    const limit = params?.limit ?? 12;
    return {
      success: true as const,
      data: {
        campaigns,
        pagination: {
          page: p?.page ?? 1,
          limit: p?.limit ?? limit,
          total: p?.total ?? campaigns.length,
          pages: p?.pages ?? Math.max(1, Math.ceil(campaigns.length / limit)),
          hasMore: p ? p.page < p.pages : false,
        },
      },
    };
  },

  /** Admin list: every campaign regardless of status. */
  listAll: async () => {
    const res = await api.get<{ campaigns: any[] }>('/campaigns/admin/all');
    const campaigns = res.data.campaigns.map(shapeCampaign);
    return { success: true as const, data: { campaigns } };
  },

  getBySlug: async (slug: string) => {
    const res = await api.get<{ campaign: any }>(`/campaigns/${slug}`);
    return { success: true as const, data: { campaign: shapeCampaign(res.data.campaign) } };
  },

  create: async (data: Partial<Campaign>) => {
    const payload = {
      title: data.title,
      slug: data.slug || undefined,
      summary: data.description,
      description: data.story || data.description,
      category: data.category ? String(data.category).toUpperCase() : 'GENERAL',
      status: data.status,
      targetAmount: toNaira(data.goalAmount),
      coverImage: data.imageUrl || undefined,
    };
    const res = await api.post('/campaigns/admin', payload);
    return { success: true as const, data: { campaign: shapeCampaign(res.data.campaign) } };
  },

  update: async (id: string, data: Partial<Campaign>) => {
    const payload: Record<string, unknown> = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.slug !== undefined) payload.slug = data.slug;
    if (data.description !== undefined) payload.summary = data.description;
    if (data.story !== undefined) payload.description = data.story;
    if (data.category !== undefined) payload.category = String(data.category).toUpperCase();
    if (data.status !== undefined) payload.status = data.status;
    if (data.goalAmount !== undefined) payload.targetAmount = toNaira(data.goalAmount);
    if (data.imageUrl !== undefined) payload.coverImage = data.imageUrl || null;
    const res = await api.patch(`/campaigns/admin/${id}`, payload);
    return { success: true as const, data: { campaign: shapeCampaign(res.data.campaign) } };
  },

  delete: async (id: string) => {
    await api.delete(`/campaigns/admin/${id}`);
    return { success: true as const } as ApiResponse;
  },
};

export const donationApi = {
  initialize: async (data: {
    amount: number; // in kobo
    campaignId: string;
    donorEmail: string;
    donorName?: string;
    isAnonymous?: boolean;
    isRecurring?: boolean;
    currency?: string;
  }) => {
    const res = await api.post<{
      reference: string;
      authorizationUrl: string;
    }>('/donations/initialize', {
      campaignId: data.campaignId,
      amount: toNaira(data.amount),
      donorEmail: data.donorEmail,
      donorName: data.donorName || 'Anonymous Friend',
      anonymous: data.isAnonymous ?? false,
      message: undefined,
    });
    return {
      success: true as const,
      data: { authorizationUrl: res.data.authorizationUrl, reference: res.data.reference },
    };
  },

  verify: async (ref: string) => {
    const res = await api.post<{ donation: any }>('/donations/verify', { reference: ref });
    const d = shapeDonation(res.data.donation);
    return {
      success: true as const,
      data: {
        donation: {
          ...d,
          campaignTitle: (res.data.donation as any).campaign?.title,
        },
      },
    };
  },

  getMyDonations: async () => {
    const res = await api.get<{ donations: any[] }>('/donations/mine');
    return { success: true as const, data: { donations: res.data.donations.map(shapeDonation) } };
  },
};

export const adminApi = {
  getStats: async () => {
    const res = await api.get<{
      stats: {
        totalRaised: number;
        donationCount: number;
        donorCount: number;
        activeCampaignCount: number;
        pendingDonationCount: number;
        avgDonation: number;
        monthRaised: number;
        monthCount: number;
      };
      recentDonations: any[];
    }>('/admin/stats');

    const stats: AdminStats = {
      totalDonations: res.data.stats.donationCount,
      totalRaised: toKobo(res.data.stats.totalRaised),
      thisMonthRaised: toKobo(res.data.stats.monthRaised),
      thisMonthCount: res.data.stats.monthCount,
      totalDonors: res.data.stats.donorCount,
      activeCampaigns: res.data.stats.activeCampaignCount,
      recentDonations: res.data.recentDonations.map((d) => ({
        ...shapeDonation(d),
        campaign: { title: d.campaignTitle },
      })) as any,
    };
    return { success: true as const, data: stats };
  },

  getDonations: async (params?: { page?: number; status?: string; q?: string }) => {
    const res = await api.get<{
      donations: any[];
      pagination: { page: number; pages: number; total: number };
    }>('/admin/donations', { params });
    return {
      success: true as const,
      data: {
        donations: res.data.donations.map(shapeDonation),
        pagination: {
          page: res.data.pagination.page,
          limit: 20,
          total: res.data.pagination.total,
          pages: res.data.pagination.pages,
        },
      },
    };
  },

  exportCsvUrl: () => '/api/admin/donations/export',
};

export const impactApi = {
  get: async () => {
    const res = await api.get<{ stats: ImpactStat[]; settings: Record<string, string> }>('/impact');
    return { success: true as const, data: res.data };
  },

  updateStat: async (id: string, data: { label?: string; value?: number; icon?: string; sortOrder?: number }) => {
    const res = await api.put(`/impact/stats/${id}`, data);
    return { success: true as const, data: res.data };
  },

  updateSettings: async (data: Record<string, string>) => {
    const res = await api.put('/impact/settings', data);
    return { success: true as const, data: res.data };
  },
};

export const contactApi = {
  send: async (data: { name: string; email: string; subject: string; message: string }) => {
    const res = await api.post('/contact', data);
    return { success: true, message: (res.data as any).message } as ApiResponse;
  },
};
