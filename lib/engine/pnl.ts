/**
 * Profit & Loss Calculations for PropEdge
 */

export const SIMULATED_COMMISSION_RATE = 0.0001; // 0.01% fee

export interface PnLCalculation {
  grossPnl: number;
  fee: number;
  netPnl: number;
  returnPct: number;
}

/**
 * Calculates unrealized or realized P&L:
 * - BUY (Long): size * (exit_price - entry_price)
 * - SELL (Short): size * (entry_price - exit_price)
 */
export function calculatePnL(
  side: 'BUY' | 'SELL',
  size: number,
  entryPrice: number,
  currentPrice: number,
  applyFee: boolean = true
): PnLCalculation {
  let rawDifference = 0;
  if (side === 'BUY') {
    rawDifference = currentPrice - entryPrice;
  } else {
    rawDifference = entryPrice - currentPrice;
  }

  const grossPnl = Math.round(size * rawDifference * 100) / 100;
  const notional = size * currentPrice;
  const fee = applyFee ? Math.round(notional * SIMULATED_COMMISSION_RATE * 100) / 100 : 0;
  const netPnl = Math.round((grossPnl - fee) * 100) / 100;

  const costBasis = size * entryPrice;
  const returnPct = costBasis > 0 ? Math.round(((grossPnl / costBasis) * 100) * 100) / 100 : 0;

  return {
    grossPnl,
    fee,
    netPnl,
    returnPct,
  };
}
