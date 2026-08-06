import crypto from 'node:crypto';
import { Router } from 'express';
import type { Request } from 'express';
import { env } from '../config/env.js';
import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler } from '../utils/async-handler.js';
import { HttpError } from '../utils/http-error.js';

export const webhooksRouter = Router();

type PaystackWebhookPayload = {
  event: string;
  data: {
    amount: number;
    reference: string;
    customer?: {
      email?: string | null;
    };
    metadata?: Record<string, unknown> & { user_id?: string; userId?: string };
  };
};

const getSignature = (request: Request) => {
  const signature = request.headers['x-paystack-signature'];
  if (Array.isArray(signature)) {
    return signature[0];
  }
  return signature;
};

const verifySignature = (request: Request) => {
  const signature = getSignature(request);
  if (!signature) {
    return false;
  }

  const rawBody = (request as Request & { rawBody?: Buffer }).rawBody;
  if (!rawBody) {
    return false;
  }

  const hash = crypto.createHmac('sha512', env.PAYSTACK_WEBHOOK_SECRET).update(rawBody).digest('hex');
  if (signature.length !== hash.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
};

// ─── CHARGE SUCCESS (Wallet Top-Up) ─────────────────────────────────────────
webhooksRouter.post(
  '/paystack',
  asyncHandler(async (request, response) => {
    if (!verifySignature(request)) {
      throw new HttpError(401, 'Invalid Paystack signature');
    }

    const payload = request.body as PaystackWebhookPayload;
    const event = payload?.event;

    // ── Handle charge.success (top-up) ──
    if (event === 'charge.success') {
      return handleChargeSuccess(payload, response);
    }

    // ── Handle refund ──
    if (event === 'refund.processed') {
      return handleRefund(payload, response);
    }

    // ── Handle dispute ──
    if (event === 'charge.dispute.create') {
      return handleDispute(payload, response);
    }

    // Ignore other events
    return response.json({ status: 'ignored', event });
  })
);

// ─── CHARGE SUCCESS HANDLER ─────────────────────────────────────────────────
async function handleChargeSuccess(payload: PaystackWebhookPayload, response: any) {
  const reference = payload.data?.reference;
  if (!reference) {
    throw new HttpError(400, 'Missing transaction reference');
  }

  // Resolve the user
  const metadata = payload.data?.metadata ?? {};
  const userId = typeof metadata.user_id === 'string' ? metadata.user_id : metadata.userId;
  const customerEmail = payload.data?.customer?.email ?? null;

  let profileId = userId ?? null;
  if (!profileId && customerEmail) {
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', customerEmail)
      .maybeSingle();
    profileId = profile?.id ?? null;
  }

  if (!profileId) {
    throw new HttpError(400, 'Unable to resolve user for payment');
  }

  // Amount in naira (Paystack sends kobo)
  const amount = payload.data?.amount ? Number(payload.data.amount) / 100 : 0;
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new HttpError(400, 'Invalid payment amount');
  }

  // ── Use atomic ledger_deposit RPC (handles idempotency + double-entry) ──
  const { data, error } = await supabaseAdmin.rpc('ledger_deposit', {
    p_user_id: profileId,
    p_amount: amount,
    p_reference: reference,
    p_metadata: { paystack_event: 'charge.success', email: customerEmail },
  });

  if (error) {
    console.error('[WebhookDepositError]', error);
    throw new HttpError(500, 'Failed to process deposit', error);
  }

  if (data?.duplicate) {
    return response.json({ status: 'duplicate' });
  }

  // ── If this payment is linked to an errand, auto-hold escrow ──
  const errandId = typeof metadata.errand_id === 'string' ? metadata.errand_id : null;
  if (errandId) {
    const escrowRef = `escrow_${reference}`;
    const { error: escrowError } = await supabaseAdmin.rpc('ledger_escrow_hold', {
      p_customer_id: profileId,
      p_amount: amount,
      p_errand_id: errandId,
      p_reference: escrowRef,
    });

    if (escrowError) {
      console.error('[WebhookEscrowError]', escrowError);
      // Don't throw — the deposit succeeded, just log the escrow failure
    }
  }

  response.json({ status: 'success' });
}

// ─── REFUND HANDLER ─────────────────────────────────────────────────────────
async function handleRefund(payload: PaystackWebhookPayload, response: any) {
  const reference = payload.data?.reference;
  if (!reference) {
    return response.json({ status: 'ignored', reason: 'no reference' });
  }

  // Find the original deposit transaction to get user and errand info
  const { data: originalTxg } = await supabaseAdmin
    .from('transaction_groups')
    .select('id, initiator_id, errand_id, amount')
    .eq('reference', reference)
    .eq('type', 'deposit')
    .maybeSingle();

  if (!originalTxg || !originalTxg.initiator_id) {
    console.warn('[WebhookRefund] Original transaction not found for reference:', reference);
    return response.json({ status: 'ignored', reason: 'original not found' });
  }

  // If this deposit was tied to an errand with escrow, refund from escrow
  if (originalTxg.errand_id) {
    const refundRef = `refund_${reference}`;
    const { error: refundError } = await supabaseAdmin.rpc('ledger_refund', {
      p_customer_id: originalTxg.initiator_id,
      p_amount: originalTxg.amount,
      p_errand_id: originalTxg.errand_id,
      p_reference: refundRef,
    });

    if (refundError) {
      console.error('[WebhookRefundError]', refundError);
    }
  }

  response.json({ status: 'refund_processed' });
}

// ─── DISPUTE HANDLER (Log Only) ─────────────────────────────────────────────
async function handleDispute(payload: PaystackWebhookPayload, response: any) {
  const reference = payload.data?.reference;
  console.warn('[DISPUTE] Paystack dispute received for reference:', reference);

  // Mark the original transaction as disputed
  if (reference) {
    await supabaseAdmin
      .from('transaction_groups')
      .update({ status: 'disputed' })
      .eq('reference', reference);
  }

  response.json({ status: 'dispute_logged' });
}
