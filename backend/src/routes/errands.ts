import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler } from '../utils/async-handler.js';
import { HttpError } from '../utils/http-error.js';
import { requireAuth } from './auth.js';

export const errandsRouter = Router();

const createErrandSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string(),
  fulfillment_mode: z.string(),
  pickup_location: z.string().min(1),
  dropoff_location: z.string().min(1),
  budget: z.number(),
  supermarket_name: z.string().optional(),
  order_ref: z.string().optional(),
  supermarket_contact: z.string().optional(),
  requires_cooler: z.boolean(),
  pickup_lat: z.number().optional(),
  pickup_lng: z.number().optional(),
  dropoff_lat: z.number().optional(),
  dropoff_lng: z.number().optional(),
});

// POST /api/errands - Customer creates a new errand
errandsRouter.post(
  '/',
  asyncHandler(async (request, response) => {
    const context = await requireAuth(request);
    const authUserId = context.authUser?.id;
    if (!authUserId) throw new HttpError(401, 'Unauthorized');

    const payload = createErrandSchema.parse(request.body);

    const { data, error } = await supabaseAdmin
      .from('errands')
      .insert({
        customer_id: authUserId,
        title: payload.title,
        description: payload.description,
        category: payload.category,
        fulfillment_mode: payload.fulfillment_mode,
        pickup_address: payload.pickup_location,
        dropoff_address: payload.dropoff_location,
        budget_customer_fee: payload.budget, // This is the runner's payout
        supermarket_name: payload.supermarket_name,
        supermarket_order_ref: payload.order_ref,
        supermarket_contact: payload.supermarket_contact,
        requires_cooler: payload.requires_cooler,
        pickup_lat: payload.pickup_lat,
        pickup_lng: payload.pickup_lng,
        dropoff_lat: payload.dropoff_lat,
        dropoff_lng: payload.dropoff_lng,
      })
      .select('*')
      .single();

    if (error) throw new HttpError(500, 'Failed to create errand', error);
    response.status(201).json({ errand: data });
  })
);

// GET /api/errands - Get errands for the current user (customer or runner)
errandsRouter.get(
  '/',
  asyncHandler(async (request, response) => {
    const context = await requireAuth(request);
    const userId = context.authUser?.id;
    if (!userId) throw new HttpError(401, 'Unauthorized');
    const userRole = context.profile.role;

    let query = supabaseAdmin
      .from('errands')
      .select('*, customer:customer_id(id, full_name, phone_number), runner:runner_id(id, full_name, phone_number)');

    if (userRole === 'customer') query = query.eq('customer_id', userId);
    else if (userRole === 'runner') query = query.eq('runner_id', userId);
    else throw new HttpError(403, 'Access denied for this role.');

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw new HttpError(500, 'Failed to fetch errands', error);

    const formatted = (data ?? []).map(o => {
      const budget = o.budget_customer_fee ?? o.budget_service_fee ?? 0;
      return {
        ...o,
        budget_customer_fee: budget,
        budget_service_fee: budget,
      };
    });

    response.json({ errands: formatted });
  })
);

