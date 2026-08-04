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

webhooksRouter.post(
  '/paystack',
  asyncHandler(async (request, response) => {
    if (!verifySignature(request)) {
      throw new HttpError(401, 'Invalid Paystack signature');
    }

    const payload = request.body as PaystackWebhookPayload;

    if (!payload?.event || payload.event !== 'charge.success') {
      return response.json({ status: 'ignored' });
    }

    const reference = payload.data?.reference;
    if (!reference) {
      throw new HttpError(400, 'Missing transaction reference');
    }

    const { data: existing } = await supabaseAdmin
      .from('transactions')
      .select('id')
      .eq('reference', reference)
      .maybeSingle();

    if (existing) {
      return response.json({ status: 'duplicate' });
    }

    const metadata = payload.data?.metadata ?? {};
    const userId = typeof metadata.user_id === 'string' ? metadata.user_id : metadata.userId;
    const customerEmail = payload.data?.customer?.email ?? null;

    let profileId = userId ?? null;
    if (!profileId && customerEmail) {
      const { data: profile, error } = await supabaseAdmin
        .from('users')
        .select('id, wallet_balance')
        .eq('email', customerEmail)
        .maybeSingle();

      if (error) {
        throw new HttpError(500, 'Failed to resolve user by email', error);
      }

      profileId = profile?.id ?? null;
    }

    if (!profileId) {
      throw new HttpError(400, 'Unable to resolve user for payment');
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('id, wallet_balance')
      .eq('id', profileId)
      .maybeSingle();

    if (profileError || !profile) {
      throw new HttpError(500, 'Failed to load user wallet', profileError);
    }

    const amount = payload.data?.amount ? Number(payload.data.amount) / 100 : 0;
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new HttpError(400, 'Invalid payment amount');
    }

    const previousBalance = Number(profile.wallet_balance ?? 0);
    const newBalance = previousBalance + amount;

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ wallet_balance: newBalance })
      .eq('id', profile.id);

    if (updateError) {
      throw new HttpError(500, 'Failed to update wallet balance', updateError);
    }

    const { error: insertError } = await supabaseAdmin.from('transactions').insert({
      user_id: profile.id,
      amount,
      type: 'deposit',
      reference,
    });

    if (insertError) {
      try {
        await supabaseAdmin
          .from('users')
          .update({ wallet_balance: previousBalance })
          .eq('id', profile.id);
      } catch (rollbackError: any) {
        console.error('[WebhookRollback]', rollbackError);
      }
      throw new HttpError(500, 'Failed to record transaction', insertError);
    }

    // --- ESCROW HOLD LOGIC ---
    const errandId = typeof metadata.errand_id === 'string' ? metadata.errand_id : null;
    if (errandId) {
      // 1. Verify errand exists
      const { data: errand, error: errandError } = await supabaseAdmin
        .from('orders')
        .select('id, payment_status')
        .eq('id', errandId)
        .maybeSingle();

      if (!errandError && errand) {
        // 2. Deduct from wallet (we just added `amount`, now we hold it in escrow)
        const postEscrowBalance = newBalance - amount;
        
        const { error: escrowUpdateError } = await supabaseAdmin
          .from('users')
          .update({ wallet_balance: postEscrowBalance })
          .eq('id', profile.id);
          
        if (!escrowUpdateError) {
          // 3. Record escrow_hold transaction
          await supabaseAdmin.from('transactions').insert({
            user_id: profile.id,
            amount: amount,
            type: 'escrow_hold',
            reference: `escrow_${reference}`,
            order_id: errand.id,
          });

          // 4. Update errand payment status
          await supabaseAdmin
            .from('orders')
            .update({ payment_status: 'escrow_held' })
            .eq('id', errand.id);
        } else {
          console.error('[WebhookEscrowError] Failed to deduct wallet for escrow', escrowUpdateError);
        }
      }
    }

    response.json({ status: 'success' });
  })
);

