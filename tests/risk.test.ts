import { describe, it, expect } from 'vitest';
import { evaluateAccountRisk } from '@/lib/engine/risk';

describe('Risk & Evaluation Engine', () => {
  it('detects healthy active account within parameters', () => {
    const account = {
      initial_balance: 10000,
      current_balance: 10200,
      current_equity: 10200,
      day_start_equity: 10000,
      trading_days_count: 3,
      status: 'phase1',
    };

    const risk = evaluateAccountRisk(account);
    expect(risk.dailyLossBreached).toBe(false);
    expect(risk.drawdownBreached).toBe(false);
    expect(risk.profitTargetReached).toBe(false);
    expect(risk.canPassPhase).toBe(false);
  });

  it('detects daily loss breach when daily drawdown exceeds 5%', () => {
    const account = {
      initial_balance: 10000,
      current_balance: 9400,
      current_equity: 9400,
      day_start_equity: 10000, // Day start was 10,000, now 9,400 -> -6% loss (> 5%)
      trading_days_count: 2,
      status: 'phase1',
    };

    const risk = evaluateAccountRisk(account);
    expect(risk.dailyLossBreached).toBe(true);
    expect(risk.dailyLossPct).toBe(6.0);
  });

  it('detects max total drawdown breach when total loss exceeds 10%', () => {
    const account = {
      initial_balance: 100000,
      current_balance: 89500,
      current_equity: 89500, // $89,500 < $90,000 (10% max DD)
      day_start_equity: 91000,
      trading_days_count: 4,
      status: 'phase2',
    };

    const risk = evaluateAccountRisk(account);
    expect(risk.drawdownBreached).toBe(true);
    expect(risk.drawdownPct).toBe(10.5);
  });

  it('qualifies account for phase completion when target and min trading days are met', () => {
    const account = {
      initial_balance: 10000,
      current_balance: 10850,
      current_equity: 10850, // +8.5% profit (> 8% Phase 1 target)
      day_start_equity: 10500,
      trading_days_count: 5, // Meets 5 days minimum
      status: 'phase1',
    };

    const risk = evaluateAccountRisk(account);
    expect(risk.profitTargetReached).toBe(true);
    expect(risk.tradingDaysCompleted).toBe(true);
    expect(risk.canPassPhase).toBe(true);
  });

  it('prevents phase completion if profit target is met but trading days < 5', () => {
    const account = {
      initial_balance: 10000,
      current_balance: 10900,
      current_equity: 10900,
      day_start_equity: 10500,
      trading_days_count: 3, // Only 3 days
      status: 'phase1',
    };

    const risk = evaluateAccountRisk(account);
    expect(risk.profitTargetReached).toBe(true);
    expect(risk.tradingDaysCompleted).toBe(false);
    expect(risk.canPassPhase).toBe(false);
  });
});
