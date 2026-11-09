import { TradingAccount, Plan, RiskStatus } from '@/types';

export const MAX_DAILY_LOSS_PCT = 5.0; // 5%
export const MAX_TOTAL_DRAWDOWN_PCT = 10.0; // 10%
export const PHASE1_PROFIT_TARGET_PCT = 8.0; // 8%
export const PHASE2_PROFIT_TARGET_PCT = 5.0; // 5%
export const MIN_TRADING_DAYS = 5;

/**
 * Calculates current risk compliance for a trading account
 */
export function evaluateAccountRisk(
  account: {
    initial_balance: number;
    current_balance: number;
    current_equity: number;
    day_start_equity: number;
    trading_days_count: number;
    status: string;
  },
  plan?: {
    phase1_target_pct?: number;
    phase2_target_pct?: number;
    max_daily_loss_pct?: number;
    max_total_drawdown_pct?: number;
    min_trading_days?: number;
  }
): RiskStatus {
  const initialBalance = Number(account.initial_balance);
  const currentEquity = Number(account.current_equity);
  const dayStartEquity = Number(account.day_start_equity);
  const tradingDays = Number(account.trading_days_count);

  const targetPhase1 = plan?.phase1_target_pct ?? PHASE1_PROFIT_TARGET_PCT;
  const targetPhase2 = plan?.phase2_target_pct ?? PHASE2_PROFIT_TARGET_PCT;
  const targetPct = account.status === 'phase1' ? targetPhase1 : targetPhase2;
  const maxDailyPct = plan?.max_daily_loss_pct ?? MAX_DAILY_LOSS_PCT;
  const maxDrawdownPct = plan?.max_total_drawdown_pct ?? MAX_TOTAL_DRAWDOWN_PCT;
  const requiredDays = plan?.min_trading_days ?? MIN_TRADING_DAYS;

  // 1. Daily Drawdown Calculation
  // Daily loss = dayStartEquity - currentEquity
  const currentDailyLoss = Math.max(0, dayStartEquity - currentEquity);
  const dailyLossPct = dayStartEquity > 0 
    ? Math.round(((currentDailyLoss / dayStartEquity) * 100) * 100) / 100
    : 0;
  const dailyLossLimit = Math.round((dayStartEquity * (maxDailyPct / 100)) * 100) / 100;
  const dailyLossBreached = dailyLossPct >= maxDailyPct;

  // 2. Max Total Drawdown Calculation
  // Total drawdown = initialBalance - currentEquity
  const currentDrawdown = Math.max(0, initialBalance - currentEquity);
  const drawdownPct = initialBalance > 0
    ? Math.round(((currentDrawdown / initialBalance) * 100) * 100) / 100
    : 0;
  const maxTotalDrawdown = Math.round((initialBalance * (maxDrawdownPct / 100)) * 100) / 100;
  const drawdownBreached = drawdownPct >= maxDrawdownPct;

  // 3. Profit Target
  const currentProfit = currentEquity - initialBalance;
  const profitPct = initialBalance > 0
    ? Math.round(((currentProfit / initialBalance) * 100) * 100) / 100
    : 0;
  const profitTarget = Math.round((initialBalance * (targetPct / 100)) * 100) / 100;
  const profitTargetReached = profitPct >= targetPct;

  // 4. Min Trading Days
  const tradingDaysCompleted = tradingDays >= requiredDays;

  // Phase transition qualification
  const canPassPhase = (account.status === 'phase1' || account.status === 'phase2') &&
                       profitTargetReached &&
                       tradingDaysCompleted &&
                       !dailyLossBreached &&
                       !drawdownBreached;

  return {
    dailyLossLimit,
    currentDailyLoss,
    dailyLossPct,
    dailyLossBreached,
    maxTotalDrawdown,
    currentDrawdown,
    drawdownPct,
    drawdownBreached,
    profitTarget,
    currentProfit,
    profitPct,
    profitTargetReached,
    minTradingDays: requiredDays,
    currentTradingDays: tradingDays,
    tradingDaysCompleted,
    canPassPhase,
  };
}

