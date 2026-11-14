import { NextRequest, NextResponse } from 'next/server';
import { validateCoupon } from '@/lib/coupons';

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ valid: false, error: 'Please enter a coupon code.' }, { status: 400 });
    }

    const coupon = validateCoupon(code);

    if (!coupon) {
      return NextResponse.json({ valid: false, error: 'Invalid or expired coupon code.' }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountPct: coupon.discountPct,
        description: coupon.description,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ valid: false, error: 'Failed to validate coupon' }, { status: 500 });
  }
}
