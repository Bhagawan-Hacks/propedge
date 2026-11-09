import { Database } from './database.types';

export * from './database.types';
export * from './binance.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Plan = Database['public']['Tables']['plans']['Row'];
export type TradingAccount = Database['public']['Tables']['trading_accounts']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type Position = Database['public']['Tables']['positions']['Row'];
export type Trade = Database['public']['Tables']['trades']['Row'];
export type EquitySnapshot = Database['public']['Tables']['equity_snapshots']['Row'];
export type RuleEvent = Database['public']['Tables']['rule_events']['Row'];
export type Payout = Database['public']['Tables']['payouts']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];

export interface TradeAccountWithPlan extends TradingAccount {
  plan: Plan;
}

export interface ExecuteOrderRequest {
  accountId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT';
  size: number;
  leverage: number;
  stopLoss?: number;
  takeProfit?: number;
}

export interface ClosePositionRequest {
  positionId: string;
  reason?: 'MANUAL' | 'SL' | 'TP' | 'LIQUIDATION' | 'BREACH' | 'ADMIN';
}

export interface ModifyPositionRequest {
  positionId: string;
  stopLoss?: number | null;
  takeProfit?: number | null;
}

export interface AccountStats {
  winRate: number;
  profitFactor: number;
  avgRiskReward: number;
  bestTrade: number;
  worstTrade: number;
  totalTrades: number;
  profitableTrades: number;
  losingTrades: number;
  totalRealizedPnl: number;
  averageTrade: number;
}

export interface RiskStatus {
  dailyLossLimit: number;
  currentDailyLoss: number;
  dailyLossPct: number;
  dailyLossBreached: boolean;

  maxTotalDrawdown: number;
  currentDrawdown: number;
  drawdownPct: number;
  drawdownBreached: boolean;

  profitTarget: number;
  currentProfit: number;
  profitPct: number;
  profitTargetReached: boolean;

  minTradingDays: number;
  currentTradingDays: number;
  tradingDaysCompleted: boolean;

  canPassPhase: boolean;
}

