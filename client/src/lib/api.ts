import axios from 'axios';
import { ApiResponse, Campaign, Donation, DonationReceipt, User, AdminStats, ImpactStat } from '../types';

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

export const authApi = {
  register: async (data: { email: string; password: string; name: string }) => {
    const res = await api.post<ApiResponse<{ user: User }>>('/auth/register', data);
    return res.data;
  },
  login: async (data: { email: string; password: string }) => {
    const res = await api.post<ApiResponse<{ user: User }>>('/auth/login', data);
    return res.data;
  },
  logout: async () => {
    const res = await api.post<ApiResponse>('/auth/logout');
    return res.data;
  },
  getMe: async () => {
    const res = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return res.data;
  },
};

export const campaignApi = {
  list: async (params?: { category?: string; page?: number; limit?: number; status?: string }) => {
    const res = await api.get<
      ApiResponse<{
        campaigns: Campaign[];
        pagination: { page: number; limit: number; total: number; pages: number };
      }>
    >('/campaigns', { params });
    return res.data;
  },
  getBySlug: async (slug: string) => {
    const res = await api.get<ApiResponse<{ campaign: Campaign }>>(`/campaigns/${slug}`);
    return res.data;
  },
  create: async (data: Partial<Campaign>) => {
    const res = await api.post<ApiResponse<{ campaign: Campaign }>>('/campaigns', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Campaign>) => {
    const res = await api.put<ApiResponse<{ campaign: Campaign }>>(`/campaigns/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete<ApiResponse>(`/campaigns/${id}`);
    return res.data;
  },
};

export const donationApi = {
  initialize: async (data: {
    amount: number; // USD cents
    campaignId: string;
    donorEmail: string;
    donorName?: string;
    isAnonymous?: boolean;
    currency?: string;
  }) => {
    const res = await api.post<
      ApiResponse<{ authorizationUrl: string; reference: string }>
    >('/donations/initialize', data);
    return res.data;
  },
  verify: async (ref: string) => {
    const res = await api.get<ApiResponse<{ donation?: DonationReceipt; pending?: boolean }>>(`/donations/verify/${ref}`);
    return res.data;
  },
  getMyDonations: async () => {
    const res = await api.get<ApiResponse<{ donations: Donation[] }>>('/donations/mine');
    return res.data;
  },
};

export const adminApi = {
  getStats: async () => {
    const res = await api.get<ApiResponse<AdminStats>>('/admin/stats');
    return res.data;
  },
  getDonations: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    campaignId?: string;
    donorEmail?: string;
    q?: string;
  }) => {
    const res = await api.get<
      ApiResponse<{
        donations: Donation[];
        pagination: { page: number; limit: number; total: number; pages: number };
      }>
    >('/admin/donations', { params });
    return res.data;
  },
  exportCsvUrl: (params?: Record<string, string>) => {
    const query = new URLSearchParams({ ...params, export: 'csv' }).toString();
    return `/api/admin/donations?${query}`;
  },
};

export const contactApi = {
  send: async (data: { name: string; email: string; subject: string; message: string }) => {
    const res = await api.post<ApiResponse>('/contact', data);
    return res.data;
  },
};

export const impactApi = {
  get: async () => {
    const res = await api.get<ApiResponse<{ stats: ImpactStat[]; settings: Record<string, string> }>>('/impact');
    return res.data;
  },
  updateStat: async (id: string, data: Partial<ImpactStat>) => {
    const res = await api.put<ApiResponse<{ stat: ImpactStat }>>(`/impact/stats/${id}`, data);
    return res.data;
  },
  updateSettings: async (data: Record<string, string>) => {
    const res = await api.put<ApiResponse<{ settings: Record<string, string> }>>('/impact/settings', data);
    return res.data;
  },
};
