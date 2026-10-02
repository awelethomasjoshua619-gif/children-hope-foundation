import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import {
  initializeTransaction,
  verifyTransaction,
  verifyWebhookSignature,
  generateReference,
} from '../services/paystack';
import { sendDonationReceipt, sendAdminDonationAlert } from '../services/email';

const initializeSchema = z.object({
  amount: z.number().int().min(500, 'Minimum donation is $5'),
  campaignId: z.string().min(1),
  donorEmail: z.string().trim().email().transform((email) => email.toLowerCase()),
  donorName: z.string().trim().max(120).optional(),
  isAnonymous: z.boolean().optional().default(false),
  isRecurring: z.literal(false).optional().default(false),
  currency: z.literal('USD').optional().default('USD'),
});

type SettledDonation = NonNullable<
  Awaited<ReturnType<typeof settleSuccessfulDonation>>['donation']
>;

async function settleSuccessfulDonation(reference: string, amount: number, currency: string) {
  return prisma.$transaction(async (tx) => {
    const claimed = await tx.donation.updateMany({
      where: { paystackRef: reference, amount, currency, status: 'PENDING' },
      data: { status: 'SUCCESS' },
    });

    const donation = await tx.donation.findUnique({
      where: { paystackRef: reference },
      include: { campaign: true },
    });

    if (!donation || claimed.count === 0) return { donation, processed: false };

    await tx.campaign.update({
      where: { id: donation.campaignId },
      data: { raisedAmount: { increment: donation.amount } },
    });

    return { donation, processed: true };
  });
}

function notifyDonation(donation: SettledDonation) {
  const details = {
    donorName: donation.isAnonymous ? 'Anonymous' : donation.donorName || 'Generous Donor',
    donorEmail: donation.donorEmail,
    amount: donation.amount,
    currency: donation.currency,
    campaignTitle: donation.campaign.title,
    reference: donation.paystackRef,
  };

  void Promise.all([
    sendDonationReceipt({ ...details, date: donation.updatedAt }),
    sendAdminDonationAlert(details),
  ]).catch((error) => console.error('Donation email delivery failed:', error));
}

function donationReceipt(donation: SettledDonation) {
  return {
    id: donation.id,
    amount: donation.amount,
    currency: donation.currency,
    campaignTitle: donation.campaign.title,
    donorName: donation.isAnonymous ? null : donation.donorName,
    donorEmail: donation.donorEmail,
    reference: donation.paystackRef,
    date: donation.updatedAt,
  };
}

// POST /api/donations/initialize
export const initializeDonation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = initializeSchema.safeParse(req.body);
    if (!parsed.success) return next(createError(parsed.error.issues[0].message, 400));

    const { amount, campaignId, donorEmail, donorName, isAnonymous, isRecurring, currency } = parsed.data;
    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) return next(createError('Campaign not found', 404));
    if (campaign.status !== 'ACTIVE') return next(createError('Campaign is no longer active', 400));

    const reference = generateReference();
    const callbackUrl = `${(process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '')}/donate/success?ref=${reference}`;

    await prisma.donation.create({
      data: {
        amount,
        currency,
        donorEmail,
        donorName: isAnonymous ? null : donorName || null,
        isAnonymous,
        isRecurring,
        status: 'PENDING',
        paystackRef: reference,
        campaignId,
        userId: req.user?.id || null,
      },
    });

    const transaction = await initializeTransaction({
      email: donorEmail,
      amount,
      reference,
      currency,
      callback_url: callbackUrl,
      channels: currency === 'USD' ? ['card'] : ['card', 'bank', 'bank_transfer', 'ussd'],
      metadata: {
        campaignId,
        campaignTitle: campaign.title,
        donorName: isAnonymous ? 'Anonymous' : donorName || 'Generous Donor',
        isAnonymous,
        isRecurring,
      },
    });

    res.json({
      success: true,
      data: { authorizationUrl: transaction.authorization_url, reference },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/donations/verify/:ref
export const verifyDonation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reference = req.params.ref;
    const donation = await prisma.donation.findUnique({
      where: { paystackRef: reference },
      include: { campaign: true },
    });
    if (!donation) return next(createError('Donation not found', 404));

    if (donation.status === 'SUCCESS') {
      return res.json({ success: true, data: { donation: donationReceipt(donation) } });
    }

    const transaction = await verifyTransaction(reference);
    if (transaction.status !== 'success') {
      if (transaction.status === 'failed' || transaction.status === 'abandoned') {
        await prisma.donation.updateMany({
          where: { paystackRef: reference, status: 'PENDING' },
          data: { status: 'FAILED' },
        });
        const latest = await prisma.donation.findUnique({
          where: { paystackRef: reference },
          include: { campaign: true },
        });
        if (latest?.status === 'SUCCESS') {
          return res.json({ success: true, data: { donation: donationReceipt(latest) } });
        }
        return next(createError('Payment was not successful', 400));
      }
      return res.status(202).json({
        success: true,
        message: 'Payment is still processing.',
        data: { pending: true },
      });
    }

    if (
      transaction.reference !== reference ||
      transaction.amount !== donation.amount ||
      transaction.currency !== donation.currency
    ) {
      await prisma.donation.updateMany({
        where: { paystackRef: reference, status: 'PENDING' },
        data: { status: 'FAILED' },
      });
      return next(createError('Payment verification details did not match this donation', 400));
    }

    const settled = await settleSuccessfulDonation(reference, transaction.amount, transaction.currency);
    if (!settled.donation || settled.donation.status !== 'SUCCESS') {
      return next(createError('Payment could not be matched to this donation', 400));
    }
    if (settled.processed) notifyDonation(settled.donation);

    res.json({ success: true, data: { donation: donationReceipt(settled.donation) } });
  } catch (error) {
    next(error);
  }
};

// POST /api/donations/webhook
export const handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from('');
    const signature = req.headers['x-paystack-signature'];
    if (!verifyWebhookSignature(rawBody, Array.isArray(signature) ? signature[0] : signature)) {
      return next(createError('Invalid webhook signature', 400));
    }

    const event = JSON.parse(rawBody.toString('utf8')) as {
      event?: string;
      data?: { reference?: string; amount?: number; currency?: string };
    };

    if (event.event === 'charge.success') {
      const reference = event.data?.reference;
      const amount = event.data?.amount;
      const currency = event.data?.currency;
      if (!reference || typeof amount !== 'number' || !Number.isInteger(amount) || !currency) {
        return res.sendStatus(200);
      }

      const settled = await settleSuccessfulDonation(reference, amount, currency);
      if (settled.processed && settled.donation) notifyDonation(settled.donation);
    }

    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

// GET /api/donations/mine
export const getMyDonations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const donations = await prisma.donation.findMany({
      where: { userId: req.user!.id, status: 'SUCCESS' },
      include: { campaign: { select: { title: true, slug: true, imageUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: { donations } });
  } catch (error) {
    next(error);
  }
};
