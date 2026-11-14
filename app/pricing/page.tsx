'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Check, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  ArrowRight, 
  AlertCircle,
  Tag,
  Globe,
  User,
  Mail,
  MapPin,
  CheckCircle2,
  X,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';

const PLANS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Starter $10K',
    balance: 10000,
    price: 99,
    phase1Target: 800,
    phase2Target: 500,
    dailyLoss: 500,
    maxDrawdown: 1000,
    popular: false,
    description: 'Perfect for beginner traders building disciplined risk management.',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Pro $25K',
    balance: 25000,
    price: 199,
    phase1Target: 2000,
    phase2Target: 1250,
    dailyLoss: 1250,
    maxDrawdown: 2500,
    popular: true,
    description: 'Our most popular evaluation tier with balanced risk and capital.',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Elite $50K',
    balance: 50000,
    price: 299,
    phase1Target: 4000,
    phase2Target: 2500,
    dailyLoss: 2500,
    maxDrawdown: 5000,
    popular: false,
    description: 'Substantial simulated capital for proven, seasoned strategies.',
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Master $100K',
    balance: 100000,
    price: 499,
    phase1Target: 8000,
    phase2Target: 5000,
    dailyLoss: 5000,
    maxDrawdown: 10000,
    popular: false,
    description: 'The premier institutional challenge tier with maximum simulated allocations.',
  },
];

