-- =============================================================================
-- Add market_items to errands
-- Allows customers to provide an itemized list with estimated prices for Market runs
-- =============================================================================

ALTER TABLE public.errands 
  ADD COLUMN IF NOT EXISTS market_items jsonb DEFAULT '[]'::jsonb;
