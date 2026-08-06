-- =============================================================================
-- ErrandKart Double-Entry Ledger System (Bank-Grade Transaction Safety)
-- Run this in Supabase SQL Editor AFTER 010_atomic_wallet.sql
-- =============================================================================

-- 1. Transaction Groups — each logical money movement (top-up, checkout, payout, refund)
CREATE TABLE IF NOT EXISTS public.transaction_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference VARCHAR NOT NULL UNIQUE,          -- idempotency key / Paystack reference
    type VARCHAR NOT NULL CHECK (type IN ('deposit', 'escrow_hold', 'escrow_release', 'withdrawal', 'refund')),
    status VARCHAR NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded', 'disputed', 'failed')),
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR NOT NULL DEFAULT 'NGN',
    initiator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,   -- who triggered it
    errand_id UUID REFERENCES public.errands(id) ON DELETE SET NULL,    -- linked errand (if any)
    metadata JSONB DEFAULT '{}',                -- extra context (paystack ref, notes, etc.)
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_txg_reference ON public.transaction_groups(reference);
CREATE INDEX IF NOT EXISTS idx_txg_initiator ON public.transaction_groups(initiator_id);
CREATE INDEX IF NOT EXISTS idx_txg_errand ON public.transaction_groups(errand_id);
CREATE INDEX IF NOT EXISTS idx_txg_type ON public.transaction_groups(type);
CREATE INDEX IF NOT EXISTS idx_txg_status ON public.transaction_groups(status);
CREATE INDEX IF NOT EXISTS idx_txg_created ON public.transaction_groups(created_at DESC);

-- 2. Ledger Entries — the actual double-entry rows (always created in pairs)
CREATE TABLE IF NOT EXISTS public.ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_group_id UUID NOT NULL REFERENCES public.transaction_groups(id) ON DELETE CASCADE,
    account_type VARCHAR NOT NULL CHECK (account_type IN (
        'customer_wallet', 'runner_wallet', 'escrow', 'paystack_inflow', 'paystack_outflow', 'platform_revenue'
    )),
    account_id VARCHAR NOT NULL,                -- user UUID or 'SYSTEM' or errand UUID
    entry_type VARCHAR NOT NULL CHECK (entry_type IN ('DEBIT', 'CREDIT')),
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    running_balance NUMERIC(12,2),              -- snapshot of balance after this entry
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_le_txg ON public.ledger_entries(transaction_group_id);
CREATE INDEX IF NOT EXISTS idx_le_account ON public.ledger_entries(account_type, account_id);
CREATE INDEX IF NOT EXISTS idx_le_created ON public.ledger_entries(created_at DESC);

-- Prevent exact duplicate ledger entries
CREATE UNIQUE INDEX IF NOT EXISTS idx_le_unique_entry 
    ON public.ledger_entries(transaction_group_id, entry_type, account_type, account_id);

-- =============================================================================
-- 3. get_wallet_balance() — Calculate balance from the ledger (source of truth)
-- =============================================================================
CREATE OR REPLACE FUNCTION get_wallet_balance(p_user_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    v_balance NUMERIC;
BEGIN
    SELECT COALESCE(
        SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE 0 END) -
        SUM(CASE WHEN entry_type = 'DEBIT' THEN amount ELSE 0 END),
        0
    ) INTO v_balance
    FROM public.ledger_entries
    WHERE account_id = p_user_id::TEXT
      AND account_type IN ('customer_wallet', 'runner_wallet');

    RETURN v_balance;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- =============================================================================
-- 4. ledger_deposit() — Atomic wallet top-up (Paystack webhook → customer wallet)
-- =============================================================================
CREATE OR REPLACE FUNCTION ledger_deposit(
    p_user_id UUID,
    p_amount NUMERIC,
    p_reference VARCHAR,
    p_metadata JSONB DEFAULT '{}'
) RETURNS JSON AS $$
DECLARE
    v_txg_id UUID;
    v_new_balance NUMERIC;
    v_existing UUID;
