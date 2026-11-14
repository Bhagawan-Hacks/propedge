'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Check, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  ArrowRight, 
  CreditCard, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handlePurchase(planId: string, directDemo: boolean = false) {
    setLoadingPlanId(planId);
    setError(null);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, directDemoPurchase: directDemo }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initiate checkout.');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message || 'Payment initiation error.');
      setLoadingPlanId(null);
    }
  }

  return (
    <div className="flex-1 py-12 px-4 container mx-auto max-w-6xl space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-950/20 px-3 py-1">
          Evaluation Challenge Tiers
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Choose Your Evaluation Capital
        </h1>
        <p className="text-sm sm:text-base text-slate-400">
          All challenges are paper trading accounts simulating institutional proprietary firm conditions. Pass Phase 1 (8%) and Phase 2 (5%) to qualify for funded payouts (80% performance profit split).
        </p>
      </div>

      {error && (
        <div className="max-w-md mx-auto p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANS.map((plan) => {
          const isLoading = loadingPlanId === plan.id;
          return (
            <Card
              key={plan.id}
              className={`relative flex flex-col justify-between transition-all duration-200 ${
                plan.popular
                  ? 'border-emerald-500/80 bg-slate-900 shadow-xl shadow-emerald-500/10 scale-[1.02]'
                  : 'border-slate-800 bg-slate-950/80 hover:border-slate-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-emerald-600 text-slate-950 text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow">
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg font-bold text-white">{plan.name}</CardTitle>
                <CardDescription className="text-xs min-h-[32px] pt-1">{plan.description}</CardDescription>
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
                  <span className="font-semibold text-purple-400 font-mono">+${plan.phase2Target.toLocaleString()}</span>
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
                  <span className="font-bold text-emerald-400">80% Simulated</span>
                </div>
              </CardContent>

              <CardFooter className="pt-2 flex flex-col gap-2">
                <Button
                  onClick={() => handlePurchase(plan.id, false)}
                  disabled={isLoading}
                  className={`w-full ${
                    plan.popular
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  <CreditCard className="h-4 w-4 mr-1.5" />
                  {isLoading ? 'Processing...' : 'Stripe Test Checkout'}
                </Button>

                {/* Instant Demo Activation button for reviewers/evaluators */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePurchase(plan.id, true)}
                  disabled={isLoading}
                  className="w-full text-[11px] border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                >
                  <Sparkles className="h-3 w-3 mr-1 text-amber-400" />
                  Instant Demo Provision
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Comparison & Rules Overview Table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-blue-400" />
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
    </div>
  );
}

