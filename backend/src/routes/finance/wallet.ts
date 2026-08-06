import crypto from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { env } from '../../config/env.js';
import { supabaseAdmin } from '../../config/supabase.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { HttpError } from '../../utils/http-error.js';
import { requireAuth } from '../auth.js';
import { createRecipient, initiateTransfer, getBanks, resolveAccountNumber } from '../../utils/paystack.js';

export const walletRouter = Router();

// GET /api/wallet/balance - Get wallet balance (derived from ledger, cached in users table)
walletRouter.get(
  '/balance',
  asyncHandler(async (request, response) => {
    const { profile } = await requireAuth(request);

    // Use ledger as source of truth, but fall back to cached value
    const { data: ledgerBalance, error } = await supabaseAdmin.rpc('get_wallet_balance', {
      p_user_id: profile.id,
    });

    response.json({
      wallet_balance: error ? Number(profile.wallet_balance ?? 0) : Number(ledgerBalance ?? 0),
    });
  })
);

// GET /api/wallet/transactions - Get transaction history from the ledger
walletRouter.get(
  '/transactions',
  asyncHandler(async (request, response) => {
    const { profile } = await requireAuth(request);

    // Fetch from the new transaction_groups table for richer data
    const { data: groups, error: groupsError } = await supabaseAdmin
      .from('transaction_groups')
      .select('*')
      .eq('initiator_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(50);

    // Also fetch legacy transactions for backwards compatibility
    const { data: legacy, error: legacyError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (groupsError && legacyError) {
      throw new HttpError(500, 'Failed to fetch transactions');
    }

    // Merge and deduplicate — prefer new ledger data, fall back to legacy
    const ledgerTransactions = (groups ?? []).map((g: any) => ({
      id: g.id,
      amount: Number(g.amount),
      type: g.type,
      status: g.status,
      reference: g.reference,
      errand_id: g.errand_id,
      created_at: g.created_at,
    }));

    // Include legacy transactions that aren't already in the ledger
    const ledgerRefs = new Set(ledgerTransactions.map((t: any) => t.reference));
    const legacyTransactions = (legacy ?? [])
      .filter((t: any) => !ledgerRefs.has(t.reference))
      .map((t: any) => ({
        id: t.id,
        amount: Number(t.amount),
        type: t.type,
        status: 'completed',
        reference: t.reference,
        errand_id: t.order_id,
        created_at: t.created_at,
      }));

    const transactions = [...ledgerTransactions, ...legacyTransactions]
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 50);

    response.json({ transactions });
  })
);

const checkoutSchema = z.object({
  amount: z.coerce.number().positive(),
  errand_id: z.string().uuid(),
});

// POST /api/wallet/checkout - Atomic escrow hold via double-entry ledger
walletRouter.post(
  '/checkout',
  asyncHandler(async (request, response) => {
    const { profile } = await requireAuth(request);
    const payload = checkoutSchema.parse(request.body);

    // Idempotency: use client-provided key or generate one
    const reference =
      request.header('Idempotency-Key')?.trim() || `checkout_${payload.errand_id}_${crypto.randomUUID()}`;

    // Use the new atomic ledger_escrow_hold RPC
    const { data, error } = await supabaseAdmin.rpc('ledger_escrow_hold', {
      p_customer_id: profile.id,
      p_amount: payload.amount,
      p_errand_id: payload.errand_id,
      p_reference: reference,
    });

    if (error) {
      if (error.message.includes('Insufficient wallet balance')) {
        throw new HttpError(400, 'Insufficient wallet balance. Please top up your wallet first.');
      }
      throw new HttpError(500, 'Failed to process wallet checkout', error);
    }

    if (data?.duplicate) {
      return response.json({
        status: 'duplicate',
        message: 'This checkout was already processed.',
        transaction_group_id: data.transaction_group_id,
      });
    }

    response.json({
      status: 'success',
      transaction_group_id: data.transaction_group_id,
      new_balance: data.new_balance,
    });
  })
);

const withdrawSchema = z.object({
  amount: z.coerce.number().positive(),
  reference: z.string().min(6).optional(),
});


// POST /api/wallet/withdraw - Atomic withdrawal via double-entry ledger
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

    // Idempotency key
    const reference =
      request.header('Idempotency-Key')?.trim() ?? payload.reference ?? `wd_${crypto.randomUUID()}`;

    // Use atomic ledger_withdrawal RPC (handles balance check + dedup + double-entry)
    const { data: withdrawData, error: withdrawError } = await supabaseAdmin.rpc('ledger_withdrawal', {
      p_runner_id: profile.id,
      p_amount: amount,
      p_reference: reference,
      p_metadata: { bank_code: runnerProfile.bank_code, account_number: runnerProfile.bank_account_number },
    });

    if (withdrawError) {
      if (withdrawError.message.includes('Insufficient wallet balance')) {
        throw new HttpError(400, 'Insufficient wallet balance');
      }
      throw new HttpError(500, 'Failed to process withdrawal', withdrawError);
    }

    if (withdrawData?.duplicate) {
      return response.json({ status: 'duplicate', message: 'This withdrawal was already processed.' });
    }

    // Initiate the actual Paystack transfer to the runner's bank
    const recipientCode = await createRecipient({
      name: profile.full_name ?? 'ErrandKart Runner',
      accountNumber: runnerProfile.bank_account_number,
      bankCode: runnerProfile.bank_code,
    });

    const transferData = await initiateTransfer({
      amount: amount,
      recipientCode,
      reference,
    });

    response.json({
      status: 'success',
      transaction_group_id: withdrawData.transaction_group_id,
      transfer: transferData,
      wallet_balance: withdrawData.new_balance,
    });
  })
);

// GET /api/wallet/banks - Get list of Nigerian banks from Paystack
walletRouter.get(
  '/banks',
  asyncHandler(async (request, response) => {
    await requireAuth(request);
    const banks = await getBanks();
    response.json({ status: 'success', banks });
  })
);

// POST /api/wallet/resolve-account - Resolve account name
walletRouter.post(
  '/resolve-account',
  asyncHandler(async (request, response) => {
    await requireAuth(request);
    const { account_number, bank_code } = z.object({
      account_number: z.string().min(10).max(10),
      bank_code: z.string()
    }).parse(request.body);

    const account = await resolveAccountNumber(account_number, bank_code);
    response.json({ status: 'success', account });
  })
);
