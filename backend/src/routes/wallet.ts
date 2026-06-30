import crypto from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { env } from '../config/env.js';
import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler } from '../utils/async-handler.js';
import { HttpError } from '../utils/http-error.js';
import { requireAuth } from './auth.js';

export const walletRouter = Router();

const withdrawSchema = z.object({
  amount: z.coerce.number().positive(),
  reference: z.string().min(6).optional(),
});

type PaystackRecipientResponse = {
  status: boolean;
  message?: string;
  data?: {
    recipient_code: string;
  };
};

type PaystackTransferResponse = {
  status: boolean;
  message?: string;
  data?: Record<string, unknown>;
};

const createRecipient = async (payload: {
  name: string;
  accountNumber: string;
  bankCode: string;
}) => {
  const response = await fetch('https://api.paystack.co/transferrecipient', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'nuban',
      name: payload.name,
      account_number: payload.accountNumber,
      bank_code: payload.bankCode,
      currency: 'NGN',
    }),
  });

  const data = (await response.json().catch(() => ({}))) as PaystackRecipientResponse;

  if (!response.ok || !data.status || !data.data?.recipient_code) {
    throw new HttpError(502, data.message ?? 'Failed to create Paystack recipient');
  }

  return data.data.recipient_code;
};

const initiateTransfer = async (payload: { amount: number; recipientCode: string; reference: string }) => {
  const response = await fetch('https://api.paystack.co/transfer', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source: 'balance',
      amount: payload.amount,
      recipient: payload.recipientCode,
      reason: 'Runner withdrawal',
      reference: payload.reference,
    }),
  });

  const data = (await response.json().catch(() => ({}))) as PaystackTransferResponse;

  if (!response.ok || !data.status) {
    throw new HttpError(502, data.message ?? 'Paystack transfer failed');
  }

  return data.data ?? null;
};

walletRouter.post(
  '/withdraw',
  asyncHandler(async (request, response) => {
    const { profile } = await requireAuth(request);

    if (profile.role !== 'runner') {
      throw new HttpError(403, 'Runner access required');
    }

    const payload = withdrawSchema.parse(request.body);

    const { data: runnerProfile, error: runnerError } = await supabaseAdmin
      .from('runner_profiles')
      .select('*')
      .eq('user_id', profile.id)
      .maybeSingle();

    if (runnerError || !runnerProfile) {
      throw new HttpError(400, 'Runner profile not found', runnerError);
    }

    if (!runnerProfile.bank_account_number || !runnerProfile.bank_code) {
      throw new HttpError(400, 'Runner bank details are missing');
    }

    const amount = payload.amount;
    const walletBalance = Number(profile.wallet_balance ?? 0);
    if (!Number.isFinite(walletBalance)) {
      throw new HttpError(500, 'Invalid wallet balance');
    }

    if (walletBalance < amount) {
      throw new HttpError(400, 'Insufficient wallet balance');
    }

    const reference =
      request.header('Idempotency-Key')?.trim() ?? payload.reference ?? `wd_${crypto.randomUUID()}`;

    const { data: existing } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('reference', reference)
      .maybeSingle();

    if (existing) {
      return response.json({ status: 'duplicate', transaction: existing });
    }

    const recipientCode = await createRecipient({
      name: profile.full_name ?? 'ErrandKart Runner',
      accountNumber: runnerProfile.bank_account_number,
      bankCode: runnerProfile.bank_code,
    });

    const transferData = await initiateTransfer({
      amount: Math.round(amount * 100),
      recipientCode,
      reference,
    });

    const newBalance = walletBalance - amount;

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ wallet_balance: newBalance })
      .eq('id', profile.id);

    if (updateError) {
      throw new HttpError(500, 'Failed to update wallet balance', updateError);
    }

    const { data: transaction, error: insertError } = await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: profile.id,
        amount,
        type: 'withdrawal',
        reference,
      })
      .select('*')
      .single();

    if (insertError) {
      try {
        await supabaseAdmin
          .from('users')
          .update({ wallet_balance: walletBalance })
          .eq('id', profile.id);
      } catch (rollbackError: any) {
        console.error('[WithdrawalRollback]', rollbackError);
      }
      throw new HttpError(500, 'Failed to record withdrawal', insertError);
    }

    response.json({
      status: 'success',
      transaction,
      transfer: transferData,
      wallet_balance: newBalance,
    });
  })
);
