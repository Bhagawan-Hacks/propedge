import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateCoupon } from '@/lib/coupons';

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await req.json();
    const { planId, billingDetails, couponCode } = body;

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

    // Validate Coupon if provided
    let discountPct = 0;
    let appliedCouponCode: string | null = null;

    if (couponCode) {
      const verified = validateCoupon(couponCode);
      if (verified) {
        discountPct = verified.discountPct;
        appliedCouponCode = verified.code;
      }
    }

    const originalPrice = Number(plan.price_usd);
    const finalPrice = Math.max(0, originalPrice * (1 - discountPct / 100));

    // Generate unique account number
    const randomAccNum = `PE-${Math.floor(100000 + Math.random() * 900000)}`;

    // 1. Ensure / update profile details with billing info
    const traderName = billingDetails?.fullName || user?.user_metadata?.full_name || 'PropEdge Trader';
    const traderEmail = billingDetails?.email || user?.email || 'trader@propedge.test';

    await admin.from('profiles').upsert({
      id: userId,
      email: traderEmail,
      full_name: traderName,
      role: 'user',
    });

    // 2. Provision new trading account in Phase 1
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
      console.error('Account provisioning error:', accError);
      return NextResponse.json({ error: accError.message }, { status: 500 });
    }

    // 3. Record order payment in payments table
    await admin.from('payments').insert({
      user_id: userId,
      plan_id: plan.id,
      amount: finalPrice,
      currency: 'usd',
      status: 'SUCCEEDED',
      stripe_session_id: `order_${appliedCouponCode ? appliedCouponCode + '_' : ''}${Date.now()}`,
    });

    return NextResponse.json({
      success: true,
      accountNumber: randomAccNum,
      finalAmount: finalPrice,
      discountApplied: discountPct,
      url: `${appUrl}/checkout/success?account_number=${randomAccNum}`,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message || 'Checkout failed' }, { status: 500 });
  }
}
