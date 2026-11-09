-- ==============================================================================
-- Migration: 20260101000002_seed_plans.sql
-- Description: Seed Challenge Plans ($10k, $25k, $50k, $100k)
-- ==============================================================================

INSERT INTO public.plans (
    id,
    name,
    starting_balance,
    price_usd,
    phase1_target_pct,
    phase2_target_pct,
    max_daily_loss_pct,
    max_total_drawdown_pct,
    min_trading_days,
    max_leverage,
    is_active
) VALUES 
(
    '11111111-1111-1111-1111-111111111111',
    'Starter $10K Challenge',
    10000.00,
    99.00,
    8.00,
    5.00,
    5.00,
    10.00,
    5,
    20,
    true
),
(
    '22222222-2222-2222-2222-222222222222',
    'Pro $25K Challenge',
    25000.00,
    199.00,
    8.00,
    5.00,
    5.00,
    10.00,
    5,
    20,
    true
),
(
    '33333333-3333-3333-3333-333333333333',
    'Elite $50K Challenge',
    50000.00,
    299.00,
    8.00,
    5.00,
    5.00,
    10.00,
    5,
    20,
    true
),
(
    '44444444-4444-4444-4444-444444444444',
    'Master $100K Challenge',
    100000.00,
    499.00,
    8.00,
    5.00,
    5.00,
    10.00,
    5,
    20,
    true
)
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

