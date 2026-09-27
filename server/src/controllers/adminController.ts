import type { Request, Response } from 'express';
import { Prisma, DonationStatus } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

function csvEscape(v: unknown): string {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// ── GET /api/admin/stats ───────────────────────────────────

export async function getStats(_req: Request, res: Response): Promise<void> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [donationAgg, donorCount, campaignCount, pendingCount, monthAgg, recentDonations, activeCampaigns, grouped, monthly] =
    await Promise.all([
      prisma.donation.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.user.count({ where: { role: 'DONOR' } }),
      prisma.campaign.count({ where: { status: 'ACTIVE' } }),
      prisma.donation.count({ where: { status: 'PENDING' } }),
      prisma.donation.aggregate({
        where: { status: 'SUCCESS', paidAt: { gte: monthStart } },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.donation.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: { campaign: { select: { title: true } } },
      }),
      prisma.campaign.findMany({
        where: { status: { in: ['ACTIVE', 'COMPLETED'] } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.donation.groupBy({
        by: ['campaignId'],
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
      }),
      prisma.$queryRaw<Array<{ month: Date; total: Prisma.Decimal; count: bigint }>>`
        SELECT date_trunc('month', "paidAt") AS month,
               SUM(amount) AS total,
               COUNT(*) AS count
        FROM donations
        WHERE status = 'SUCCESS' AND "paidAt" IS NOT NULL
        GROUP BY 1
        ORDER BY 1 DESC
        LIMIT 12`,
    ]);

  const raisedMap = new Map(grouped.map((g) => [g.campaignId, Number(g._sum.amount ?? 0)]));

  res.json({
    stats: {
      totalRaised: Number(donationAgg._sum.amount ?? 0),
      donationCount: donationAgg._count,
      donorCount,
      activeCampaignCount: campaignCount,
      pendingDonationCount: pendingCount,
      avgDonation: donationAgg._count > 0 ? Number(donationAgg._sum.amount ?? 0) / donationAgg._count : 0,
      monthRaised: Number(monthAgg._sum.amount ?? 0),
      monthCount: monthAgg._count,
    },
    recentDonations: recentDonations.map((d) => ({
      id: d.id,
      reference: d.reference,
      donorName: d.donorName,
      amount: Number(d.amount),
      status: d.status,
      campaignTitle: d.campaign.title,
      createdAt: d.createdAt,
    })),
    topCampaigns: activeCampaigns
      .map((c) => {
        const raised = raisedMap.get(c.id) ?? 0;
        const target = Number(c.targetAmount);
        return {
          id: c.id,
          title: c.title,
          status: c.status,
          category: c.category,
          target,
          raised,
          progress: target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0,
        };
      })
      .sort((a, b) => b.raised - a.raised),
    monthly: monthly.map((m) => ({ month: m.month, total: Number(m.total), count: Number(m.count) })),
  });
}

// ── GET /api/admin/donations (paginated + filters) ─────────

export async function listDonations(req: Request, res: Response): Promise<void> {
  const query = z
    .object({
      page: z.coerce.number().int().min(1).default(1),
      pageSize: z.coerce.number().int().min(1).max(100).default(20),
      status: z.nativeEnum(DonationStatus).optional(),
      q: z.string().trim().max(100).optional(),
    })
    .parse(req.query);

  const where: Prisma.DonationWhereInput = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.q
      ? {
          OR: [
            { donorEmail: { contains: query.q, mode: 'insensitive' } },
            { donorName: { contains: query.q, mode: 'insensitive' } },
            { reference: { contains: query.q, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [total, donations] = await Promise.all([
    prisma.donation.count({ where }),
    prisma.donation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: { campaign: { select: { title: true } } },
    }),
  ]);

  res.json({
    donations: donations.map((d) => ({
      id: d.id,
      reference: d.reference,
      donorName: d.donorName,
      donorEmail: d.donorEmail,
      amount: Number(d.amount),
      currency: d.currency,
      status: d.status,
      campaignTitle: d.campaign.title,
      message: d.message,
      paidAt: d.paidAt,
      createdAt: d.createdAt,
    })),
    pagination: { page: query.page, pageSize: query.pageSize, total, pages: Math.ceil(total / query.pageSize) },
  });
}

// ── GET /api/admin/donations/export (CSV) ──────────────────

export async function exportDonationsCsv(_req: Request, res: Response): Promise<void> {
  const donations = await prisma.donation.findMany({
    orderBy: { createdAt: 'desc' },
    include: { campaign: { select: { title: true } } },
  });

  const header = ['reference', 'donorName', 'donorEmail', 'amount', 'currency', 'status', 'campaign', 'message', 'createdAt', 'paidAt'];
  const rows = donations.map((d) =>
    [
      d.reference,
      d.donorName,
      d.donorEmail,
      Number(d.amount).toFixed(2),
      d.currency,
      d.status,
      d.campaign.title,
      d.message ?? '',
      d.createdAt.toISOString(),
      d.paidAt?.toISOString() ?? '',
    ]
      .map(csvEscape)
      .join(','),
  );

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="donations-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send([header.join(','), ...rows].join('\n'));
}

// ── GET /api/admin/contact-messages ────────────────────────

export async function listContactMessages(req: Request, res: Response): Promise<void> {
  const query = z.object({ handled: z.coerce.boolean().optional() }).parse(req.query);
  const messages = await prisma.contactMessage.findMany({
    where: query.handled !== undefined ? { handled: query.handled } : {},
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  res.json({ messages });
}

// ── PATCH /api/admin/contact-messages/:id ──────────────────

export async function markMessageHandled(req: Request, res: Response): Promise<void> {
  const { handled } = z.object({ handled: z.boolean() }).parse(req.body);
  const message = await prisma.contactMessage.update({
    where: { id: req.params.id },
    data: { handled },
  });
  res.json({ message });
}
