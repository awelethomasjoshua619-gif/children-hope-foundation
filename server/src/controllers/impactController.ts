import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

// ── GET /api/impact ─────────────────────────────────────────
// Public: live impact stats + site settings in one call.

export async function getImpact(_req: Request, res: Response): Promise<void> {
  const [stats, settingsRows] = await Promise.all([
    prisma.impactStat.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.siteSetting.findMany(),
  ]);

  const settings: Record<string, string> = {};
  for (const s of settingsRows) settings[s.key] = s.value;

  res.json({ success: true, data: { stats, settings } });
}

// ── PUT /api/admin/impact/stats/:id ────────────────────────

const statSchema = z.object({
  label: z.string().trim().min(1).max(60).optional(),
  value: z.number().int().min(0).max(1_000_000_000).optional(),
  icon: z.string().trim().max(30).optional(),
  sortOrder: z.number().int().min(0).max(999).optional(),
});

export async function updateImpactStat(req: Request, res: Response): Promise<void> {
  const body = statSchema.parse(req.body);
  const existing = await prisma.impactStat.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new AppError(404, 'Impact stat not found');

  const stat = await prisma.impactStat.update({ where: { id: req.params.id }, data: body });
  res.json({ success: true, data: { stat } });
}

// ── PUT /api/admin/impact/settings ─────────────────────────

const settingsSchema = z.record(z.string(), z.string().max(300));

export async function updateSiteSettings(req: Request, res: Response): Promise<void> {
  const body = settingsSchema.parse(req.body);
  const updates = Object.entries(body).map(([key, value]) =>
    prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } }),
  );
  await prisma.$transaction(updates);
  const rows = await prisma.siteSetting.findMany();
  const settings: Record<string, string> = {};
  for (const s of rows) settings[s.key] = s.value;
  res.json({ success: true, data: { settings } });
}
