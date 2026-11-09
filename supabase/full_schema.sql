-- ==============================================================================
-- PROFEDGE CONSOLIDATED DATABASE SETUP (ALL-IN-ONE SCRIPT)
-- Copy and paste this entire script into your Supabase SQL Editor and click "Run"
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. PLANS (Challenge tiers: $10k, $25k, $50k, $100k)
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    starting_balance NUMERIC(14, 2) NOT NULL,
    price_usd NUMERIC(10, 2) NOT NULL,
    phase1_target_pct NUMERIC(5, 2) NOT NULL DEFAULT 8.00,
    phase2_target_pct NUMERIC(5, 2) NOT NULL DEFAULT 5.00,
    max_daily_loss_pct NUMERIC(5, 2) NOT NULL DEFAULT 5.00,
    max_total_drawdown_pct NUMERIC(5, 2) NOT NULL DEFAULT 10.00,
    min_trading_days INTEGER NOT NULL DEFAULT 5,
    max_leverage INTEGER NOT NULL DEFAULT 20,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. TRADING ACCOUNTS
CREATE TABLE IF NOT EXISTS public.trading_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
    account_number TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'phase1' CHECK (status IN ('phase1', 'phase2', 'funded', 'breached', 'passed', 'closed')),
    initial_balance NUMERIC(14, 2) NOT NULL,
    current_balance NUMERIC(14, 2) NOT NULL,
    current_equity NUMERIC(14, 2) NOT NULL,
    margin_used NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    free_margin NUMERIC(14, 2) NOT NULL,
    high_water_mark NUMERIC(14, 2) NOT NULL,
    day_start_equity NUMERIC(14, 2) NOT NULL,
    current_trading_day DATE NOT NULL DEFAULT CURRENT_DATE,
    trading_days_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    side TEXT NOT NULL CHECK (side IN ('BUY', 'SELL')),
    type TEXT NOT NULL DEFAULT 'MARKET' CHECK (type IN ('MARKET', 'LIMIT')),
    requested_price NUMERIC(18, 8) NOT NULL,
    executed_price NUMERIC(18, 8),
    size NUMERIC(18, 8) NOT NULL,
    leverage INTEGER NOT NULL DEFAULT 1,
    stop_loss NUMERIC(18, 8),
    take_profit NUMERIC(18, 8),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'FILLED', 'CANCELLED', 'REJECTED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    executed_at TIMESTAMPTZ
);

-- 5. POSITIONS
CREATE TABLE IF NOT EXISTS public.positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    symbol TEXT NOT NULL,
    side TEXT NOT NULL CHECK (side IN ('BUY', 'SELL')),
    size NUMERIC(18, 8) NOT NULL,
    entry_price NUMERIC(18, 8) NOT NULL,
    current_price NUMERIC(18, 8) NOT NULL,
    leverage INTEGER NOT NULL DEFAULT 1,
    margin NUMERIC(14, 2) NOT NULL,
    stop_loss NUMERIC(18, 8),
    take_profit NUMERIC(18, 8),
    unrealized_pnl NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    opened_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. TRADES
CREATE TABLE IF NOT EXISTS public.trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
    position_id UUID,
    symbol TEXT NOT NULL,
    side TEXT NOT NULL CHECK (side IN ('BUY', 'SELL')),
    size NUMERIC(18, 8) NOT NULL,
    entry_price NUMERIC(18, 8) NOT NULL,
    exit_price NUMERIC(18, 8) NOT NULL,
    realized_pnl NUMERIC(14, 2) NOT NULL,
    fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    close_reason TEXT NOT NULL DEFAULT 'MANUAL' CHECK (close_reason IN ('MANUAL', 'SL', 'TP', 'LIQUIDATION', 'BREACH', 'ADMIN')),
    journal_notes TEXT,
    opened_at TIMESTAMPTZ NOT NULL,
    closed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. EQUITY SNAPSHOTS
CREATE TABLE IF NOT EXISTS public.equity_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
    equity NUMERIC(14, 2) NOT NULL,
    balance NUMERIC(14, 2) NOT NULL,
    daily_pnl NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    drawdown_pct NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    snapshot_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. RULE EVENTS
CREATE TABLE IF NOT EXISTS public.rule_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    rule_name TEXT NOT NULL,
    threshold_value NUMERIC(14, 2),
    breached_value NUMERIC(14, 2),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. PAYOUTS
CREATE TABLE IF NOT EXISTS public.payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
    requested_amount NUMERIC(14, 2) NOT NULL,
    profit_split_pct NUMERIC(5, 2) NOT NULL DEFAULT 80.00,
    payout_amount NUMERIC(14, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'PAID')),
    admin_notes TEXT,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    processed_at TIMESTAMPTZ
);

-- 10. PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
    stripe_session_id TEXT UNIQUE,
    stripe_payment_intent TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCEEDED', 'FAILED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_trading_accounts_user_id ON public.trading_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_status ON public.trading_accounts(status);
