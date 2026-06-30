import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler } from '../utils/async-handler.js';
import { HttpError } from '../utils/http-error.js';
import { requireAuth } from './auth.js';

export const locationsRouter = Router();

// GET /api/locations - Fetch user's saved locations
locationsRouter.get(
  '/',
  asyncHandler(async (request, response) => {
    const context = await requireAuth(request);
    const userId = context.authUser?.id;
    if (!userId) throw new HttpError(401, 'Unauthorized');

    const { data, error } = await supabaseAdmin
      .from('saved_locations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new HttpError(500, 'Failed to fetch saved locations', error);
    }
    response.json({ locations: data });
  })
);

// GET /api/locations/translate-pin - Translate GPS to Address via Backend (Logs to Terminal)
locationsRouter.get(
  '/translate-pin',
  asyncHandler(async (request, response) => {
    const { lat, lng } = request.query;

    console.log(`\n[Backend Location] Request received! Lat: ${lat}, Lng: ${lng}`);

    if (!lat || !lng) {
      console.error('[Backend Location] Error: Missing coordinates');
      throw new HttpError(400, 'Latitude and longitude are required');
    }

    try {
      console.log(`[Backend Location] Calling OpenStreetMap API...`);
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: { 'User-Agent': 'ErrandKart-Backend/1.0' }
      });
      const geoData = await geoRes.json();
      
      console.log('[Backend Location] Success! OpenStreetMap replied with:', geoData.display_name);
      response.json(geoData);
    } catch (error) {
      console.error('[Backend Location] Critical Error calling OpenStreetMap:', error);
      throw new HttpError(500, 'Failed to reverse geocode', error);
    }
  })
);

const createLocationSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  address: z.string().min(1, 'Address is required'),
});

// POST /api/locations - Create a new saved location
locationsRouter.post(
  '/',
  asyncHandler(async (request, response) => {
    const context = await requireAuth(request);
    const { label, address } = createLocationSchema.parse(request.body);

    // Geocode address to get lat/lng using the free OpenStreetMap API
    let lat, lng;
    await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ng&q=${encodeURIComponent(address)}`,
        { headers: { 'User-Agent': 'ErrandKart-Backend/1.0' } }
      )
      .then(res => {
        if (!res.ok) throw new Error(`Map service returned status ${res.status}`);
        return res.json();
      })
      .then(geoData => {
        if (geoData?.[0]) {
          lat = Number(geoData[0].lat);
          lng = Number(geoData[0].lon);
        } else {
          console.warn(`[Location] Could not find exact coordinates for "${address}", saving as text only.`);
        }
      })
      .catch(geoErr => {
        console.error('Geocoding for saved location failed, but saving text anyway:', geoErr.message);
      });

    const authUserId = context.authUser?.id;
    if (!authUserId) throw new HttpError(401, 'Unauthorized');

    const { data, error } = await supabaseAdmin
      .from('saved_locations')
      .insert({ user_id: authUserId, label, address, lat, lng })
      .select('*')
      .single();

    if (error) {
      if (error.code === '23505') throw new HttpError(409, `A location with the label "${label}" already exists.`);
      throw new HttpError(500, 'Failed to save location', error);
    }

    response.status(201).json({ location: data });
  })
);

// DELETE /api/locations/:id - Delete a saved location
locationsRouter.delete(
  '/:id',
  asyncHandler(async (request, response) => {
    const context = await requireAuth(request);
    const { id } = request.params;
    const authUserId = context.authUser?.id;
    if (!authUserId) throw new HttpError(401, 'Unauthorized');

    const { error } = await supabaseAdmin.from('saved_locations').delete().match({ id, user_id: authUserId });

    if (error) throw new HttpError(500, 'Failed to delete location', error);

    response.status(204).send();
  })
);