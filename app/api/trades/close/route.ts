import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchBinanceBookTicker } from '@/lib/binance/rest';
import { calculateExecutionPrice } from '@/lib/engine/slippage';
import { calculatePnL } from '@/lib/engine/pnl';

const closePositionSchema = z.object({
  positionId: z.string().uuid(),
  reason: z.enum(['MANUAL', 'SL', 'TP', 'LIQUIDATION', 'BREACH', 'ADMIN']).default('MANUAL'),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    const validation = closePositionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { positionId, reason } = validation.data;
    const admin = createAdminClient();

    // 1. Fetch position details
    const { data: position, error: posError } = await admin
      .from('positions')
      .select('*, trading_accounts(*)')
      .eq('id', positionId)
      .single();

    if (posError || !position) {
      return NextResponse.json({ error: 'Position not found or already closed' }, { status: 404 });
    }

    const pos = position as any;
    const account = pos.trading_accounts;
    if (user && account.user_id !== user.id && user.email !== 'admin@propedge.demo') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 2. Fetch authoritative live market price from Binance REST
    const ticker = await fetchBinanceBookTicker(pos.symbol);
    // Closing a BUY position means selling; closing a SELL position means buying
    const closeSide = pos.side === 'BUY' ? 'SELL' : 'BUY';
    const execution = calculateExecutionPrice(closeSide, ticker.midPrice);
    const exitPrice = execution.executedPrice;

    // 3. Close position via RPC
    const { data: rpcResult, error: rpcError } = await admin.rpc('close_position_atomic', {
      p_position_id: positionId,
      p_exit_price: exitPrice,
      p_close_reason: reason,
    });

    if (rpcError) {
      // Fallback direct execution
      const pnlCalc = calculatePnL(position.side, Number(position.size), Number(position.entry_price), exitPrice, true);
      const newBalance = Number(account.current_balance) + pnlCalc.netPnl;
      const newMarginUsed = Math.max(0, Number(account.margin_used) - Number(position.margin));

      // Record trade
      const { data: trade } = await admin.from('trades').insert({
        account_id: account.id,
        position_id: position.id,
        symbol: position.symbol,
        side: position.side,
        size: position.size,
        entry_price: position.entry_price,
        exit_price: exitPrice,
        realized_pnl: pnlCalc.netPnl,
        fee: pnlCalc.fee,
        close_reason: reason,
        opened_at: position.opened_at,
        closed_at: new Date().toISOString(),
      }).select().single();

      // Delete position
      await admin.from('positions').delete().eq('id', positionId);

      // Update account balance
      await admin.from('trading_accounts').update({
        current_balance: newBalance,
        current_equity: newBalance,
        margin_used: newMarginUsed,
        free_margin: newBalance - newMarginUsed,
        high_water_mark: Math.max(Number(account.high_water_mark), newBalance),
      }).eq('id', account.id);

      // Record equity snapshot
      await admin.from('equity_snapshots').insert({
        account_id: account.id,
        equity: newBalance,
        balance: newBalance,
        daily_pnl: newBalance - Number(account.day_start_equity),
        drawdown_pct: Math.round(((Number(account.initial_balance) - newBalance) / Number(account.initial_balance)) * 10000) / 100,
      });

      return NextResponse.json({
        success: true,
        tradeId: trade?.id,
        realizedPnl: pnlCalc.netPnl,
        newBalance,
      });
    }

    return NextResponse.json(rpcResult);
  } catch (err: any) {
    console.error('Close position error:', err);
    return NextResponse.json({ error: err.message || 'Position closing failed' }, { status: 500 });
  }
}