CREATE INDEX IF NOT EXISTS idx_orders_account_id ON public.orders(account_id);
CREATE INDEX IF NOT EXISTS idx_positions_account_id ON public.positions(account_id);
CREATE INDEX IF NOT EXISTS idx_trades_account_id ON public.trades(account_id);
CREATE INDEX IF NOT EXISTS idx_equity_snapshots_account_time ON public.equity_snapshots(account_id, snapshot_at DESC);
CREATE INDEX IF NOT EXISTS idx_rule_events_account_id ON public.rule_events(account_id);
CREATE INDEX IF NOT EXISTS idx_payouts_account_id ON public.payouts(account_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);

-- ROW LEVEL SECURITY HELPER & POLICIES
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equity_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rule_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Users can update profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins full profile" ON public.profiles FOR ALL USING (public.is_admin());

CREATE POLICY "Anyone can view active plans" ON public.plans FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins manage plans" ON public.plans FOR ALL USING (public.is_admin());

CREATE POLICY "Users view trading accounts" ON public.trading_accounts FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Users update trading accounts" ON public.trading_accounts FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Admins manage trading accounts" ON public.trading_accounts FOR ALL USING (public.is_admin());

CREATE POLICY "Users view orders" ON public.orders FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.trading_accounts WHERE trading_accounts.id = orders.account_id AND (trading_accounts.user_id = auth.uid() OR public.is_admin()))
);
CREATE POLICY "Users insert orders" ON public.orders FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.trading_accounts WHERE trading_accounts.id = orders.account_id AND trading_accounts.user_id = auth.uid() AND trading_accounts.status IN ('phase1', 'phase2', 'funded'))
);
CREATE POLICY "Admins manage orders" ON public.orders FOR ALL USING (public.is_admin());

CREATE POLICY "Users view positions" ON public.positions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.trading_accounts WHERE trading_accounts.id = positions.account_id AND (trading_accounts.user_id = auth.uid() OR public.is_admin()))
);
CREATE POLICY "Admins manage positions" ON public.positions FOR ALL USING (public.is_admin());

CREATE POLICY "Users view trades" ON public.trades FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.trading_accounts WHERE trading_accounts.id = trades.account_id AND (trading_accounts.user_id = auth.uid() OR public.is_admin()))
);
CREATE POLICY "Users update journal" ON public.trades FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.trading_accounts WHERE trading_accounts.id = trades.account_id AND trading_accounts.user_id = auth.uid())
);
CREATE POLICY "Admins manage trades" ON public.trades FOR ALL USING (public.is_admin());

CREATE POLICY "Users view snapshots" ON public.equity_snapshots FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.trading_accounts WHERE trading_accounts.id = equity_snapshots.account_id AND (trading_accounts.user_id = auth.uid() OR public.is_admin()))
);
CREATE POLICY "Admins manage snapshots" ON public.equity_snapshots FOR ALL USING (public.is_admin());

CREATE POLICY "Users view rule events" ON public.rule_events FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.trading_accounts WHERE trading_accounts.id = rule_events.account_id AND (trading_accounts.user_id = auth.uid() OR public.is_admin()))
);
CREATE POLICY "Admins manage rule events" ON public.rule_events FOR ALL USING (public.is_admin());

CREATE POLICY "Users view payouts" ON public.payouts FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.trading_accounts WHERE trading_accounts.id = payouts.account_id AND (trading_accounts.user_id = auth.uid() OR public.is_admin()))
);
CREATE POLICY "Users create payouts" ON public.payouts FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.trading_accounts WHERE trading_accounts.id = payouts.account_id AND trading_accounts.user_id = auth.uid() AND trading_accounts.status = 'funded')
);
CREATE POLICY "Admins manage payouts" ON public.payouts FOR ALL USING (public.is_admin());

CREATE POLICY "Users view payments" ON public.payments FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Admins manage payments" ON public.payments FOR ALL USING (public.is_admin());