BEGIN
    -- Idempotency: check if this reference was already processed
    SELECT id INTO v_existing FROM public.transaction_groups WHERE reference = p_reference;
    IF FOUND THEN
        RETURN json_build_object('success', true, 'duplicate', true, 'transaction_group_id', v_existing);
    END IF;

    -- Lock the user row to prevent race conditions
    PERFORM id FROM public.users WHERE id = p_user_id FOR UPDATE;

    -- Create the transaction group
    INSERT INTO public.transaction_groups (reference, type, status, amount, initiator_id, metadata)
    VALUES (p_reference, 'deposit', 'completed', p_amount, p_user_id, p_metadata)
    RETURNING id INTO v_txg_id;

    -- DEBIT: Money comes from Paystack
    INSERT INTO public.ledger_entries (transaction_group_id, account_type, account_id, entry_type, amount)
    VALUES (v_txg_id, 'paystack_inflow', 'SYSTEM', 'DEBIT', p_amount);

    -- CREDIT: Money enters customer wallet
    INSERT INTO public.ledger_entries (transaction_group_id, account_type, account_id, entry_type, amount)
    VALUES (v_txg_id, 'customer_wallet', p_user_id::TEXT, 'CREDIT', p_amount);

    -- Update cached balance
    v_new_balance := get_wallet_balance(p_user_id);
    UPDATE public.users SET wallet_balance = v_new_balance WHERE id = p_user_id;

    RETURN json_build_object('success', true, 'duplicate', false, 'transaction_group_id', v_txg_id, 'new_balance', v_new_balance);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 5. ledger_escrow_hold() — Atomic checkout (customer wallet → escrow)
-- =============================================================================
CREATE OR REPLACE FUNCTION ledger_escrow_hold(
    p_customer_id UUID,
    p_amount NUMERIC,
    p_errand_id UUID,
    p_reference VARCHAR
) RETURNS JSON AS $$
DECLARE
    v_txg_id UUID;
    v_current_balance NUMERIC;
    v_new_balance NUMERIC;
    v_existing UUID;
BEGIN
    -- Idempotency
    SELECT id INTO v_existing FROM public.transaction_groups WHERE reference = p_reference;
    IF FOUND THEN
        RETURN json_build_object('success', true, 'duplicate', true, 'transaction_group_id', v_existing);
    END IF;

    -- Lock user row
    SELECT wallet_balance INTO v_current_balance 
    FROM public.users WHERE id = p_customer_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    -- Also check from ledger (belt and suspenders)
    v_current_balance := get_wallet_balance(p_customer_id);

    IF v_current_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient wallet balance. Available: %, Required: %', v_current_balance, p_amount;
    END IF;

    -- Create transaction group
    INSERT INTO public.transaction_groups (reference, type, status, amount, initiator_id, errand_id)
    VALUES (p_reference, 'escrow_hold', 'completed', p_amount, p_customer_id, p_errand_id)
    RETURNING id INTO v_txg_id;

    -- DEBIT: Money leaves customer wallet
    INSERT INTO public.ledger_entries (transaction_group_id, account_type, account_id, entry_type, amount)
    VALUES (v_txg_id, 'customer_wallet', p_customer_id::TEXT, 'DEBIT', p_amount);

    -- CREDIT: Money enters escrow (linked to errand)
    INSERT INTO public.ledger_entries (transaction_group_id, account_type, account_id, entry_type, amount)
    VALUES (v_txg_id, 'escrow', p_errand_id::TEXT, 'CREDIT', p_amount);

    -- Update cached balance
    v_new_balance := get_wallet_balance(p_customer_id);
    UPDATE public.users SET wallet_balance = v_new_balance WHERE id = p_customer_id;

    -- Update errand payment status
    UPDATE public.errands SET payment_status = 'escrow_held', payment_reference = p_reference WHERE id = p_errand_id;

    RETURN json_build_object('success', true, 'duplicate', false, 'transaction_group_id', v_txg_id, 'new_balance', v_new_balance);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 6. ledger_escrow_release() — Atomic runner payout (escrow → runner wallet)
