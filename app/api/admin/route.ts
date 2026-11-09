import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    const { action, accountId, payoutId, note } = body;
    const admin = createAdminClient();

    // 1. Force Pass Account
    if (action === 'force_pass') {
      const { data: account } = await admin
        .from('trading_accounts')
        .select('*')
        .eq('id', accountId)
        .single();

      if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

      const typedAccount = account as any;
      const nextStatus = typedAccount.status === 'phase1' ? 'phase2' : 'funded';

      await admin
        .from('trading_accounts')
        .update({
          status: nextStatus,
          current_balance: Number(typedAccount.initial_balance),
          current_equity: Number(typedAccount.initial_balance),
          day_start_equity: Number(typedAccount.initial_balance),
          free_margin: Number(typedAccount.initial_balance),
          margin_used: 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', accountId);

      // Audit event
      await admin.from('rule_events').insert({
        account_id: accountId,
        event_type: 'ADMIN_FORCE_PASS',
        rule_name: `Admin Force Passed to ${nextStatus.toUpperCase()}`,
        threshold_value: 0,
        breached_value: 0,
        metadata: { adminNote: note || 'Manual override by administrator' },
      });

      return NextResponse.json({ success: true, nextStatus });
    }

    // 2. Force Breach / Fail Account
    if (action === 'force_breach') {
      // Auto-close any positions
      await admin.from('positions').delete().eq('account_id', accountId);

      await admin
        .from('trading_accounts')
        .update({
          status: 'breached',
          updated_at: new Date().toISOString(),
        })
        .eq('id', accountId);

      // Audit event
      await admin.from('rule_events').insert({
        account_id: accountId,
        event_type: 'ADMIN_FORCE_BREACH',
        rule_name: 'Admin Force Breached Account',
        metadata: { adminNote: note || 'Manual breach triggered by admin' },
      });

      return NextResponse.json({ success: true, status: 'breached' });
    }

    // 3. Reset Account Balance
    if (action === 'reset_balance') {
      const { data: account } = await admin
        .from('trading_accounts')
        .select('*')
        .eq('id', accountId)
        .single();

      if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

      const typedAccount = account as any;
      await admin
        .from('trading_accounts')
        .update({
          status: 'phase1',
          current_balance: Number(typedAccount.initial_balance),
          current_equity: Number(typedAccount.initial_balance),
          day_start_equity: Number(typedAccount.initial_balance),
          free_margin: Number(typedAccount.initial_balance),
          margin_used: 0,
          trading_days_count: 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', accountId);

      return NextResponse.json({ success: true });
    }

    // 4. Approve Payout
    if (action === 'approve_payout') {
      const { data: payout } = await admin
        .from('payouts')
        .update({
          status: 'APPROVED',
          processed_at: new Date().toISOString(),
          admin_notes: note ? `Approved: ${note}` : 'Approved by admin',
        })
        .eq('id', payoutId)
        .select()
        .single();

      return NextResponse.json({ success: true, payout });
    }

    // 5. Reject Payout
    if (action === 'reject_payout') {
      const { data: payout } = await admin
        .from('payouts')
        .update({
          status: 'REJECTED',
          processed_at: new Date().toISOString(),
          admin_notes: note ? `Rejected: ${note}` : 'Rejected by admin',
        })
        .eq('id', payoutId)
        .select()
        .single();

      return NextResponse.json({ success: true, payout });
    }

    return NextResponse.json({ error: 'Invalid admin action' }, { status: 400 });
  } catch (err: any) {
    console.error('Admin API error:', err);
    return NextResponse.json({ error: err.message || 'Admin operation failed' }, { status: 500 });
  }
}
