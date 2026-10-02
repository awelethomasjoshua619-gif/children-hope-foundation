import axios from 'axios';
import crypto from 'crypto';
import { createError } from '../middleware/errorHandler';

const PAYSTACK_BASE = 'https://api.paystack.co';
const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

const paystackApi = axios.create({
  baseURL: PAYSTACK_BASE,
  headers: {
    Authorization: `Bearer ${SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

export interface InitializeTransactionParams {
  email: string;
  amount: number; // in the currency's smallest unit (USD cents for USD)
  reference: string;
  currency?: string;
  callback_url: string;
  metadata?: Record<string, unknown>;
  plan?: string; // for recurring
  channels?: string[];
}

export interface PaystackTransaction {
  id: number;
  status: string;
  reference: string;
  amount: number;
  currency: string;
  customer: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
  metadata?: Record<string, unknown>;
  paid_at?: string;
}

/**
 * Initialize a Paystack transaction — returns authorization URL to redirect user to
 */
export const initializeTransaction = async (
  params: InitializeTransactionParams
) => {
  try {
    const response = await paystackApi.post('/transaction/initialize', params);
    return response.data.data as {
      authorization_url: string;
      access_code: string;
      reference: string;
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw createError('Paystack could not initialize this payment. Check the payment configuration and try again.', 502);
    }
    throw error;
  }
};

/**
 * Verify a Paystack transaction by reference — ALWAYS call this server-side
 * Never trust client-reported payment status
 */
export const verifyTransaction = async (reference: string) => {
  try {
    const response = await paystackApi.get(
      `/transaction/verify/${encodeURIComponent(reference)}`
    );
    return response.data.data as PaystackTransaction;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw createError('Paystack could not verify this payment. Please try again shortly.', 502);
    }
    throw error;
  }
};

/**
 * Verify Paystack webhook signature
 * Returns true if the request is genuinely from Paystack
 */
export const verifyWebhookSignature = (
  rawBody: Buffer,
  signature: string | undefined
): boolean => {
  if (!signature || !/^[a-f0-9]{128}$/i.test(signature)) return false;
  const hash = crypto
    .createHmac('sha512', SECRET_KEY)
    .update(rawBody)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(signature, 'hex'));
};

/**
 * Generate a unique reference for a transaction
 */
export const generateReference = (): string => {
  return `CHF-${Date.now()}-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
};
