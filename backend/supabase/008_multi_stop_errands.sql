-- Phase 4: Multi-Stop Routing & Lifecycle Updates

-- Update errands status constraint to support multi-stop routing
ALTER TABLE public.errands DROP CONSTRAINT IF EXISTS errands_status_check;

ALTER TABLE public.errands ADD CONSTRAINT errands_status_check 
CHECK (status IN (
  'pending', 
  'active', 
  'shopping', 
  'en_route', 
  'arrived', 
  'completed', 
  'cancelled', 
  'heading_to_pickup', 
  'arrived_at_pickup', 
  'picked_up', 
  'heading_to_dropoff', 
  'arrived_at_dropoff', 
  'dropped_off'
));
