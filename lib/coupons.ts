export interface Coupon {
  code: string;
  discountPct: number;
  description: string;
  isActive: boolean;
}

export const VALID_COUPONS: Record<string, Coupon> = {
  PUJANTHEGOAT: {
    code: 'PUJANTHEGOAT',
    discountPct: 100,
    description: '100% VIP Special Grant',
    isActive: true,
  },
  BETA100: {
    code: 'BETA100',
    discountPct: 100,
    description: '100% Worldwide Beta Tester Pass',
    isActive: true,
  },
  PROP100: {
    code: 'PROP100',
    discountPct: 100,
    description: '100% Full Challenge Grant',
    isActive: true,
  },
  LAUNCH100: {
    code: 'LAUNCH100',
    discountPct: 100,
    description: '100% Launch Access Code',
    isActive: true,
  },
  FREEBETA: {
    code: 'FREEBETA',
    discountPct: 100,
    description: '100% Free Beta Activation',
    isActive: true,
  },
  PROP50: {
    code: 'PROP50',
    discountPct: 50,
    description: '50% Early Trader Discount',
    isActive: true,
  },
  EDGE20: {
    code: 'EDGE20',
    discountPct: 20,
    description: '20% Trader Discount',
    isActive: true,
  },
  WELCOME10: {
    code: 'WELCOME10',
    discountPct: 10,
    description: '10% Welcome Discount',
    isActive: true,
  },
};

export function validateCoupon(code: string): Coupon | null {
  if (!code) return null;
  const normalized = code.trim().toUpperCase();
  const coupon = VALID_COUPONS[normalized];
  if (coupon && coupon.isActive) {
    return coupon;
  }
  return null;
}