-- SEED PLANS
INSERT INTO public.plans (
    id, name, starting_balance, price_usd, phase1_target_pct, phase2_target_pct,
    max_daily_loss_pct, max_total_drawdown_pct, min_trading_days, max_leverage, is_active
) VALUES 
('11111111-1111-1111-1111-111111111111', 'Starter $10K Challenge', 10000.00, 99.00, 8.00, 5.00, 5.00, 10.00, 5, 20, true),
('22222222-2222-2222-2222-222222222222', 'Pro $25K Challenge', 25000.00, 199.00, 8.00, 5.00, 5.00, 10.00, 5, 20, true),
('33333333-3333-3333-3333-333333333333', 'Elite $50K Challenge', 50000.00, 299.00, 8.00, 5.00, 5.00, 10.00, 5, 20, true),
('44444444-4444-4444-4444-444444444444', 'Master $100K Challenge', 100000.00, 499.00, 8.00, 5.00, 5.00, 10.00, 5, 20, true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    starting_balance = EXCLUDED.starting_balance,
    price_usd = EXCLUDED.price_usd,
    phase1_target_pct = EXCLUDED.phase1_target_pct,
    phase2_target_pct = EXCLUDED.phase2_target_pct,
    max_daily_loss_pct = EXCLUDED.max_daily_loss_pct,
    max_total_drawdown_pct = EXCLUDED.max_total_drawdown_pct,
    min_trading_days = EXCLUDED.min_trading_days,
    max_leverage = EXCLUDED.max_leverage,
    is_active = EXCLUDED.is_active;

-- AUTOMATIC PROFILE CREATION TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT := 'user';
BEGIN
    IF NEW.raw_user_meta_data->>'role' = 'admin' OR NEW.email = 'admin@propedge.demo' THEN
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ATOMIC TRADE EXECUTION RPC
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
BEGIN
    SELECT * INTO v_account FROM public.trading_accounts WHERE id = p_account_id FOR UPDATE;
    IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'error', 'Trading account not found'); END IF;
    IF v_account.status NOT IN ('phase1', 'phase2', 'funded') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Account is not in active trading status');
    END IF;

    v_position_value := p_size * p_executed_price;
    v_required_margin := round(v_position_value / p_leverage, 2);

    IF v_required_margin > v_account.free_margin THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient free margin');
    END IF;

    INSERT INTO public.orders (
        account_id, symbol, side, type, requested_price, executed_price, size, leverage, stop_loss, take_profit, status, executed_at
    ) VALUES (
        p_account_id, p_symbol, p_side, 'MARKET', p_executed_price, p_executed_price, p_size, p_leverage, p_stop_loss, p_take_profit, 'FILLED', timezone('utc'::text, now())
    ) RETURNING id INTO v_order_id;

    INSERT INTO public.positions (
        account_id, order_id, symbol, side, size, entry_price, current_price, leverage, margin, stop_loss, take_profit, unrealized_pnl
    ) VALUES (
        p_account_id, v_order_id, p_symbol, p_side, p_size, p_executed_price, p_executed_price, p_leverage, v_required_margin, p_stop_loss, p_take_profit, 0.00
    ) RETURNING id INTO v_position_id;

    UPDATE public.trading_accounts
    SET margin_used = margin_used + v_required_margin,
        free_margin = current_equity - (margin_used + v_required_margin),
        updated_at = timezone('utc'::text, now())
    WHERE id = p_account_id;

    RETURN jsonb_build_object('success', true, 'order_id', v_order_id, 'position_id', v_position_id, 'margin', v_required_margin);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ATOMIC CLOSE POSITION RPC
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
    SELECT * INTO v_pos FROM public.positions WHERE id = p_position_id FOR UPDATE;
    IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'error', 'Position not found'); END IF;

    SELECT * INTO v_account FROM public.trading_accounts WHERE id = v_pos.account_id FOR UPDATE;

    IF v_pos.side = 'BUY' THEN
        v_realized_pnl := round(v_pos.size * (p_exit_price - v_pos.entry_price), 2);
    ELSE
        v_realized_pnl := round(v_pos.size * (v_pos.entry_price - p_exit_price), 2);
    END IF;

    v_fee := round((v_pos.size * p_exit_price) * 0.0001, 2);
    v_realized_pnl := v_realized_pnl - v_fee;

    v_new_balance := v_account.current_balance + v_realized_pnl;
    v_new_margin_used := GREATEST(0, v_account.margin_used - v_pos.margin);
    v_new_free_margin := v_new_balance - v_new_margin_used;

    v_days_count := v_account.trading_days_count;
    IF v_account.current_trading_day < v_trading_day THEN
        v_days_count := v_days_count + 1;
    END IF;

    INSERT INTO public.trades (
        account_id, position_id, symbol, side, size, entry_price, exit_price, realized_pnl, fee, close_reason, opened_at, closed_at
    ) VALUES (
        v_pos.account_id, v_pos.id, v_pos.symbol, v_pos.side, v_pos.size, v_pos.entry_price, p_exit_price, v_realized_pnl, v_fee, p_close_reason, v_pos.opened_at, timezone('utc'::text, now())
    ) RETURNING id INTO v_trade_id;

    DELETE FROM public.positions WHERE id = p_position_id;

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

    INSERT INTO public.equity_snapshots (account_id, equity, balance, daily_pnl, drawdown_pct)
    VALUES (
        v_pos.account_id, v_new_balance, v_new_balance, v_new_balance - v_account.day_start_equity,
        round(((v_account.initial_balance - v_new_balance) / v_account.initial_balance) * 100, 2)
    );

    RETURN jsonb_build_object('success', true, 'trade_id', v_trade_id, 'realized_pnl', v_realized_pnl, 'new_balance', v_new_balance);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- REALTIME CONFIGURATION
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.trading_accounts; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.positions; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.orders; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.trades; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.rule_events; EXCEPTION WHEN OTHERS THEN NULL; END $$;
