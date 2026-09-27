import crypto from 'crypto';
import type { Request, Response } from 'express';
import { Prisma, DonationStatus } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { config } from '../config/env';
import { initializeTransaction, verifyTransaction, verifyWebhookSignature } from '../services/paystack';
import { sendDonationReceipt, sendAdminDonationAlert } from '../services/email';

function newReference(): string {
  return `CHF-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

const naira = (v: number) =>
  new Prisma.Decimal(v).toDecimalPlaces(2);

const initializeSchema = z.object({
  campaignId: z.string().min(1),
  amount: z.number().positive('Enter an amount').min(100, 'Minimum donation is ₦100').max(100_000_000),
  donorName: z.string().trim().min(2, 'Enter your full name').max(80),
  donorEmail: z.string().trim().toLowerCase().email('Enter a valid email'),
  message: z.string().trim().max(500).optional().or(z.literal('')),
  anonymous: z.boolean().optional(),
});

const verifySchema = z.object({ reference: z.string().trim().min(4).max(64) });

// ── POST /api/donations/initialize ─────────────────────────

export async function initializeDonation(req: Request, res: Response): Promise<void> {
  const body = initializeSchema.parse(req.body);

  const campaign = await prisma.campaign.findUnique({ where: { id: body.campaignId } });
  if (!campaign || campaign.status !== 'ACTIVE') {
    throw new AppError(404, 'Campaign not found or no longer accepting donations');
  }

  const reference = newReference();

  const donation = await prisma.donation.create({
    data: {
      reference,
      amount: naira(body.amount),
      donorName: body.donorName,
      donorEmail: body.donorEmail,
      message: body.message || null,
      anonymous: body.anonymous ?? false,
      status: DonationStatus.PENDING,
      campaignId: campaign.id,
      userId: req.user?.id ?? null,
    },
  });

  const result = await initializeTransaction({
    email: body.donorEmail,
    amountKobo: Math.round(body.amount * 100),
    reference,
    callbackUrl: `${config.clientUrl}/donate/success`,
    metadata: {
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      donorName: body.donorName,
      donationId: donation.id,
    },
  });

  res.status(201).json({
    reference,
    amount: body.amount,
    currency: 'NGN',
    campaignTitle: campaign.title,
    authorizationUrl: result.authorizationUrl,
    accessCode: result.accessCode,
  });
}

// ── POST /api/donations/verify ─────────────────────────────

export async function verifyDonation(req: Request, res: Response): Promise<void> {
  const { reference } = verifySchema.parse(req.body);

  const donation = await prisma.donation.findUnique({
    where: { reference },
    include: { campaign: { select: { title: true } } },
  });
  if (!donation) throw new AppError(404, 'Donation not found for that reference');

  if (donation.status === DonationStatus.SUCCESS) {
    res.json({ donation: serializeDonation(donation), alreadyVerified: true });
    return;
  }

  const tx = await verifyTransaction(reference);

  const expectedKobo = Number(donation.amount) * 100;
  const paidEnough = tx.status === 'success' && tx.amount >= expectedKobo && tx.currency === 'NGN';

  const updated = await prisma.donation.update({
    where: { reference },
    data: {
      status: paidEnough ? DonationStatus.SUCCESS : tx.status === 'abandoned' ? DonationStatus.ABANDONED : DonationStatus.FAILED,
      paystackFees: tx.fees !== null ? new Prisma.Decimal(tx.fees).div(100).toDecimalPlaces(2) : undefined,
      paidAt: paidEnough ? (tx.paidAt ?? new Date()) : null,
    },
    include: { campaign: { select: { title: true } } },
  });

  if (paidEnough) {
    void sendDonationReceipt({
      email: updated.donorEmail,
      name: updated.donorName,
      amount: Number(updated.amount).toFixed(2),
      currency: updated.currency,
      reference: updated.reference,
      campaignTitle: updated.campaign.title,
      date: updated.paidAt ?? new Date(),
    });
    void sendAdminDonationAlert({
      amount: Number(updated.amount).toFixed(2),
      currency: updated.currency,
      campaignTitle: updated.campaign.title,
      donorName: updated.donorName,
      donorEmail: updated.donorEmail,
      reference: updated.reference,
    });
  }

  res.json({ donation: serializeDonation(updated), alreadyVerified: false });
}

// ── POST /api/donations/webhook ────────────────────────────

export async function paystackWebhook(req: Request, res: Response): Promise<void> {
  const signature = req.headers['x-paystack-signature'] as string | undefined;

  // express.json with verify() stored the raw body on req.rawBody
  const raw = (req as Request & { rawBody?: Buffer }).rawBody;
  if (!raw) {
    res.status(400).send('Missing body');
    return;
  }
  if (!verifyWebhookSignature(raw.toString('utf8'), signature)) {
    res.status(401).send('Invalid signature');
    return;
  }

  const event = JSON.parse(raw.toString('utf8')) as { event: string; data?: { reference?: string } };

  if (event.event === 'charge.success' && event.data?.reference) {
    const reference = event.data.reference;
    const donation = await prisma.donation.findUnique({
      where: { reference },
      include: { campaign: { select: { title: true } } },
    });

    // Idempotent: only transition PENDING → SUCCESS
    if (donation && donation.status === DonationStatus.PENDING) {
      const updated = await prisma.donation.update({
        where: { reference },
        data: { status: DonationStatus.SUCCESS, paidAt: new Date() },
        include: { campaign: { select: { title: true } } },
      });
      void sendDonationReceipt({
        email: updated.donorEmail,
        name: updated.donorName,
        amount: Number(updated.amount).toFixed(2),
        currency: updated.currency,
        reference: updated.reference,
        campaignTitle: updated.campaign.title,
        date: updated.paidAt ?? new Date(),
      });
      void sendAdminDonationAlert({
        amount: Number(updated.amount).toFixed(2),
        currency: updated.currency,
        campaignTitle: updated.campaign.title,
        donorName: updated.donorName,
        donorEmail: updated.donorEmail,
        reference: updated.reference,
      });
    }
  }

  res.sendStatus(200);
}

// ── GET /api/donations/mine (auth) ─────────────────────────

export async function myDonations(req: Request, res: Response): Promise<void> {
  const donations = await prisma.donation.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
    include: { campaign: { select: { title: true, slug: true } } },
  });
  res.json({ donations: donations.map(serializeDonation) });
}

// ── GET /api/donations/history?email= (guest lookup) ───────

export async function guestHistory(req: Request, res: Response): Promise<void> {
  const email = z.string().trim().toLowerCase().email().parse(req.query.email);
  const donations = await prisma.donation.findMany({
    where: { donorEmail: email },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { campaign: { select: { title: true, slug: true } } },
  });
  res.json({ donations: donations.map(serializeDonation) });
}

function serializeDonation<T extends {
  amount: Prisma.Decimal;
  campaign: { title: string };
}>(d: T) {
  return {
    ...d,
    amount: Number(d.amount),
    campaign: d.campaign,
  };
}
