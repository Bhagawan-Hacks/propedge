import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const journalSchema = z.object({
  tradeId: z.string().uuid(),
  notes: z.string().max(2000),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    const validation = journalSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { tradeId, notes } = validation.data;
    const admin = createAdminClient();

    const { data: trade, error } = await admin
      .from('trades')
      .update({ journal_notes: notes })
      .eq('id', tradeId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, trade });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

