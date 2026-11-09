-- ==============================================================================
-- Migration: 20260101000001_rls_policies.sql
-- Description: Row Level Security (RLS) Policies for Multi-Tenant Data Isolation
-- ==============================================================================

-- 1. Helper function to check if the current requesting user has the 'admin' role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. ENABLE RLS ON ALL TABLES
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

-- ==============================================================================
-- PROFILES POLICIES
-- ==============================================================================
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins have full access to profiles"
    ON public.profiles FOR ALL
    USING (public.is_admin());

-- ==============================================================================
-- PLANS POLICIES (Publicly visible to all authenticated and anonymous visitors)
-- ==============================================================================
CREATE POLICY "Anyone can view active plans"
    ON public.plans FOR SELECT
    USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage plans"
    ON public.plans FOR ALL
    USING (public.is_admin());

-- ==============================================================================
-- TRADING ACCOUNTS POLICIES
-- ==============================================================================
CREATE POLICY "Users can view their own trading accounts"
    ON public.trading_accounts FOR SELECT
    USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can update their own trading accounts"
    ON public.trading_accounts FOR UPDATE
    USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can manage all trading accounts"
    ON public.trading_accounts FOR ALL
    USING (public.is_admin());

-- ==============================================================================
-- ORDERS POLICIES
-- ==============================================================================
CREATE POLICY "Users can view orders for their accounts"
    ON public.orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.trading_accounts
            WHERE trading_accounts.id = orders.account_id
            AND (trading_accounts.user_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "Users can place orders for their accounts"
    ON public.orders FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.trading_accounts
            WHERE trading_accounts.id = orders.account_id
            AND trading_accounts.user_id = auth.uid()
            AND trading_accounts.status IN ('phase1', 'phase2', 'funded')
        )
    );

CREATE POLICY "Admins can manage all orders"
    ON public.orders FOR ALL
    USING (public.is_admin());

-- ==============================================================================
-- POSITIONS POLICIES
-- ==============================================================================
CREATE POLICY "Users can view positions for their accounts"
    ON public.positions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.trading_accounts
            WHERE trading_accounts.id = positions.account_id
            AND (trading_accounts.user_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "Admins can manage all positions"
    ON public.positions FOR ALL
    USING (public.is_admin());

-- ==============================================================================
-- TRADES POLICIES
-- ==============================================================================
CREATE POLICY "Users can view closed trades for their accounts"
    ON public.trades FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.trading_accounts
            WHERE trading_accounts.id = trades.account_id
            AND (trading_accounts.user_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "Users can update trade journal notes"
    ON public.trades FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.trading_accounts
            WHERE trading_accounts.id = trades.account_id
            AND trading_accounts.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.trading_accounts
            WHERE trading_accounts.id = trades.account_id
            AND trading_accounts.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all trades"
    ON public.trades FOR ALL
    USING (public.is_admin());

-- ==============================================================================
-- EQUITY SNAPSHOTS POLICIES
-- ==============================================================================
CREATE POLICY "Users can view equity snapshots for their accounts"
    ON public.equity_snapshots FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.trading_accounts
            WHERE trading_accounts.id = equity_snapshots.account_id
            AND (trading_accounts.user_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "Admins can manage snapshots"
    ON public.equity_snapshots FOR ALL
    USING (public.is_admin());

-- ==============================================================================
-- RULE EVENTS POLICIES
-- ==============================================================================
CREATE POLICY "Users can view rule audit events for their accounts"
    ON public.rule_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.trading_accounts
            WHERE trading_accounts.id = rule_events.account_id
            AND (trading_accounts.user_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "Admins can manage rule events"
    ON public.rule_events FOR ALL
    USING (public.is_admin());

-- ==============================================================================
-- PAYOUTS POLICIES
-- ==============================================================================
CREATE POLICY "Users can view payouts for their accounts"
    ON public.payouts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.trading_accounts
            WHERE trading_accounts.id = payouts.account_id
            AND (trading_accounts.user_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "Users can create payout requests for funded accounts"
    ON public.payouts FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.trading_accounts
            WHERE trading_accounts.id = payouts.account_id
            AND trading_accounts.user_id = auth.uid()
            AND trading_accounts.status = 'funded'
        )
    );

CREATE POLICY "Admins can manage all payouts"
    ON public.payouts FOR ALL
    USING (public.is_admin());

-- ==============================================================================
-- PAYMENTS POLICIES
-- ==============================================================================
CREATE POLICY "Users can view their own payments"
    ON public.payments FOR SELECT
    USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can manage all payments"
    ON public.payments FOR ALL
    USING (public.is_admin());
