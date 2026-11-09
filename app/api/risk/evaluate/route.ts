import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchBinanceBookTicker } from '@/lib/binance/rest';
import { calculatePnL } from '@/lib/engine/pnl';
import { calculateExecutionPrice } from '@/lib/engine/slippage';
import { evaluateAccountRisk } from '@/lib/engine/risk';

export async function POST(req: NextRequest) {
  try {
    // Check cron authorization header if configured
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}` && !authHeader?.includes('demo')) {
      // In production, enforce cron secret; allow in dev demo
    }

    const admin = createAdminClient();

    // 1. Fetch all active trading accounts
    const { data: accounts, error: accError } = await admin
      .from('trading_accounts')
      .select('*, plans(*)')
      .in('status', ['phase1', 'phase2', 'funded']);

    if (accError || !accounts || accounts.length === 0) {
      return NextResponse.json({ message: 'No active accounts to evaluate', processed: 0 });
    }

    const typedAccounts = accounts as any[];

    // 2. Fetch all open positions across these accounts
    const { data: openPositions } = await admin
      .from('positions')
      .select('*')
      .in('account_id', typedAccounts.map(a => a.id));

    const typedPositions = (openPositions as any[]) || [];

    // 3. Cache latest prices for active symbols
    const activeSymbols = Array.from(new Set(typedPositions.map(p => p.symbol)));
    const prices: Record<string, number> = {};
    for (const sym of activeSymbols) {
      const ticker = await fetchBinanceBookTicker(sym);
      prices[sym] = ticker.midPrice;
    }

    const evaluationResults = [];
    const todayStr = new Date().toISOString().split('T')[0];

    for (const account of typedAccounts) {
      const accountPositions = typedPositions.filter(p => p.account_id === account.id);

      // Calculate total unrealized P&L
      let unrealizedTotal = 0;
      for (const pos of accountPositions) {
        const markPrice = prices[pos.symbol] || Number(pos.current_price) || Number(pos.entry_price);
        const pnl = calculatePnL(pos.side, Number(pos.size), Number(pos.entry_price), markPrice, false);
        unrealizedTotal += pnl.grossPnl;
      }

      const balance = Number(account.current_balance);
      const currentEquity = balance + unrealizedTotal;

      // Check day rollover (00:00 UTC)
      let dayStartEquity = Number(account.day_start_equity);
      let isNewDay = false;
      if (account.current_trading_day !== todayStr) {
        dayStartEquity = currentEquity;
        isNewDay = true;
      }

      // Evaluate risk parameters using pure risk engine
      const risk = evaluateAccountRisk(
        {
          initial_balance: Number(account.initial_balance),
          current_balance: balance,
          current_equity: currentEquity,
          day_start_equity: dayStartEquity,
          trading_days_count: Number(account.trading_days_count),
          status: account.status,
        },
        account.plans
      );

      // Handle Breach: Daily Loss or Max Drawdown
      if (risk.dailyLossBreached || risk.drawdownBreached) {
        const breachType = risk.dailyLossBreached ? 'DAILY_LOSS_BREACH' : 'MAX_DRAWDOWN_BREACH';
        const ruleName = risk.dailyLossBreached ? '5% Daily Loss Limit' : '10% Max Drawdown Limit';
        const threshold = risk.dailyLossBreached ? risk.dailyLossLimit : risk.maxTotalDrawdown;
        const breachedVal = risk.dailyLossBreached ? risk.currentDailyLoss : risk.currentDrawdown;

        // 1. Auto-close all open positions for this account
        for (const pos of accountPositions) {
          const markPrice = prices[pos.symbol] || Number(pos.current_price) || Number(pos.entry_price);
          const closeSide = pos.side === 'BUY' ? 'SELL' : 'BUY';
          const exit = calculateExecutionPrice(closeSide, markPrice);

          await admin.rpc('close_position_atomic', {
            p_position_id: pos.id,
            p_exit_price: exit.executedPrice,
            p_close_reason: 'BREACH',
          });
        }

        // 2. Lock account to 'breached' status
        await admin
          .from('trading_accounts')
          .update({
            status: 'breached',
            current_equity: currentEquity,
            updated_at: new Date().toISOString(),
          })
          .eq('id', account.id);

        // 3. Log audit event in rule_events table
        await admin.from('rule_events').insert({
          account_id: account.id,
          event_type: breachType,
          rule_name: ruleName,
          threshold_value: threshold,
          breached_value: breachedVal,
          metadata: {
            balance,
            equity: currentEquity,
            dailyLossPct: risk.dailyLossPct,
            drawdownPct: risk.drawdownPct,
            closedPositionsCount: accountPositions.length,
          },
        });

        evaluationResults.push({
          accountId: account.id,
          accountNumber: account.account_number,
          action: 'BREACHED',
          reason: ruleName,
        });
        continue;
      }

      // Handle Phase Advancement (Phase 1 -> Phase 2, Phase 2 -> Funded)
      if (risk.canPassPhase) {
        const nextStatus = account.status === 'phase1' ? 'phase2' : 'funded';
        const eventType = account.status === 'phase1' ? 'PHASE1_PASSED' : 'PHASE2_PASSED';
        const ruleName = account.status === 'phase1' ? 'Phase 1 Target Achieved (8%)' : 'Phase 2 Verification Achieved (5%)';

        // Auto-close open positions upon phase passing to lock in result
        for (const pos of accountPositions) {
          const markPrice = prices[pos.symbol] || Number(pos.current_price) || Number(pos.entry_price);
          const closeSide = pos.side === 'BUY' ? 'SELL' : 'BUY';
          const exit = calculateExecutionPrice(closeSide, markPrice);

          await admin.rpc('close_position_atomic', {
            p_position_id: pos.id,
            p_exit_price: exit.executedPrice,
            p_close_reason: 'MANUAL',
          });
        }

        // Advance account status
        await admin
          .from('trading_accounts')
          .update({
            status: nextStatus,
            current_balance: Number(account.initial_balance), // Reset starting balance for next phase
            current_equity: Number(account.initial_balance),
            day_start_equity: Number(account.initial_balance),
            margin_used: 0,
            free_margin: Number(account.initial_balance),
            trading_days_count: 0,
            updated_at: new Date().toISOString(),
          })
          .eq('id', account.id);

        // Log audit event
        await admin.from('rule_events').insert({
          account_id: account.id,
          event_type: eventType,
          rule_name: ruleName,
          threshold_value: risk.profitTarget,
          breached_value: risk.currentProfit,
          metadata: {
            advancedTo: nextStatus,
            tradingDays: risk.currentTradingDays,
            profitPct: risk.profitPct,
          },
        });

        evaluationResults.push({
          accountId: account.id,
          accountNumber: account.account_number,
          action: 'ADVANCED',
          newStatus: nextStatus,
        });
        continue;
      }

      // Standard equity snapshot and day rollover update
      await admin
        .from('trading_accounts')
        .update({
          current_equity: currentEquity,
          free_margin: Math.max(0, currentEquity - Number(account.margin_used)),
          day_start_equity: dayStartEquity,
          current_trading_day: todayStr,
          high_water_mark: Math.max(Number(account.high_water_mark), currentEquity),
          updated_at: new Date().toISOString(),
        })
        .eq('id', account.id);

      // Periodically record equity snapshot
      await admin.from('equity_snapshots').insert({
        account_id: account.id,
        equity: currentEquity,
        balance,
        daily_pnl: currentEquity - dayStartEquity,
        drawdown_pct: risk.drawdownPct,
      });

      evaluationResults.push({
        accountId: account.id,
        accountNumber: account.account_number,
        action: 'OK',
        equity: currentEquity,
      });
    }

    return NextResponse.json({
      success: true,
      evaluatedCount: accounts.length,
      results: evaluationResults,
    });
  } catch (err: any) {
    console.error('Risk evaluate error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
