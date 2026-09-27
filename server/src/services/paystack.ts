import crypto from 'crypto';
import { config } from '../config/env';
import { AppError } from '../middleware/errorHandler';

const PAYSTACK_BASE = 'https://api.paystack.co';

export interface InitializeResult {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export interface VerifyResult {
  status: 'success' | 'failed' | 'abandoned' | 'pending';
  amount: number; // in kobo
  currency: string;
  paidAt: Date | null;
  fees: number | null;
  channel: string | null;
  gatewayResponse: string | null;
}

async function paystackRequest<T>(
  method: 'GET' | 'POST',
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${PAYSTACK_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${config.paystackSecretKey}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = (await res.json().catch(() => null)) as
    | { status: boolean; message?: string; data?: T }
    | null;

  if (!res.ok || !json?.status || json.data === undefined) {
    throw new AppError(502, json?.message ?? 'Payment gateway error — please try again.');
  }
  return json.data;
}

export async function initializeTransaction(input: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
}): Promise<InitializeResult> {
  const data = await paystackRequest<{ authorization_url: string; access_code: string; reference: string }>(
    'POST',
    '/transaction/initialize',
    {
      email: input.email,
      amount: input.amountKobo,
      reference: input.reference,
      callback_url: input.callbackUrl,
      currency: 'NGN',
      metadata: input.metadata,
    },
  );

  return {
    authorizationUrl: data.authorization_url,
    accessCode: data.access_code,
    reference: data.reference,
  };
}

export async function verifyTransaction(reference: string): Promise<VerifyResult> {
  const d = await paystackRequest<{
    status: string;
    amount: number;
    currency: string;
    paid_at: string | null;
    fees: number | null;
    channel: string | null;
    gateway_response: string | null;
  }>('GET', `/transaction/verify/${encodeURIComponent(reference)}`);

  return {
    status: d.status === 'success' ? 'success' : d.status === 'abandoned' ? 'abandoned' : d.status === 'failed' ? 'failed' : 'pending',
    amount: d.amount,
    currency: d.currency,
    paidAt: d.paid_at ? new Date(d.paid_at) : null,
    fees: d.fees ?? null,
    channel: d.channel ?? null,
    gatewayResponse: d.gateway_response ?? null,
  };
}

/** Verify HMAC-SHA512 signature of the raw webhook body using the secret key. */
export function verifyWebhookSignature(rawBody: string, signature: string | undefined): boolean {
  if (!signature) return false;
  const expected = crypto.createHmac('sha512', config.paystackSecretKey).update(rawBody).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(signature, 'utf8'));
  } catch {
    return false;
  }
}