// GET /api/errands/available - Get all pending errands for runners
errandsRouter.get(
  '/available',
  asyncHandler(async (request, response) => {
    await requireAuth(request); // Just ensures user is logged in
    const { data, error } = await supabaseAdmin
      .from('errands')
      .select('*, customer:customer_id(id, full_name, phone_number)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw new HttpError(500, 'Failed to fetch available errands', error);

    const formatted = (data ?? []).map(o => {
      const budget = o.budget_customer_fee ?? o.budget_service_fee ?? 0;
      return {
        ...o,
        budget_customer_fee: budget,
        budget_service_fee: budget,
      };
    });

    response.json({ errands: formatted });
  })
);

// GET /api/errands/:id - Get a specific errand by ID
errandsRouter.get(
  '/:id',
  asyncHandler(async (request, response) => {
    await requireAuth(request);
    const { id } = request.params;
    const { data, error } = await supabaseAdmin
      .from('errands')
      .select('*, customer:customer_id(id, full_name, phone_number), runner:runner_id(id, full_name, phone_number)')
      .eq('id', id)
      .single();

    if (error || !data) throw new HttpError(404, 'Errand not found', error);

    const budget = data.budget_customer_fee ?? data.budget_service_fee ?? 0;
    const formatted = {
      ...data,
      budget_customer_fee: budget,
      budget_service_fee: budget,
    };

    response.json({ errand: formatted });
  })
);

// PATCH /api/errands/:id/accept - Runner accepts an errand
errandsRouter.patch(
  '/:id/accept',
  asyncHandler(async (request, response) => {
    const context = await requireAuth(request);
    if (context.profile.role !== 'runner') {
      throw new HttpError(403, 'Only runners can accept errands.');
    }
    const { id } = request.params;

    // Check if errand is still pending to prevent race conditions
    const { data: existingErrand, error: fetchError } = await supabaseAdmin.from('errands').select('status').eq('id', id).single();

    if (fetchError || !existingErrand) throw new HttpError(404, 'Errand not found.');
    if (existingErrand.status !== 'pending') throw new HttpError(409, 'Errand has already been accepted.');

    const authUserId = context.authUser?.id;
    if (!authUserId) throw new HttpError(401, 'Unauthorized');

    const { data, error } = await supabaseAdmin
      .from('errands')
      .update({ status: 'active', runner_id: authUserId })
      .eq('id', id)
      .select('*, customer:customer_id(id, full_name, phone_number), runner:runner_id(id, full_name, phone_number)')
      .single();

    if (error) throw new HttpError(500, 'Failed to accept errand', error);

    const budget = data.budget_customer_fee ?? data.budget_service_fee ?? 0;
    const formatted = {
      ...data,
      budget_customer_fee: budget,
      budget_service_fee: budget,
    };

    response.json({ errand: formatted });
  })
);

// PATCH /api/errands/:id/status - Update errand status/progress (e.g. shopping, en_route, arrived, completed)
errandsRouter.patch(
  '/:id/status',
  asyncHandler(async (request, response) => {
    const context = await requireAuth(request);
    const { id } = request.params;
    const { status, proof_of_purchase_url } = z.object({
      status: z.enum(['pending', 'active', 'shopping', 'en_route', 'arrived', 'completed', 'cancelled']),
      proof_of_purchase_url: z.string().url().optional(),
    }).parse(request.body);

    const { data: errand, error: fetchError } = await supabaseAdmin
      .from('errands')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !errand) throw new HttpError(404, 'Errand not found');

    const authUserId = context.authUser?.id;
    if (!authUserId) throw new HttpError(401, 'Unauthorized');

    const isRunner = context.profile.role === 'runner' && errand.runner_id === authUserId;
    const isCustomer = context.profile.role === 'customer' && errand.customer_id === authUserId;
    const isAdmin = context.profile.role === 'admin';

    if (!isRunner && !isCustomer && !isAdmin) {
      throw new HttpError(403, 'Access denied. You do not have permission to update this errand.');
    }

    const updatePayload: any = { status };
    if (proof_of_purchase_url) {
      updatePayload.proof_of_purchase_url = proof_of_purchase_url;
    }

    const { data, error } = await supabaseAdmin
      .from('errands')
      .update(updatePayload)
      .eq('id', id)
      .select('*, customer:customer_id(id, full_name, phone_number), runner:runner_id(id, full_name, phone_number)')
      .single();

    if (error) throw new HttpError(500, 'Failed to update errand status', error);

    const budget = data.budget_customer_fee ?? data.budget_service_fee ?? 0;
    const formatted = {
      ...data,
      budget_customer_fee: budget,
      budget_service_fee: budget,
    };

    response.json({ errand: formatted });
  })
);

// PATCH /api/errands/:id/location - Update runner's current GPS location
errandsRouter.patch(
  '/:id/location',
  asyncHandler(async (request, response) => {
    const context = await requireAuth(request);
    const authUserId = context.authUser?.id;
    if (!authUserId) throw new HttpError(401, 'Unauthorized');

    const { id } = request.params;
    const { lat, lng } = z.object({
      lat: z.number(),
      lng: z.number(),
    }).parse(request.body);

    const { data: errand, error: fetchError } = await supabaseAdmin
      .from('errands')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !errand) throw new HttpError(404, 'Errand not found');

    // Only the assigned runner can update their location
    if (errand.runner_id !== authUserId) {
      throw new HttpError(403, 'Unauthorized. Only the assigned runner can update location.');
    }

    const { data, error } = await supabaseAdmin
      .from('errands')
      .update({ runner_lat: lat, runner_lng: lng })
      .eq('id', id)
      .select('*, customer:customer_id(id, full_name, phone_number), runner:runner_id(id, full_name, phone_number)')
      .single();

    if (error) throw new HttpError(500, 'Failed to update runner location', error);

    const budget = data.budget_customer_fee ?? data.budget_service_fee ?? 0;
    const formatted = {
      ...data,
      budget_customer_fee: budget,
      budget_service_fee: budget,
    };

    response.json({ errand: formatted });
  })
);