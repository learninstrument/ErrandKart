-- Phase 4: Runner Discovery & Direct Requests

-- 1. Add presence fields to users table (if they don't exist)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS current_lat DOUBLE PRECISION;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS current_lng DOUBLE PRECISION;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS current_transport_mode TEXT DEFAULT 'foot';

-- Create an index to quickly find online runners
CREATE INDEX IF NOT EXISTS idx_users_online ON public.users(role, is_online) WHERE role = 'runner';

-- 2. Create runner_requests table for direct "pick-and-request" flow
CREATE TABLE IF NOT EXISTS public.runner_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    errand_id UUID REFERENCES public.errands(id) ON DELETE CASCADE,
    runner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Index for querying requests
CREATE INDEX IF NOT EXISTS idx_runner_requests_errand ON public.runner_requests(errand_id);
CREATE INDEX IF NOT EXISTS idx_runner_requests_runner ON public.runner_requests(runner_id);

-- 3. RLS for runner_requests
ALTER TABLE public.runner_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can create runner requests"
    ON public.runner_requests FOR INSERT
    WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can view their sent requests"
    ON public.runner_requests FOR SELECT
    USING (auth.uid() = customer_id);

CREATE POLICY "Runners can view requests sent to them"
    ON public.runner_requests FOR SELECT
    USING (auth.uid() = runner_id);

CREATE POLICY "Runners can update requests sent to them"
    ON public.runner_requests FOR UPDATE
    USING (auth.uid() = runner_id);

-- 4. View for active nearby runners
CREATE OR REPLACE VIEW public.active_runners AS
SELECT id, full_name, avatar_url, current_lat, current_lng, current_transport_mode, last_seen
FROM public.users
WHERE role = 'runner' 
AND is_online = true 
AND last_seen > NOW() - INTERVAL '5 minutes';

-- 5. Nearby runner function (Haversine formula to avoid PostGIS dependency)
DROP FUNCTION IF EXISTS find_nearby_runners(double precision, double precision, double precision);
CREATE OR REPLACE FUNCTION find_nearby_runners(customer_lng float, customer_lat float, radius_meters float DEFAULT 5000)
RETURNS TABLE (runner_id uuid, full_name text, distance_m float, is_online boolean, current_lat float, current_lng float) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.full_name,
    (
      6371000 * acos(
        cos(radians(customer_lat)) * cos(radians(u.current_lat)) *
        cos(radians(u.current_lng) - radians(customer_lng)) +
        sin(radians(customer_lat)) * sin(radians(u.current_lat))
      )
    ) AS distance_m,
    u.is_online,
    u.current_lat,
    u.current_lng
  FROM users u
  WHERE u.role = 'runner'
    AND u.is_online = true
    AND u.current_lat IS NOT NULL
    AND u.current_lng IS NOT NULL
    AND (
      6371000 * acos(
        cos(radians(customer_lat)) * cos(radians(u.current_lat)) *
        cos(radians(u.current_lng) - radians(customer_lng)) +
        sin(radians(customer_lat)) * sin(radians(u.current_lat))
      )
    ) <= radius_meters
  ORDER BY distance_m ASC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;
