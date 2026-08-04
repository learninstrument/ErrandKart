import crypto from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { env } from '../config/env.js';
import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler } from '../utils/async-handler.js';
import { HttpError } from '../utils/http-error.js';
import { requireAuth } from './auth.js';

export const paymentsRouter = Router();

const initializePaymentSchema = z.object({
  amount: z.coerce.number().positive(),
  errand_id: z.string().uuid().optional(),
  callback_url: z.string().url().optional(),
});

type PaystackInitializeResponse = {
  status: boolean;
  message?: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

paymentsRouter.post(
  '/initialize',
  asyncHandler(async (request, response) => {
    const { profile } = await requireAuth(request);
    const payload = initializePaymentSchema.parse(request.body);

    const reference = `tx_${crypto.randomUUID()}`;

    // If errand_id is provided, link this reference to the errand in our DB first
    if (payload.errand_id) {
      // We'll update the errand to store this reference
      const { error: updateError } = await supabaseAdmin
        .from('orders') // errands are in 'orders' table
        .update({ payment_reference: reference })
        .eq('id', payload.errand_id)
        .eq('customer_id', profile.id); // ensure it belongs to the customer

      if (updateError) {
        throw new HttpError(500, 'Failed to link payment reference to errand', updateError);
      }
    }

    const paystackPayload: Record<string, unknown> = {
      amount: Math.round(payload.amount * 100), // Paystack accepts amount in kobo
      email: profile.email,
      reference,
      metadata: {
        user_id: profile.id,
        errand_id: payload.errand_id,
      },
    };

    if (payload.callback_url) {
      paystackPayload.callback_url = payload.callback_url;
    }

    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paystackPayload),
    });

    const data = (await paystackResponse.json().catch(() => ({}))) as PaystackInitializeResponse;

    if (!paystackResponse.ok || !data.status || !data.data) {
      throw new HttpError(502, data.message ?? 'Failed to initialize Paystack transaction');
    }

    response.json({
      status: 'success',
      data: data.data,
    });
  })
);