-- =============================================================================
CREATE OR REPLACE FUNCTION ledger_escrow_release(
    p_runner_id UUID,
    p_amount NUMERIC,
    p_errand_id UUID,
    p_reference VARCHAR
) RETURNS JSON AS $$
DECLARE
    v_txg_id UUID;
    v_new_balance NUMERIC;
    v_existing UUID;
BEGIN
    -- Idempotency
    SELECT id INTO v_existing FROM public.transaction_groups WHERE reference = p_reference;
    IF FOUND THEN
        RETURN json_build_object('success', true, 'duplicate', true, 'transaction_group_id', v_existing);
    END IF;

    -- Lock runner row
    PERFORM id FROM public.users WHERE id = p_runner_id FOR UPDATE;

    -- Create transaction group
    INSERT INTO public.transaction_groups (reference, type, status, amount, initiator_id, errand_id)
    VALUES (p_reference, 'escrow_release', 'completed', p_amount, p_runner_id, p_errand_id)
    RETURNING id INTO v_txg_id;

    -- DEBIT: Money leaves escrow
    INSERT INTO public.ledger_entries (transaction_group_id, account_type, account_id, entry_type, amount)
    VALUES (v_txg_id, 'escrow', p_errand_id::TEXT, 'DEBIT', p_amount);

    -- CREDIT: Money enters runner wallet
    INSERT INTO public.ledger_entries (transaction_group_id, account_type, account_id, entry_type, amount)
    VALUES (v_txg_id, 'runner_wallet', p_runner_id::TEXT, 'CREDIT', p_amount);

    -- Update cached balance
    v_new_balance := get_wallet_balance(p_runner_id);
    UPDATE public.users SET wallet_balance = v_new_balance WHERE id = p_runner_id;

    -- Update errand payment status
    UPDATE public.errands SET payment_status = 'released' WHERE id = p_errand_id;

    RETURN json_build_object('success', true, 'duplicate', false, 'transaction_group_id', v_txg_id, 'new_balance', v_new_balance);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 7. ledger_refund() — Atomic refund (escrow → customer wallet)
-- =============================================================================
CREATE OR REPLACE FUNCTION ledger_refund(
    p_customer_id UUID,
    p_amount NUMERIC,
    p_errand_id UUID,
    p_reference VARCHAR
) RETURNS JSON AS $$
DECLARE
    v_txg_id UUID;
    v_new_balance NUMERIC;
    v_existing UUID;
BEGIN
    -- Idempotency
    SELECT id INTO v_existing FROM public.transaction_groups WHERE reference = p_reference;
    IF FOUND THEN
        RETURN json_build_object('success', true, 'duplicate', true, 'transaction_group_id', v_existing);
    END IF;

    -- Lock customer row
    PERFORM id FROM public.users WHERE id = p_customer_id FOR UPDATE;

    -- Create transaction group
    INSERT INTO public.transaction_groups (reference, type, status, amount, initiator_id, errand_id)
    VALUES (p_reference, 'refund', 'completed', p_amount, p_customer_id, p_errand_id)
    RETURNING id INTO v_txg_id;

    -- DEBIT: Money leaves escrow
    INSERT INTO public.ledger_entries (transaction_group_id, account_type, account_id, entry_type, amount)
    VALUES (v_txg_id, 'escrow', p_errand_id::TEXT, 'DEBIT', p_amount);

    -- CREDIT: Money returns to customer wallet
    INSERT INTO public.ledger_entries (transaction_group_id, account_type, account_id, entry_type, amount)
    VALUES (v_txg_id, 'customer_wallet', p_customer_id::TEXT, 'CREDIT', p_amount);

    -- Update cached balance
    v_new_balance := get_wallet_balance(p_customer_id);
    UPDATE public.users SET wallet_balance = v_new_balance WHERE id = p_customer_id;

    -- Update errand payment status
    UPDATE public.errands SET payment_status = 'refunded' WHERE id = p_errand_id;

    -- Mark the original escrow_hold transaction as refunded
    UPDATE public.transaction_groups SET status = 'refunded' WHERE errand_id = p_errand_id AND type = 'escrow_hold';

    RETURN json_build_object('success', true, 'duplicate', false, 'transaction_group_id', v_txg_id, 'new_balance', v_new_balance);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 8. ledger_withdrawal() — Atomic runner withdrawal (runner wallet → bank)
