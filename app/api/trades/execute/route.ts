import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchBinanceBookTicker } from '@/lib/binance/rest';
import { calculateExecutionPrice } from '@/lib/engine/slippage';
import { calculateRequiredMargin, MAX_PROP_LEVERAGE } from '@/lib/engine/margin';

const executeOrderSchema = z.object({
  accountId: z.string().uuid(),
  symbol: z.string().min(3).max(10),
  side: z.enum(['BUY', 'SELL']),
  type: z.enum(['MARKET', 'LIMIT']).default('MARKET'),
  size: z.number().positive(),
  leverage: z.number().int().min(1).max(MAX_PROP_LEVERAGE),
  stopLoss: z.number().positive().optional().nullable(),
  takeProfit: z.number().positive().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    const validation = executeOrderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { accountId, symbol, side, size, leverage, stopLoss, takeProfit } = validation.data;
    const admin = createAdminClient();

    // 1. Fetch and verify account ownership and status
    const { data: account, error: accError } = await admin
      .from('trading_accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (accError || !account) {
      return NextResponse.json({ error: 'Trading account not found' }, { status: 404 });
    }

    const acc = account as any;

    // Ensure user owns account (or demo user fallback)
    if (user && acc.user_id !== user.id && user.email !== 'admin@propedge.demo') {
      return NextResponse.json({ error: 'Unauthorized access to trading account' }, { status: 403 });
    }

    if (!['phase1', 'phase2', 'funded'].includes(acc.status)) {
      return NextResponse.json({
        error: `Account is not eligible to trade (current status: ${acc.status})`
      }, { status: 400 });
    }

    // 2. Fetch authoritative live market price from Binance REST
    const ticker = await fetchBinanceBookTicker(symbol);
    const executionDetails = calculateExecutionPrice(side, ticker.midPrice);
    const executedPrice = executionDetails.executedPrice;

    // 3. Margin check
    const marginCalc = calculateRequiredMargin(size, executedPrice, leverage);
    if (marginCalc.requiredMargin > Number(acc.free_margin)) {
      return NextResponse.json({
        error: `Insufficient free margin. Required: $${marginCalc.requiredMargin.toFixed(2)}, Available: $${Number(acc.free_margin).toFixed(2)}`,
      }, { status: 400 });
    }

    // 4. Atomic trade execution via Supabase RPC (or direct locked insert)
    const { data: rpcResult, error: rpcError } = await admin.rpc('execute_trade_atomic', {
      p_account_id: accountId,
      p_symbol: symbol,
      p_side: side,
      p_size: size,
      p_executed_price: executedPrice,
      p_leverage: leverage,
      p_stop_loss: stopLoss || null,
      p_take_profit: takeProfit || null,
    });

    if (rpcError) {
      // Fallback direct execution if RPC function is not yet created in remote DB
      const { data: order } = await admin.from('orders').insert({
        account_id: accountId,
        symbol,
        side,
        type: 'MARKET',
        requested_price: executedPrice,
        executed_price: executedPrice,
        size,
        leverage,
        stop_loss: stopLoss || null,
        take_profit: takeProfit || null,
        status: 'FILLED',
        executed_at: new Date().toISOString(),
      }).select().single();

      const { data: position } = await admin.from('positions').insert({
        account_id: accountId,
        order_id: order?.id,
        symbol,
        side,
        size,
        entry_price: executedPrice,
        current_price: executedPrice,
        leverage,
        margin: marginCalc.requiredMargin,
        stop_loss: stopLoss || null,
        take_profit: takeProfit || null,
        unrealized_pnl: 0,
      }).select().single();

      // Update account margins
      const newMarginUsed = Number(account.margin_used) + marginCalc.requiredMargin;
      await admin.from('trading_accounts').update({
        margin_used: newMarginUsed,
        free_margin: Number(account.current_equity) - newMarginUsed,
      }).eq('id', accountId);

      return NextResponse.json({
        success: true,
        orderId: order?.id,
        positionId: position?.id,
        executedPrice,
        margin: marginCalc.requiredMargin,
      });
    }

    if (!rpcResult.success) {
      return NextResponse.json({ error: rpcResult.error }, { status: 400 });
    }

    return NextResponse.json(rpcResult);
  } catch (err: any) {
    console.error('Execute order error:', err);
    return NextResponse.json({ error: err.message || 'Trade execution failed' }, { status: 500 });
  }
}
