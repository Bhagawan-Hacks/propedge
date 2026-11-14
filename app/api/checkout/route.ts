import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/stripe';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await req.json();
    const { planId, directDemoPurchase } = body;

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    // Determine target user id
    const userId = user?.id || '00000000-0000-0000-0000-000000000001';

    // Fetch plan details from Supabase admin client
    const admin = createAdminClient();
    const { data: plan, error: planError } = await admin
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const isMockStripe = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('mock');

    // If direct demo purchase or Stripe key is mock, provision account immediately for seamless beta testing access
    if (directDemoPurchase || isMockStripe) {
      const randomAccNum = `PE-${Math.floor(100000 + Math.random() * 900000)}`;

      // 1. Ensure profile exists for mock / demo user
      await admin.from('profiles').upsert({
        id: userId,
        email: user?.email || 'demo.trader@propedge.test',
        full_name: 'Demo Trader',
        role: 'user',
      });

      // 2. Create trading account in phase1
      const { data: newAccount, error: accError } = await admin
        .from('trading_accounts')
        .insert({
          user_id: userId,
          plan_id: plan.id,
          account_number: randomAccNum,
          status: 'phase1',
          initial_balance: plan.starting_balance,
          current_balance: plan.starting_balance,
          current_equity: plan.starting_balance,
          margin_used: 0,
          free_margin: plan.starting_balance,
          high_water_mark: plan.starting_balance,
          day_start_equity: plan.starting_balance,
          trading_days_count: 0,
        })
        .select()
        .single();

      if (accError) {
        return NextResponse.json({ error: accError.message }, { status: 500 });
      }

      // Record simulated payment
      await admin.from('payments').insert({
        user_id: userId,
        plan_id: plan.id,
        amount: plan.price_usd,
        currency: 'usd',
        status: 'SUCCEEDED',
        stripe_session_id: `demo_sess_${Date.now()}`,
      });

      return NextResponse.json({
        url: `${appUrl}/checkout/success?account_number=${randomAccNum}&demo=true`,
        directSuccess: true,
        accountNumber: randomAccNum,
      });
    }

    // Real Stripe Test Mode Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `PropEdge Challenge: ${plan.name}`,
              description: `Simulated $${Number(plan.starting_balance).toLocaleString()} 2-Phase Evaluation Account`,
            },
            unit_amount: Math.round(Number(plan.price_usd) * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout/cancel`,
      metadata: {
        userId: userId,
        planId: plan.id,
        startingBalance: plan.starting_balance.toString(),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message || 'Checkout failed' }, { status: 500 });
  }
}

