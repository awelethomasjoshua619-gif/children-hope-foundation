import type { Request, Response } from 'express';
import { Prisma, CampaignCategory, CampaignStatus } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

type CampaignWithStats = Prisma.CampaignGetPayload<object> & {
  raised: number;
  donorCount: number;
  progress: number;
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

async function attachStats(campaigns: Array<Prisma.CampaignGetPayload<object>>): Promise<CampaignWithStats[]> {
  return Promise.all(
    campaigns.map(async (c) => {
      const agg = await prisma.donation.aggregate({
        where: { campaignId: c.id, status: 'SUCCESS' },
        _sum: { amount: true },
        _count: true,
      });
      const raised = Number(agg._sum.amount ?? 0);
      const target = Number(c.targetAmount);
      return {
        ...c,
        raised,
        donorCount: agg._count,
        progress: target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0,
      };
    }),
  );
}

// ── Public ─────────────────────────────────────────────────

export async function listPublicCampaigns(req: Request, res: Response): Promise<void> {
  const query = z
    .object({
      category: z.nativeEnum(CampaignCategory).optional(),
      q: z.string().trim().max(100).optional(),
      status: z.enum(['active', 'completed']).optional(),
      sort: z.enum(['newest', 'ending', 'most-funded']).optional(),
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(50).default(12),
    })
    .parse(req.query);

  const where: Prisma.CampaignWhereInput = {
    status: query.status === 'completed' ? CampaignStatus.COMPLETED : CampaignStatus.ACTIVE,
    ...(query.category ? { category: query.category } : {}),
    ...(query.q
      ? { OR: [{ title: { contains: query.q, mode: 'insensitive' } }, { summary: { contains: query.q, mode: 'insensitive' } }] }
      : {}),
  };

  const campaigns = await prisma.campaign.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: (query.page - 1) * query.limit,
    take: query.limit,
  });
  const total = await prisma.campaign.count({ where });
  const withStats = await attachStats(campaigns);

  if (query.sort === 'most-funded') {
    withStats.sort((a, b) => b.raised - a.raised);
  }

  res.json({
    campaigns: withStats,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      pages: Math.max(1, Math.ceil(total / query.limit)),
    },
  });
}

export async function getPublicCampaign(req: Request, res: Response): Promise<void> {
  const { slug } = req.params;
  const campaign = await prisma.campaign.findUnique({ where: { slug } });
  if (!campaign || campaign.status === 'DRAFT' || campaign.status === 'ARCHIVED') {
    throw new AppError(404, 'Campaign not found');
  }

  const [withStats] = await attachStats([campaign]);

  const donations = await prisma.donation.findMany({
    where: { campaignId: campaign.id, status: 'SUCCESS' },
    orderBy: { createdAt: 'desc' },
    take: 12,
    select: { id: true, donorName: true, anonymous: true, amount: true, message: true, createdAt: true },
  });

  res.json({
    campaign: withStats,
    donations: donations.map((d) => ({
      ...d,
      amount: Number(d.amount),
      donorName: d.anonymous ? 'Anonymous' : d.donorName,
    })),
  });
}

// ── Admin CRUD ─────────────────────────────────────────────

const upsertSchema = z.object({
  title: z.string().trim().min(3).max(120),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug may only contain lowercase letters, numbers and dashes')
    .max(60)
    .optional(),
  summary: z.string().trim().min(10).max(220),
  description: z.string().trim().min(30),
  category: z.nativeEnum(CampaignCategory),
  status: z.nativeEnum(CampaignStatus).default(CampaignStatus.DRAFT),
  targetAmount: z.number().positive('Target must be greater than zero').max(1_000_000_000),
  coverImage: z.string().url().optional().or(z.literal('')),
  country: z.string().trim().max(60).optional().or(z.literal('')),
});

export async function adminListCampaigns(_req: Request, res: Response): Promise<void> {
  const campaigns = await prisma.campaign.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ campaigns: await attachStats(campaigns) });
}

export async function createCampaign(req: Request, res: Response): Promise<void> {
  const body = upsertSchema.parse(req.body);

  let slug = body.slug && body.slug.length > 0 ? body.slug : slugify(body.title);
  const clash = await prisma.campaign.findUnique({ where: { slug } });
  if (clash) slug = `${slug}-${Date.now().toString(36)}`;

  const campaign = await prisma.campaign.create({
    data: {
      title: body.title,
      slug,
      summary: body.summary,
      description: body.description,
      category: body.category,
      status: body.status,
      targetAmount: body.targetAmount,
      coverImage: body.coverImage || null,
      country: body.country || null,
    },
  });

  res.status(201).json({ campaign });
}

export async function updateCampaign(req: Request, res: Response): Promise<void> {
  const body = upsertSchema.partial().parse(req.body);
  const { id } = req.params;

  const existing = await prisma.campaign.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Campaign not found');

  let slug = existing.slug;
  if (body.slug !== undefined) {
    slug = body.slug.length > 0 ? body.slug : slugify(body.title ?? existing.title);
    const clash = await prisma.campaign.findFirst({ where: { slug, NOT: { id } } });
    if (clash) throw new AppError(409, 'That slug is already in use');
  }

  const campaign = await prisma.campaign.update({
    where: { id },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      slug,
      ...(body.summary !== undefined ? { summary: body.summary } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.category !== undefined ? { category: body.category } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.targetAmount !== undefined ? { targetAmount: body.targetAmount } : {}),
      ...(body.coverImage !== undefined ? { coverImage: body.coverImage || null } : {}),
      ...(body.country !== undefined ? { country: body.country || null } : {}),
    },
  });

  res.json({ campaign });
}

export async function deleteCampaign(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const existing = await prisma.campaign.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new AppError(404, 'Campaign not found');

  try {
    await prisma.campaign.delete({ where: { id } });
  } catch {
    throw new AppError(409, 'Campaign has donations recorded against it — archive it instead of deleting.');
  }

  res.json({ ok: true });
}
