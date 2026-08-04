-- ErrandKart Payment Escrow Schema Update
-- Adds payment tracking columns to errands table and errand linking to transactions

-- 1. Add payment_status to errands
ALTER TABLE public.errands ADD COLUMN IF NOT EXISTS payment_status varchar NOT NULL DEFAULT 'unpaid' 
    CHECK (payment_status IN ('unpaid', 'escrow_held', 'released', 'refunded'));

-- 2. Add payment_reference to errands
ALTER TABLE public.errands ADD COLUMN IF NOT EXISTS payment_reference varchar;

-- 3. Add order_id to transactions table to link transactions to specific errands
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES public.errands(id) ON DELETE SET NULL;

-- 4. Create an index on payment_reference for fast webhook lookups
CREATE INDEX IF NOT EXISTS idx_errands_payment_reference ON public.errands(payment_reference);

-- 5. Create an index on order_id in transactions table
CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON public.transactions(order_id);
