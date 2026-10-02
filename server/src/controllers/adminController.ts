import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { stringify } from 'csv-stringify/sync';

// GET /api/admin/stats
export const getStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalDonations,
      totalRaisedResult,
      thisMonthResult,
      totalDonors,
      activeCampaigns,
      recentDonations,
    ] = await Promise.all([
      prisma.donation.count({ where: { status: 'SUCCESS', currency: 'USD' } }),
      prisma.donation.aggregate({
        where: { status: 'SUCCESS', currency: 'USD' },
        _sum: { amount: true },
      }),
      prisma.donation.aggregate({
        where: { status: 'SUCCESS', currency: 'USD', createdAt: { gte: startOfMonth } },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.donation.groupBy({
        by: ['donorEmail'],
        where: { status: 'SUCCESS', currency: 'USD' },
      }).then((r) => r.length),
      prisma.campaign.count({ where: { status: 'ACTIVE' } }),
      prisma.donation.findMany({
        where: { status: 'SUCCESS', currency: 'USD' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { campaign: { select: { title: true } } },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalDonations,
        totalRaised: totalRaisedResult._sum.amount || 0,
        thisMonthRaised: thisMonthResult._sum.amount || 0,
        thisMonthCount: thisMonthResult._count,
        totalDonors,
        activeCampaigns,
        recentDonations,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/donations — filterable, with CSV export
export const getAllDonations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const status = req.query.status as string | undefined;
    const campaignId = req.query.campaignId as string | undefined;
    const donorEmail = req.query.donorEmail as string | undefined;
    const q = (req.query.q as string | undefined)?.trim();
    const from = req.query.from ? new Date(req.query.from as string) : undefined;
    const to = req.query.to ? new Date(req.query.to as string) : undefined;
    const exportCsv = req.query.export === 'csv';

    const where = {
      ...(status && { status: status as any }),
      ...(campaignId && { campaignId }),
      ...(donorEmail && { donorEmail: { contains: donorEmail, mode: 'insensitive' as any } }),
      ...(q && {
        OR: [
          { donorEmail: { contains: q, mode: 'insensitive' as any } },
          { donorName: { contains: q, mode: 'insensitive' as any } },
          { paystackRef: { contains: q, mode: 'insensitive' as any } },
        ],
      }),
      ...((from || to) && {
        createdAt: {
          ...(from && { gte: from }),
          ...(to && { lte: to }),
        },
      }),
    };

    if (exportCsv) {
      const donations = await prisma.donation.findMany({
        where,
        include: { campaign: { select: { title: true } } },
        orderBy: { createdAt: 'desc' },
      });

      const rows = donations.map((d) => ({
        ID: d.id,
        Reference: d.paystackRef,
        'Donor Name': d.isAnonymous ? 'Anonymous' : (d.donorName || ''),
        'Donor Email': d.donorEmail,
        Campaign: d.campaign.title,
        'Amount (USD)': (d.amount / 100).toFixed(2),
        Currency: d.currency,
        Status: d.status,
        Recurring: d.isRecurring ? 'Yes' : 'No',
        Date: d.createdAt.toISOString(),
      }));

      const csv = stringify(rows, { header: true });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="donations-${Date.now()}.csv"`
      );
      return res.send(csv);
    }

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where,
        include: { campaign: { select: { title: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.donation.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        donations,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
};
