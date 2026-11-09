/**
 * Synthetic Spread & Basic Slippage Engine
 */

export const DEFAULT_SPREAD_PCT = 0.0002; // 0.02%
export const MIN_SLIPPAGE_PCT = 0.0001; // 0.01%
export const MAX_SLIPPAGE_PCT = 0.0003; // 0.03%

export interface ExecutionPriceResult {
  basePrice: number;
  spreadPrice: number;
  executedPrice: number;
  slippagePct: number;
  slippageAmount: number;
}

/**
 * Calculates executed price with realistic broker spread and slippage:
 * - BUY: market buy fills at Ask + slippage
 * - SELL: market sell fills at Bid - slippage
 */
export function calculateExecutionPrice(
  side: 'BUY' | 'SELL',
  midPrice: number,
  spreadPct: number = DEFAULT_SPREAD_PCT
): ExecutionPriceResult {
  const halfSpread = midPrice * (spreadPct / 2);
  const spreadPrice = side === 'BUY' ? midPrice + halfSpread : midPrice - halfSpread;

  // Randomized slippage between MIN and MAX
  const slippagePct = MIN_SLIPPAGE_PCT + Math.random() * (MAX_SLIPPAGE_PCT - MIN_SLIPPAGE_PCT);
  const slippageAmount = spreadPrice * slippagePct;

  // Adverse slippage simulation: buys fill slightly higher, sells fill slightly lower
  const executedPrice = side === 'BUY' 
    ? Math.round((spreadPrice + slippageAmount) * 100) / 100
    : Math.round((spreadPrice - slippageAmount) * 100) / 100;

  return {
    basePrice: midPrice,
    spreadPrice,
    executedPrice,
    slippagePct,
    slippageAmount,
  };
}
