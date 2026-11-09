import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchBinanceBookTicker } from '@/lib/binance/rest';
import { calculatePnL } from '@/lib/engine/pnl';
import { calculateExecutionPrice } from '@/lib/engine/slippage';

export async function POST(req: NextRequest) {
  try {
    const admin = createAdminClient();

    // 1. Fetch all currently open positions
    const { data: openPositions, error } = await admin
      .from('positions')
      .select('*, trading_accounts(*)');

    if (error || !openPositions || openPositions.length === 0) {
      return NextResponse.json({ message: 'No open positions to evaluate', closedCount: 0 });
    }

    const closedActions = [];
    const symbols = Array.from(new Set(openPositions.map((p) => p.symbol)));
    const prices: Record<string, { bid: number; ask: number; mid: number }> = {};

    // Fetch prices for unique active symbols
    for (const sym of symbols) {
      const ticker = await fetchBinanceBookTicker(sym);
      prices[sym] = {
        bid: ticker.bidPrice,
        ask: ticker.askPrice,
        mid: ticker.midPrice,
      };
    }

    // Evaluate each position against SL/TP triggers
    for (const pos of (openPositions as any[])) {
      const market = prices[pos.symbol];
      if (!market) continue;

      const currentMid = market.mid;
      const pnl = calculatePnL(pos.side, Number(pos.size), Number(pos.entry_price), currentMid, false);

      // Check SL / TP conditions
      let triggerReason: 'SL' | 'TP' | null = null;

      if (pos.side === 'BUY') {
        if (pos.stop_loss && currentMid <= Number(pos.stop_loss)) {
          triggerReason = 'SL';
        } else if (pos.take_profit && currentMid >= Number(pos.take_profit)) {
          triggerReason = 'TP';
        }
      } else {
        // SELL
        if (pos.stop_loss && currentMid >= Number(pos.stop_loss)) {
          triggerReason = 'SL';
        } else if (pos.take_profit && currentMid <= Number(pos.take_profit)) {
          triggerReason = 'TP';
        }
      }

      if (triggerReason) {
        // Auto-close position
        const closeSide = pos.side === 'BUY' ? 'SELL' : 'BUY';
        const exit = calculateExecutionPrice(closeSide, currentMid);

        await admin.rpc('close_position_atomic', {
          p_position_id: pos.id,
          p_exit_price: exit.executedPrice,
          p_close_reason: triggerReason,
        });

        closedActions.push({
          positionId: pos.id,
          symbol: pos.symbol,
          reason: triggerReason,
          exitPrice: exit.executedPrice,
        });
      } else {
        // Update unrealized P&L in DB for accurate Realtime displays
        await admin
          .from('positions')
          .update({
            current_price: currentMid,
            unrealized_pnl: pnl.grossPnl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', pos.id);
      }
    }

    return NextResponse.json({
      success: true,
      evaluatedPositions: openPositions.length,
      closedActions,
    });
  } catch (err: any) {
    console.error('Tick eval error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
