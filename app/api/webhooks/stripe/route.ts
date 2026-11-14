import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  return NextResponse.json({ message: 'Stripe gateway decoupled. Platform uses direct billing & coupon redemption.' });
}
