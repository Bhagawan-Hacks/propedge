import { describe, it, expect } from 'vitest';
import { calculateRequiredMargin, hasSufficientMargin } from '@/lib/engine/margin';
import { calculatePnL } from '@/lib/engine/pnl';
import { calculateExecutionPrice } from '@/lib/engine/slippage';

describe('Margin Calculation Engine', () => {
  it('correctly calculates required margin for 1:20 leverage', () => {
    // 1 BTC at $90,000 with 1:20 leverage = $90,000 / 20 = $4,500
    const res = calculateRequiredMargin(1, 90000, 20);
    expect(res.positionValue).toBe(90000);
    expect(res.requiredMargin).toBe(4500);
    expect(res.isAllowed).toBe(true);
    expect(res.leverage).toBe(20);
  });

  it('clamps leverage to maximum firm limit of 1:20', () => {
    // If client attempts 1:50 leverage, it must clamp to 1:20
    const res = calculateRequiredMargin(1, 10000, 50);
    expect(res.leverage).toBe(20);
    expect(res.requiredMargin).toBe(500);
  });

  it('validates free margin correctly', () => {
    expect(hasSufficientMargin(5000, 4500)).toBe(true);
    expect(hasSufficientMargin(4000, 4500)).toBe(false);
    expect(hasSufficientMargin(0, 500)).toBe(false);
  });
});

describe('P&L Calculation Engine', () => {
  it('calculates long (BUY) profitable trade correctly', () => {
    // BUY 0.5 BTC at $90,000, close at $94,000 -> gross +$2,000
    const res = calculatePnL('BUY', 0.5, 90000, 94000, false);
    expect(res.grossPnl).toBe(2000);
    expect(res.netPnl).toBe(2000);
  });

  it('calculates long (BUY) loss trade correctly', () => {
    // BUY 1 BTC at $90,000, close at $88,000 -> gross -$2,000
    const res = calculatePnL('BUY', 1, 90000, 88000, false);
    expect(res.grossPnl).toBe(-2000);
  });

  it('calculates short (SELL) profitable trade correctly', () => {
    // SELL 1 BTC at $90,000, close at $85,000 -> gross +$5,000
    const res = calculatePnL('SELL', 1, 90000, 85000, false);
    expect(res.grossPnl).toBe(5000);
  });

  it('calculates short (SELL) loss trade correctly', () => {
    // SELL 1 BTC at $90,000, close at $92,000 -> gross -$2,000
    const res = calculatePnL('SELL', 1, 90000, 92000, false);
    expect(res.grossPnl).toBe(-2000);
  });

  it('deducts commission fee correctly', () => {
    // 1 BTC closed at $100,000, 0.01% fee = $10.00
    const res = calculatePnL('BUY', 1, 90000, 100000, true);
    expect(res.grossPnl).toBe(10000);
    expect(res.fee).toBe(10);
    expect(res.netPnl).toBe(9990);
  });
});

describe('Slippage & Spread Simulation Engine', () => {
  it('applies spread and adverse slippage to BUY orders', () => {
    const mid = 100000;
    const res = calculateExecutionPrice('BUY', mid);
    // Buy price must be strictly greater than mid price
    expect(res.executedPrice).toBeGreaterThan(mid);
  });

  it('applies spread and adverse slippage to SELL orders', () => {
    const mid = 100000;
    const res = calculateExecutionPrice('SELL', mid);
    // Sell price must be strictly lower than mid price
    expect(res.executedPrice).toBeLessThan(mid);
  });
});
