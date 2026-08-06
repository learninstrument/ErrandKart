-- =============================================================================
-- ErrandKart Trust Chain Migration
-- Adds item cost, seller banking info, and photo proof columns to errands.
-- Updates status enum and escrow hold RPC.
-- =============================================================================

-- 1. Add new columns to errands table
ALTER TABLE public.errands 
  ADD COLUMN IF NOT EXISTS budget_item_cost numeric(12,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS market_photo_url varchar,
  ADD COLUMN IF NOT EXISTS receipt_photo_url varchar,
  ADD COLUMN IF NOT EXISTS seller_bank_code varchar,
  ADD COLUMN IF NOT EXISTS seller_account_number varchar,
  ADD COLUMN IF NOT EXISTS seller_account_name varchar,
  ADD COLUMN IF NOT EXISTS item_funds_released_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz;

-- 2. Update status constraint
ALTER TABLE public.errands DROP CONSTRAINT IF EXISTS errands_status_check;

ALTER TABLE public.errands ADD CONSTRAINT errands_status_check 
  CHECK (status in (
    'pending', 
    'active', 
    'heading_to_pickup', 
    'arrived_at_pickup', 
    'at_market', 
    'item_funds_requested', 
    'item_funds_released', 
    'items_purchased', 
    'picked_up', 
    'heading_to_dropoff', 
    'arrived_at_dropoff', 
    'dropped_off', 
    'delivered',
    'customer_confirmed',
    'en_route', 
    'arrived', 
    'completed', 
    'cancelled',
    'disputed'
  ));

-- 3. Replace ledger_escrow_hold to include item cost
CREATE OR REPLACE FUNCTION public.ledger_escrow_hold(
    p_customer_id UUID,
    p_amount NUMERIC, 
    p_errand_id UUID,
    p_reference VARCHAR
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_customer_balance NUMERIC;
    v_txg_id UUID;
    v_total_escrow NUMERIC;
    v_errand RECORD;
BEGIN
    -- Check if reference already exists
    IF EXISTS (SELECT 1 FROM public.transaction_groups WHERE reference = p_reference) THEN
        RETURN jsonb_build_object('duplicate', true, 'transaction_group_id', (SELECT id FROM public.transaction_groups WHERE reference = p_reference LIMIT 1));
    END IF;

    -- Fetch errand to calculate exact escrow (item + runner fee + app fee)
    SELECT budget_item_cost, budget_customer_fee, budget_service_fee 
    INTO v_errand 
    FROM public.errands 
    WHERE id = p_errand_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Errand not found';
    END IF;

    v_total_escrow := COALESCE(v_errand.budget_item_cost, 0) + COALESCE(v_errand.budget_customer_fee, 0) + COALESCE(v_errand.budget_service_fee, 0);

    IF p_amount != v_total_escrow THEN
        RAISE EXCEPTION 'Payment amount % does not match required escrow amount %', p_amount, v_total_escrow;
    END IF;

    v_customer_balance := public.get_wallet_balance(p_customer_id);
    IF v_customer_balance < v_total_escrow THEN
        RAISE EXCEPTION 'Insufficient wallet balance (Balance: %, Required: %)', v_customer_balance, v_total_escrow;
    END IF;

    -- Create Transaction Group
    INSERT INTO public.transaction_groups (reference, type, status, amount, initiator_id, metadata)
    VALUES (p_reference, 'escrow', 'completed', v_total_escrow, p_customer_id, jsonb_build_object('errand_id', p_errand_id))
    RETURNING id INTO v_txg_id;

    -- DEBIT Customer Wallet
    INSERT INTO public.ledger_entries (transaction_group_id, account_type, account_id, entry_type, amount)
    VALUES (v_txg_id, 'customer_wallet', p_customer_id::TEXT, 'DEBIT', v_total_escrow);

    -- CREDIT Platform Escrow
    INSERT INTO public.ledger_entries (transaction_group_id, account_type, account_id, entry_type, amount)
    VALUES (v_txg_id, 'platform_escrow', 'SYSTEM', 'CREDIT', v_total_escrow);

    -- Update Errand Payment Status
    UPDATE public.errands SET payment_status = 'escrow_held' WHERE id = p_errand_id;

    v_customer_balance := public.get_wallet_balance(p_customer_id);

    RETURN jsonb_build_object(
        'success', true, 
        'transaction_group_id', v_txg_id,
        'new_balance', v_customer_balance,
        'held_amount', v_total_escrow
    );
END;
$$;

-- 4. Create ledger_item_fund_release for Paystack Direct Transfers
CREATE OR REPLACE FUNCTION public.ledger_item_fund_release(
    p_errand_id UUID,
    p_reference VARCHAR
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_txg_id UUID;
    v_errand RECORD;
BEGIN
    -- Check if reference already exists
    IF EXISTS (SELECT 1 FROM public.transaction_groups WHERE reference = p_reference) THEN
        RETURN jsonb_build_object('duplicate', true, 'transaction_group_id', (SELECT id FROM public.transaction_groups WHERE reference = p_reference LIMIT 1));
    END IF;

    SELECT customer_id, runner_id, budget_item_cost, seller_account_name
    INTO v_errand 
    FROM public.errands 
    WHERE id = p_errand_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Errand not found';
    END IF;

    IF COALESCE(v_errand.budget_item_cost, 0) <= 0 THEN
        RAISE EXCEPTION 'No item cost to release';
    END IF;

    -- Create Transaction Group
    INSERT INTO public.transaction_groups (reference, type, status, amount, initiator_id, metadata)
    VALUES (p_reference, 'payout', 'completed', v_errand.budget_item_cost, v_errand.customer_id, jsonb_build_object('errand_id', p_errand_id, 'seller_name', v_errand.seller_account_name))
    RETURNING id INTO v_txg_id;

    -- DEBIT Platform Escrow
    INSERT INTO public.ledger_entries (transaction_group_id, account_type, account_id, entry_type, amount)
    VALUES (v_txg_id, 'platform_escrow', 'SYSTEM', 'DEBIT', v_errand.budget_item_cost);

    -- CREDIT Paystack Outflow (Since we are doing a direct transfer to the seller)
    INSERT INTO public.ledger_entries (transaction_group_id, account_type, account_id, entry_type, amount)
    VALUES (v_txg_id, 'paystack_outflow', 'SYSTEM', 'CREDIT', v_errand.budget_item_cost);

    -- Update Errand
    UPDATE public.errands 
    SET item_funds_released_at = now(), status = 'item_funds_released' 
    WHERE id = p_errand_id;

    RETURN jsonb_build_object(
        'success', true, 
        'transaction_group_id', v_txg_id,
        'released_amount', v_errand.budget_item_cost
    );
END;
$$;
