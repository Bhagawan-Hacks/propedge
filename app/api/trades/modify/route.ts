import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const modifySchema = z.object({
  positionId: z.string().uuid(),
  stopLoss: z.number().positive().nullable().optional(),
  takeProfit: z.number().positive().nullable().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    const validation = modifySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { positionId, stopLoss, takeProfit } = validation.data;
    const admin = createAdminClient();

    const { data: position } = await admin
      .from('positions')
      .select('*, trading_accounts(*)')
      .eq('id', positionId)
      .single();

    if (!position) {
      return NextResponse.json({ error: 'Position not found' }, { status: 404 });
    }

    const pos = position as any;
    if (user && pos.trading_accounts?.user_id !== user.id && user.email !== 'admin@propedge.demo') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { data: updated, error } = await admin
      .from('positions')
      .update({
        stop_loss: stopLoss !== undefined ? stopLoss : pos.stop_loss,
        take_profit: takeProfit !== undefined ? takeProfit : pos.take_profit,
        updated_at: new Date().toISOString(),
      })
      .eq('id', positionId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, position: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Modify failed' }, { status: 500 });
  }
}
