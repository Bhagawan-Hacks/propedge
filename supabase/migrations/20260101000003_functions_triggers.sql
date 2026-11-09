-- ==============================================================================
-- Migration: 20260101000003_functions_triggers.sql
-- Description: Automated Triggers, Atomic RPC Engine Functions & Realtime Publication
-- ==============================================================================

-- 1. AUTOMATIC PROFILE CREATION TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT := 'user';
BEGIN
    -- Check if user metadata specifies role or if email matches designated admin
    IF NEW.raw_user_meta_data->>'role' = 'admin' THEN
        user_role := 'admin';
    END IF;

    INSERT INTO public.profiles (id, email, full_name, role, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        user_role,
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
        updated_at = timezone('utc'::text, now());

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if already exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. ATOMIC TRADE EXECUTION RPC (Locks account row to prevent margin race condition)
CREATE OR REPLACE FUNCTION public.execute_trade_atomic(
    p_account_id UUID,
    p_symbol TEXT,
    p_side TEXT,
    p_size NUMERIC,
    p_executed_price NUMERIC,
    p_leverage INTEGER,
    p_stop_loss NUMERIC DEFAULT NULL,
    p_take_profit NUMERIC DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_account RECORD;
    v_order_id UUID;
    v_position_id UUID;
    v_position_value NUMERIC;
    v_required_margin NUMERIC;
    v_free_margin NUMERIC;
BEGIN
    -- Row-level lock on trading_account
    SELECT * INTO v_account
    FROM public.trading_accounts
    WHERE id = p_account_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Trading account not found');
    END IF;

    -- Validate account is active
    IF v_account.status NOT IN ('phase1', 'phase2', 'funded') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Account is not in active trading status (' || v_account.status || ')');
    END IF;

    -- Calculate margin requirement
    v_position_value := p_size * p_executed_price;
    v_required_margin := round(v_position_value / p_leverage, 2);

    IF v_required_margin > v_account.free_margin THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient free margin. Required: $' || v_required_margin || ', Available: $' || v_account.free_margin);
    END IF;

    -- 1. Insert filled order
    INSERT INTO public.orders (
        account_id, symbol, side, type, requested_price, executed_price,
        size, leverage, stop_loss, take_profit, status, executed_at
    ) VALUES (
        p_account_id, p_symbol, p_side, 'MARKET', p_executed_price, p_executed_price,
        p_size, p_leverage, p_stop_loss, p_take_profit, 'FILLED', timezone('utc'::text, now())
    ) RETURNING id INTO v_order_id;

    -- 2. Insert open position
    INSERT INTO public.positions (
        account_id, order_id, symbol, side, size, entry_price, current_price,
        leverage, margin, stop_loss, take_profit, unrealized_pnl
    ) VALUES (
        p_account_id, v_order_id, p_symbol, p_side, p_size, p_executed_price, p_executed_price,
        p_leverage, v_required_margin, p_stop_loss, p_take_profit, 0.00
    ) RETURNING id INTO v_position_id;

    -- 3. Update account margin used and free margin
    UPDATE public.trading_accounts
    SET margin_used = margin_used + v_required_margin,
        free_margin = current_equity - (margin_used + v_required_margin),
        updated_at = timezone('utc'::text, now())
    WHERE id = p_account_id;

    RETURN jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'position_id', v_position_id,
        'margin', v_required_margin
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. ATOMIC CLOSE POSITION RPC
CREATE OR REPLACE FUNCTION public.close_position_atomic(
    p_position_id UUID,
    p_exit_price NUMERIC,
    p_close_reason TEXT DEFAULT 'MANUAL'
)
RETURNS JSONB AS $$
DECLARE
    v_pos RECORD;
    v_account RECORD;
    v_realized_pnl NUMERIC;
    v_fee NUMERIC := 0.00;
    v_trade_id UUID;
    v_new_balance NUMERIC;
    v_new_margin_used NUMERIC;
    v_new_free_margin NUMERIC;
    v_trading_day DATE := CURRENT_DATE;
    v_days_count INTEGER;
BEGIN
    -- Select position and lock
    SELECT * INTO v_pos
    FROM public.positions
    WHERE id = p_position_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Position not found');
    END IF;

    -- Lock trading account
    SELECT * INTO v_account
    FROM public.trading_accounts
    WHERE id = v_pos.account_id
    FOR UPDATE;

    -- Calculate P&L:
    -- BUY: size * (exit_price - entry_price)
    -- SELL: size * (entry_price - exit_price)
    IF v_pos.side = 'BUY' THEN
        v_realized_pnl := round(v_pos.size * (p_exit_price - v_pos.entry_price), 2);
    ELSE
        v_realized_pnl := round(v_pos.size * (v_pos.entry_price - p_exit_price), 2);
    END IF;

    -- Fee simulation (0.01% of notional)
    v_fee := round((v_pos.size * p_exit_price) * 0.0001, 2);
    v_realized_pnl := v_realized_pnl - v_fee;

    v_new_balance := v_account.current_balance + v_realized_pnl;
    v_new_margin_used := GREATEST(0, v_account.margin_used - v_pos.margin);
    v_new_free_margin := v_new_balance - v_new_margin_used;

    -- Update trading days count if first trade of day
    v_days_count := v_account.trading_days_count;
    IF v_account.current_trading_day < v_trading_day THEN
        v_days_count := v_days_count + 1;
    END IF;

    -- 1. Record closed trade in history
    INSERT INTO public.trades (
        account_id, position_id, symbol, side, size,
        entry_price, exit_price, realized_pnl, fee, close_reason,
        opened_at, closed_at
    ) VALUES (
        v_pos.account_id, v_pos.id, v_pos.symbol, v_pos.side, v_pos.size,
        v_pos.entry_price, p_exit_price, v_realized_pnl, v_fee, p_close_reason,
        v_pos.opened_at, timezone('utc'::text, now())
    ) RETURNING id INTO v_trade_id;

    -- 2. Delete open position
    DELETE FROM public.positions WHERE id = p_position_id;

    -- 3. Update account balance, margin, and high water mark
    UPDATE public.trading_accounts
    SET current_balance = v_new_balance,
        current_equity = v_new_balance,
        margin_used = v_new_margin_used,
        free_margin = v_new_free_margin,
        high_water_mark = GREATEST(high_water_mark, v_new_balance),
        current_trading_day = v_trading_day,
        trading_days_count = v_days_count,
        updated_at = timezone('utc'::text, now())
    WHERE id = v_pos.account_id;

    -- 4. Record equity snapshot
    INSERT INTO public.equity_snapshots (
        account_id, equity, balance, daily_pnl, drawdown_pct
    ) VALUES (
        v_pos.account_id,
        v_new_balance,
        v_new_balance,
        v_new_balance - v_account.day_start_equity,
        round(((v_account.initial_balance - v_new_balance) / v_account.initial_balance) * 100, 2)
    );

    RETURN jsonb_build_object(
        'success', true,
        'trade_id', v_trade_id,
        'realized_pnl', v_realized_pnl,
        'new_balance', v_new_balance
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. REALTIME REPLICATION CONFIGURATION
-- Publish changes so Supabase Realtime client receives instant updates
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.trading_accounts;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.positions;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.trades;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rule_events;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
