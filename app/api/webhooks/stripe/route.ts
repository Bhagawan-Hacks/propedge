import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/stripe';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (webhookSecret && signature && !webhookSecret.includes('mock')) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // In development / testing without valid webhook secret
      event = JSON.parse(body);
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const metadata = session.metadata || {};
    const userId = metadata.userId;
    const planId = metadata.planId;

    if (userId && planId) {
      const admin = createAdminClient();

      // Retrieve plan details
      const { data: plan } = await admin
        .from('plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (plan) {
        const accountNumber = `PE-${Math.floor(100000 + Math.random() * 900000)}`;
        const balance = Number(plan.starting_balance);

        // 1. Record completed payment
        await admin.from('payments').insert({
          user_id: userId,
          plan_id: planId,
          stripe_session_id: session.id,
          stripe_payment_intent: session.payment_intent as string,
          amount: (session.amount_total || 0) / 100,
          currency: session.currency || 'usd',
          status: 'SUCCEEDED',
        });

        // 2. Provision new trading account in phase1
        await admin.from('trading_accounts').insert({
          user_id: userId,
          plan_id: plan.id,
          account_number: accountNumber,
          status: 'phase1',
          initial_balance: balance,
          current_balance: balance,
          current_equity: balance,
          margin_used: 0,
          free_margin: balance,
          high_water_mark: balance,
          day_start_equity: balance,
          trading_days_count: 0,
        });

        console.log(`Successfully provisioned account ${accountNumber} for user ${userId}`);
      }
    }
  }

  return NextResponse.json({ received: true });
}