-- =============================================================================
CREATE OR REPLACE FUNCTION ledger_withdrawal(
    p_runner_id UUID,
    p_amount NUMERIC,
    p_reference VARCHAR,
    p_metadata JSONB DEFAULT '{}'
) RETURNS JSON AS $$
DECLARE
    v_txg_id UUID;
    v_current_balance NUMERIC;
    v_new_balance NUMERIC;
    v_existing UUID;
BEGIN
    -- Idempotency
    SELECT id INTO v_existing FROM public.transaction_groups WHERE reference = p_reference;
    IF FOUND THEN
        RETURN json_build_object('success', true, 'duplicate', true, 'transaction_group_id', v_existing);
    END IF;

    -- Lock runner row
    PERFORM id FROM public.users WHERE id = p_runner_id FOR UPDATE;

    -- Check balance from ledger
    v_current_balance := get_wallet_balance(p_runner_id);

    IF v_current_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient wallet balance. Available: %, Required: %', v_current_balance, p_amount;
    END IF;

    -- Create transaction group
    INSERT INTO public.transaction_groups (reference, type, status, amount, initiator_id, metadata)
    VALUES (p_reference, 'withdrawal', 'completed', p_amount, p_runner_id, p_metadata)
    RETURNING id INTO v_txg_id;

    -- DEBIT: Money leaves runner wallet
    INSERT INTO public.ledger_entries (transaction_group_id, account_type, account_id, entry_type, amount)
    VALUES (v_txg_id, 'runner_wallet', p_runner_id::TEXT, 'DEBIT', p_amount);

    -- CREDIT: Money goes to Paystack outflow (bank transfer)
    INSERT INTO public.ledger_entries (transaction_group_id, account_type, account_id, entry_type, amount)
    VALUES (v_txg_id, 'paystack_outflow', 'SYSTEM', 'CREDIT', p_amount);

    -- Update cached balance
    v_new_balance := get_wallet_balance(p_runner_id);
    UPDATE public.users SET wallet_balance = v_new_balance WHERE id = p_runner_id;

    RETURN json_build_object('success', true, 'duplicate', false, 'transaction_group_id', v_txg_id, 'new_balance', v_new_balance);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 9. Integrity check function — verify the entire system is balanced
-- =============================================================================
CREATE OR REPLACE FUNCTION check_ledger_integrity()
RETURNS JSON AS $$
DECLARE
    v_total_debits NUMERIC;
    v_total_credits NUMERIC;
    v_imbalance NUMERIC;
    v_entry_count BIGINT;
BEGIN
    SELECT 
        COALESCE(SUM(CASE WHEN entry_type = 'DEBIT' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE 0 END), 0),
        COUNT(*)
    INTO v_total_debits, v_total_credits, v_entry_count
    FROM public.ledger_entries;

    v_imbalance := v_total_debits - v_total_credits;

    RETURN json_build_object(
        'balanced', v_imbalance = 0,
        'total_debits', v_total_debits,
        'total_credits', v_total_credits,
        'imbalance', v_imbalance,
        'entry_count', v_entry_count
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
