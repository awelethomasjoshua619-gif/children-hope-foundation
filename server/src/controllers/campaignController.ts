import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const campaignSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  story: z.string().min(50, 'Story must be at least 50 characters'),
  goalAmount: z.number().int().positive('Goal amount must be positive').nullable().optional(),
  category: z.string().min(1, 'Category is required'),
  imageUrl: z.string().refine((value) => z.string().url().safeParse(value).success || /^\/(?!\/)[A-Za-z0-9/_\-.]+$/.test(value), 'Image must be a URL or a local asset path').optional().nullable(),
  status: z.enum(['ACTIVE', 'PAUSED', 'COMPLETED']).optional(),
});

// GET /api/campaigns — public, paginated
export const listCampaigns = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(20, parseInt(req.query.limit as string) || 9);
    const category = req.query.category as string | undefined;
    const status = (req.query.status as string) || 'ACTIVE';

    const where = {
      ...(status !== 'all' && { status: status as any }),
      ...(category && { category }),
    };

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, title: true, slug: true, description: true,
          goalAmount: true, raisedAmount: true, category: true,
          imageUrl: true, status: true, createdAt: true,
          _count: { select: { donations: { where: { status: 'SUCCESS' } } } },
        },
      }),
      prisma.campaign.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        campaigns,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/campaigns/:slug — public
export const getCampaign = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { slug: req.params.slug },
      include: {
        _count: { select: { donations: { where: { status: 'SUCCESS' } } } },
      },
    });

    if (!campaign) return next(createError('Campaign not found', 404));

    res.json({ success: true, data: { campaign } });
  } catch (error) {
    next(error);
  }
};

// POST /api/campaigns — admin only
export const createCampaign = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = campaignSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(createError(parsed.error.errors[0].message, 400));
    }

    const slugExists = await prisma.campaign.findUnique({ where: { slug: parsed.data.slug } });
    if (slugExists) return next(createError('Slug already in use', 409));

    const campaign = await prisma.campaign.create({ data: parsed.data });
    res.status(201).json({ success: true, message: 'Campaign created', data: { campaign } });
  } catch (error) {
    next(error);
  }
};

// PUT /api/campaigns/:id — admin only
export const updateCampaign = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = campaignSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return next(createError(parsed.error.errors[0].message, 400));
    }

    const existing = await prisma.campaign.findUnique({ where: { id: req.params.id } });
    if (!existing) return next(createError('Campaign not found', 404));
    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      const slugExists = await prisma.campaign.findUnique({ where: { slug: parsed.data.slug } });
      if (slugExists) return next(createError('Slug already in use', 409));
    }

    const campaign = await prisma.campaign.update({
      where: { id: req.params.id },
      data: parsed.data,
    });

    res.json({ success: true, message: 'Campaign updated', data: { campaign } });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/campaigns/:id — admin only
export const deleteCampaign = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { donations: true } } },
    });
    if (!existing) return next(createError('Campaign not found', 404));
    if (existing._count.donations > 0) {
      return next(createError('Campaigns with donations cannot be deleted. Pause the campaign instead.', 409));
    }

    await prisma.campaign.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Campaign deleted' });
  } catch (error) {
    next(error);
  }
};
