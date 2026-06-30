import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler } from '../utils/async-handler.js';
import { HttpError } from '../utils/http-error.js';
import { getAuthContext } from './auth.js';

export const supermarketsRouter = Router();

const registerSchema = z.object({
  business_name: z.string().min(2),
  manager_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  address: z.string().min(4),
  city: z.string().min(2).optional(),
  cac_number: z.string().min(2),
  tax_id: z.string().optional(),
  cac_certificate_url: z.string().url().optional(),
  government_id_url: z.string().url().optional(),
  storefront_image_url: z.string().url().optional(),
});

supermarketsRouter.post(
  '/register',
  asyncHandler(async (request, response) => {
    const payload = registerSchema.parse(request.body);
    const authContext = await getAuthContext(request, false);
    const userId = authContext?.profile.id ?? null;

    const { data, error } = await supabaseAdmin
      .from('supermarket_profiles')
      .insert({
        user_id: userId ?? undefined,
        business_name: payload.business_name,
        manager_name: payload.manager_name,
        email: payload.email,
        phone: payload.phone,
        address: payload.address,
        city: payload.city ?? 'Unknown',
        cac_number: payload.cac_number,
        tax_id: payload.tax_id ?? null,
        cac_certificate_url: payload.cac_certificate_url ?? null,
        government_id_url: payload.government_id_url ?? null,
        storefront_image_url: payload.storefront_image_url ?? null,
        verification_status: 'pending',
      })
      .select('*')
      .single();

    if (error) {
      throw new HttpError(500, 'Failed to register supermarket', error);
    }

    response.status(201).json({
      supermarket: data,
      verification_status: data.verification_status,
    });
  })
);
