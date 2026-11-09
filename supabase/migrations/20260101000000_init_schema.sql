-- ==============================================================================
-- Migration: 20260101000000_init_schema.sql
-- Description: Core Schema for PropEdge Proprietary Trading Simulation Platform
-- ==============================================================================

-- Enable UUID extension if not already available
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

-- 3. TRADING ACCOUNTS (Individual simulated accounts per user challenge)
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

-- 4. ORDERS (Market & Limit orders placed by users)
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

-- 5. POSITIONS (Currently open positions)
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

-- 6. TRADES (Historical executed and closed trades)
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

-- 7. EQUITY SNAPSHOTS (Time-series data for equity curve & drawdown tracking)
CREATE TABLE IF NOT EXISTS public.equity_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
    equity NUMERIC(14, 2) NOT NULL,
    balance NUMERIC(14, 2) NOT NULL,
    daily_pnl NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    drawdown_pct NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    snapshot_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. RULE EVENTS (Audit log of rule breaches, phase passes, liquidations)
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

-- 9. PAYOUTS (Simulated 80% profit splits for funded accounts)
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

-- 10. PAYMENTS (Stripe test checkouts)
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

-- ==============================================================================
-- INDEXES FOR PERFORMANCE & RELATIONAL LOOKUPS
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_trading_accounts_user_id ON public.trading_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_status ON public.trading_accounts(status);
CREATE INDEX IF NOT EXISTS idx_orders_account_id ON public.orders(account_id);
CREATE INDEX IF NOT EXISTS idx_positions_account_id ON public.positions(account_id);
CREATE INDEX IF NOT EXISTS idx_trades_account_id ON public.trades(account_id);
CREATE INDEX IF NOT EXISTS idx_equity_snapshots_account_time ON public.equity_snapshots(account_id, snapshot_at DESC);
CREATE INDEX IF NOT EXISTS idx_rule_events_account_id ON public.rule_events(account_id);
CREATE INDEX IF NOT EXISTS idx_payouts_account_id ON public.payouts(account_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);

