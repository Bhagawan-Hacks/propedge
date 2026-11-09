import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const payoutSchema = z.object({
  accountId: z.string().uuid(),
  amount: z.number().positive(),
  paymentMethod: z.string().default('Crypto USDT (TRC20)'),
  destinationAddress: z.string().min(5),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    const validation = payoutSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { accountId, amount, paymentMethod, destinationAddress } = validation.data;
    const admin = createAdminClient();

    // 1. Fetch account
    const { data: account, error: accError } = await admin
      .from('trading_accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (accError || !account) {
      return NextResponse.json({ error: 'Trading account not found' }, { status: 404 });
    }

    if (user && account.user_id !== user.id && user.email !== 'admin@propedge.demo') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Must be funded
    if (account.status !== 'funded') {
      return NextResponse.json({ error: 'Payouts are only available for Funded accounts.' }, { status: 400 });
    }

    const initial = Number(account.initial_balance);
    const balance = Number(account.current_balance);
    const profit = Math.max(0, balance - initial);

    if (amount > profit || profit <= 0) {
      return NextResponse.json({
        error: `Requested amount ($${amount.toFixed(2)}) exceeds available withdrawable profit ($${profit.toFixed(2)}).`,
      }, { status: 400 });
    }

    // 80% profit split calculation
    const profitSplitPct = 80.0;
    const payoutAmount = Math.round(amount * (profitSplitPct / 100) * 100) / 100;

    // Insert payout request
    const { data: payout, error: payError } = await admin
      .from('payouts')
      .insert({
        account_id: account.id,
        requested_amount: amount,
        profit_split_pct: profitSplitPct,
        payout_amount: payoutAmount,
        status: 'PENDING',
        admin_notes: `Destination: ${paymentMethod} (${destinationAddress})`,
      })
      .select()
      .single();

    if (payError) throw payError;

    // Deduct profit from account balance
    const newBalance = balance - amount;
    await admin
      .from('trading_accounts')
      .update({
        current_balance: newBalance,
        current_equity: newBalance,
        free_margin: newBalance - Number(account.margin_used),
      })
      .eq('id', account.id);

    return NextResponse.json({
      success: true,
      payout,
      payoutAmount,
      newBalance,
    });
  } catch (err: any) {
    console.error('Payout request error:', err);
    return NextResponse.json({ error: err.message || 'Payout request failed' }, { status: 500 });
  }
}