export default function PricingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  // Billing form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('United States');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPct: number; description: string } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
        if (user.user_metadata?.full_name) {
          setFullName(user.user_metadata.full_name);
        }
      }
    }
    loadUser();
  }, []);

  function openCheckout(plan: any) {
    setSelectedPlan(plan);
    setOrderError(null);
    setCheckoutModalOpen(true);
  }

  async function handleApplyCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;

    setCouponLoading(true);
    setCouponError(null);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCodeInput.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.valid) {
        throw new Error(data.error || 'Invalid or expired coupon code.');
      }

      setAppliedCoupon(data.coupon);
      setCouponCodeInput('');
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon.');
    } finally {
      setCouponLoading(false);
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponError(null);
  }

  async function handleCompleteOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPlan) return;

    setSubmitting(true);
    setOrderError(null);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan.id,
          billingDetails: {
            fullName,
            email,
            country,
            streetAddress,
            city,
            postalCode,
          },
          couponCode: appliedCoupon?.code || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete order.');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setOrderError(err.message || 'Order completion failed.');
      setSubmitting(false);
    }
  }

  // Price calculations
  const originalPrice = selectedPlan ? Number(selectedPlan.price) : 0;
  const discountPct = appliedCoupon ? appliedCoupon.discountPct : 0;
  const discountAmount = (originalPrice * discountPct) / 100;
  const finalPrice = Math.max(0, originalPrice - discountAmount);

  return (
    <div className="flex-1 py-12 px-4 container mx-auto max-w-6xl space-y-12 bg-[#0b0f17]">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-950/20 px-3 py-1 font-semibold tracking-wider">
          Evaluation Challenge Tiers
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Choose Your Evaluation Capital
        </h1>
        <p className="text-sm sm:text-base text-slate-400">
          All challenges are paper trading accounts simulating institutional proprietary firm conditions. Pass Phase 1 (8%) and Phase 2 (5%) to qualify for funded payouts with an <strong>80% performance profit split</strong>.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={`relative flex flex-col justify-between transition-all duration-200 ${
              plan.popular
                ? 'border-emerald-500/80 bg-slate-900 shadow-xl shadow-emerald-500/10 scale-[1.02]'
                : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-emerald-600 text-slate-950 text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow">
                  Most Popular
                </span>
              </div>
            )}

            <CardHeader className="text-center pb-2 pt-6">
              <CardTitle className="text-lg font-bold text-white">{plan.name}</CardTitle>
              <CardDescription className="text-xs min-h-[32px] pt-1 text-slate-400">{plan.description}</CardDescription>
              <div className="mt-4 flex items-baseline justify-center">
                <span className="text-3xl font-extrabold text-white font-mono">${plan.price}</span>
                <span className="text-xs text-slate-400 ml-1">one-time fee</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-2.5 pt-4 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Simulated Capital</span>
                <span className="font-bold text-white font-mono">${plan.balance.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Phase 1 Target (8%)</span>
                <span className="font-semibold text-emerald-400 font-mono">+${plan.phase1Target.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Phase 2 Target (5%)</span>
                <span className="font-semibold text-emerald-400 font-mono">+${plan.phase2Target.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Max Daily Loss (5%)</span>
                <span className="font-semibold text-rose-400 font-mono">-${plan.dailyLoss.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Max Drawdown (10%)</span>
                <span className="font-semibold text-rose-400 font-mono">-${plan.maxDrawdown.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Min Trading Days</span>
                <span className="font-semibold text-slate-200">5 Days</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Max Leverage</span>
                <span className="font-semibold text-slate-200">1:20 Notional</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-400">Profit Split</span>
                <span className="font-bold text-emerald-400 font-mono">80% Performance</span>
              </div>
            </CardContent>

            <CardFooter className="pt-2 pb-6 flex flex-col gap-2">
              <Button
                onClick={() => openCheckout(plan)}
                className={`w-full font-semibold ${
                  plan.popular
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                Select Challenge <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Rules Overview */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          Evaluation Rules & Execution Parameters
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
          <div className="space-y-2 bg-slate-950/50 p-4 rounded-lg border border-slate-800/80">
            <h4 className="font-semibold text-white">Daily Loss Limit Calculation (5%)</h4>
            <p>
              Calculated dynamically from the account equity at 00:00:00 UTC of each trading day. If equity falls below 95% of the day-start equity at any moment during the day (including unrealized floating loss), the account is automatically locked and flagged as breached.
            </p>
          </div>
          <div className="space-y-2 bg-slate-950/50 p-4 rounded-lg border border-slate-800/80">
            <h4 className="font-semibold text-white">Max Overall Drawdown (10%)</h4>
            <p>
              Account equity must never breach 10% below the initial challenge balance (e.g. $9,000 for a $10,000 account). Unlike high-water mark trailing models, this static drawdown rule provides greater resilience and flexibility.
            </p>
          </div>
        </div>
      </div>

      {/* Checkout & Coupon Redemption Dialog */}
      <Dialog open={checkoutModalOpen} onOpenChange={setCheckoutModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              Challenge Enrollment: {selectedPlan?.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Complete your billing information and redeem coupon codes to activate your evaluation account.
            </DialogDescription>
          </DialogHeader>

          {orderError && (
            <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{orderError}</span>
            </div>
          )}

          {selectedPlan && (
            <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-white">{selectedPlan.name} Evaluation</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">${selectedPlan.balance.toLocaleString()} Simulated Capital</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-slate-400">
                <div>Phase 1 Target: <strong className="text-white">+8%</strong></div>
                <div>Phase 2 Target: <strong className="text-white">+5%</strong></div>
                <div>Profit Split: <strong className="text-emerald-400">80%</strong></div>
              </div>
            </div>
          )}

          <form onSubmit={handleCompleteOrder} className="space-y-4">
            {/* Billing Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-emerald-400" /> Trader & Billing Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">Full Name *</label>
                  <Input
                    type="text"
                    placeholder="Alex Morgan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-xs text-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">Email Address *</label>
                  <Input
                    type="email"
                    placeholder="alex@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-medium text-slate-400">Street Address *</label>
                  <Input
                    type="text"
                    placeholder="123 Trading Ave, Suite 400"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-xs text-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">Country *</label>
                  <Input
                    type="text"
                    placeholder="United States"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">City *</label>
                  <Input
                    type="text"
                    placeholder="New York"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-xs text-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">Postal / ZIP Code *</label>
                  <Input
                    type="text"
                    placeholder="10001"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-xs text-white"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Coupon Code Section */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-emerald-400" /> Redeem Coupon / Promo Code
              </label>

              {appliedCoupon ? (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>
                      Code <strong>{appliedCoupon.code}</strong> applied: {appliedCoupon.description} (<strong>{appliedCoupon.discountPct}% OFF</strong>)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveCoupon}
                    className="h-7 text-xs text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <X className="h-3.5 w-3.5 mr-1" /> Remove
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter coupon (e.g. BETA100, PROP50)"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-xs uppercase font-mono"
                  />
                  <Button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCodeInput.trim()}
                    className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-4"
                  >
                    {couponLoading ? 'Checking...' : 'Apply Code'}
                  </Button>
                </div>
              )}

              {couponError && (
                <p className="text-[11px] text-rose-400">{couponError}</p>
              )}

              <p className="text-[11px] text-slate-500">
                Tip: Worldwide beta testers can redeem <strong className="text-emerald-400 font-mono">BETA100</strong> or <strong className="text-emerald-400 font-mono">LAUNCH100</strong> for a 100% discount.
              </p>
            </div>

            {/* Order Total Breakdown */}
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Standard Challenge Fee:</span>
                <span className="font-mono text-slate-200">${originalPrice.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon Discount ({appliedCoupon.discountPct}%):</span>
                  <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                <span>Total Amount Due:</span>
                <span className="font-mono text-emerald-400">${finalPrice.toFixed(2)}</span>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCheckoutModalOpen(false)}
                className="border-slate-800 text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-6"
              >
                {submitting ? 'Activating Account...' : 'Confirm & Launch Challenge'}
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
