-- 010_atomic_wallet.sql
-- Implements Atomic Transactions (RPC) to prevent race conditions during wallet updates

-- 1. Create a function to atomically deduct escrow hold from a customer
CREATE OR REPLACE FUNCTION process_escrow_hold(
    p_customer_id UUID,
    p_amount NUMERIC,
    p_order_id UUID,
    p_reference VARCHAR
) RETURNS JSON AS $$
DECLARE
    v_current_balance NUMERIC;
    v_transaction_id UUID;
BEGIN
    -- Lock the user row for update to prevent concurrent modifications
    SELECT wallet_balance INTO v_current_balance
    FROM public.users
    WHERE id = p_customer_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    IF v_current_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient wallet balance';
    END IF;

    -- Update balance
    UPDATE public.users
    SET wallet_balance = wallet_balance - p_amount
    WHERE id = p_customer_id;

    -- Insert transaction log
    INSERT INTO public.transactions (user_id, amount, type, order_id, reference)
    VALUES (p_customer_id, p_amount, 'escrow_hold', p_order_id, p_reference)
    RETURNING id INTO v_transaction_id;
    
    -- Update order payment status
    UPDATE public.orders
    SET payment_status = 'escrow_held', payment_reference = p_reference
    WHERE id = p_order_id;

    RETURN json_build_object('success', true, 'transaction_id', v_transaction_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Create a function to atomically add escrow release to a runner
CREATE OR REPLACE FUNCTION process_escrow_release(
    p_runner_id UUID,
    p_amount NUMERIC,
    p_order_id UUID,
    p_reference VARCHAR
) RETURNS JSON AS $$
DECLARE
    v_transaction_id UUID;
BEGIN
    -- Update balance (PostgreSQL handles this atomically even without explicit locking, 
    -- but we do it to ensure we don't have race conditions on exact amounts if needed)
    UPDATE public.users
    SET wallet_balance = COALESCE(wallet_balance, 0) + p_amount
    WHERE id = p_runner_id;

    -- Insert transaction log
    INSERT INTO public.transactions (user_id, amount, type, order_id, reference)
    VALUES (p_runner_id, p_amount, 'escrow_release', p_order_id, p_reference)
    RETURNING id INTO v_transaction_id;
    
    -- Update order payment status
    UPDATE public.orders
    SET payment_status = 'released'
    WHERE id = p_order_id;

    RETURN json_build_object('success', true, 'transaction_id', v_transaction_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
