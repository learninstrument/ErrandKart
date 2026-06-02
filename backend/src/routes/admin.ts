import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler } from '../utils/async-handler.js';
import { HttpError } from '../utils/http-error.js';
import { requireAuth } from '../utils/auth.js';

export const adminRouter = Router();

const verificationSchema = z.object({
  status: z.enum(['verified', 'rejected', 'suspended']),
});

const requireAdmin = async (request: Parameters<typeof requireAuth>[0]) => {
  const context = await requireAuth(request);
  if (context.profile.role !== 'admin') {
    throw new HttpError(403, 'Admin access required');
  }
  return context;
};

adminRouter.get(
  '/supermarkets',
  asyncHandler(async (request, response) => {
    await requireAdmin(request);

    const { data, error } = await supabaseAdmin
      .from('supermarket_profiles')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      throw new HttpError(500, 'Failed to fetch supermarkets', error);
    }

    response.json({ supermarkets: data ?? [] });
  })
);

adminRouter.get(
  '/support/tickets',
  asyncHandler(async (request, response) => {
    await requireAdmin(request);

    const { data, error } = await supabaseAdmin
      .from('support_tickets')
      .select(
        'id, order_id, requester_user_id, requester_role, channel, category, summary, priority, status, sla_target, last_message, created_at, updated_at, requester:requester_user_id (id, full_name, email, phone_number)'
      )
      .order('created_at', { ascending: false });

    if (error) {
      throw new HttpError(500, 'Failed to fetch support tickets', error);
    }

    response.json({ tickets: data ?? [] });
  })
);

adminRouter.get(
  '/ratings',
  asyncHandler(async (request, response) => {
    await requireAdmin(request);

    const { data, error } = await supabaseAdmin
      .from('order_ratings')
      .select(
        'id, order_id, customer_user_id, runner_user_id, customer_to_runner_rating, runner_to_customer_rating, customer_comment, runner_comment, submitted_at, customer:customer_user_id (id, full_name), runner:runner_user_id (id, full_name)'
      )
      .order('submitted_at', { ascending: false });

    if (error) {
      throw new HttpError(500, 'Failed to fetch order ratings', error);
    }

    response.json({ ratings: data ?? [] });
  })
);

adminRouter.get(
  '/tracking/active',
  asyncHandler(async (request, response) => {
    await requireAdmin(request);

    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(
        'id, customer_id, runner_id, supermarket_id, dispatch_source, status, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, pickup_address, dropoff_address, budget_service_fee, customer:customer_id (id, full_name, phone_number), runner:runner_id (id, full_name, phone_number), supermarket:supermarket_id (id, business_name, phone)'
      )
      .in('status', ['shopping', 'en_route', 'arrived'])
      .order('created_at', { ascending: false });

    if (error) {
      throw new HttpError(500, 'Failed to fetch tracking data', error);
    }

    response.json({ errands: data ?? [] });
  })
);

adminRouter.patch(
  '/supermarkets/:id/verification',
  asyncHandler(async (request, response) => {
    const { profile } = await requireAdmin(request);

    const payload = verificationSchema.parse(request.body);
    const supermarketId = request.params.id;

    if (!supermarketId) {
      throw new HttpError(400, 'Missing supermarket id');
    }

    const { data, error } = await supabaseAdmin
      .from('supermarket_profiles')
      .update({
        verification_status: payload.status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: profile.id,
      })
      .eq('id', supermarketId)
      .select('*')
      .single();

    if (error) {
      throw new HttpError(500, 'Failed to update supermarket verification status', error);
    }

    response.json({
      supermarket: data,
    });
  })
);

