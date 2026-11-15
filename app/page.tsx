'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Award, 
  BarChart3, 
  ArrowRight, 
  Check, 
  DollarSign, 
  Clock, 
  Scale, 
  Globe, 
  Layers, 
  HelpCircle,
  Activity,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Flame,
  Star,
  RefreshCw,
  Sliders,
  Wallet,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

// Evaluation Models Config
type ModelType = '2-step' | '1-step' | 'pro' | '3-step';

interface AccountTier {
  size: number;
  label: string;
  price: number;
  id: string;
}

const ACCOUNT_TIERS: AccountTier[] = [
  { size: 5000, label: '$5,000', price: 32, id: '00000000-0000-0000-0000-000000005000' },
  { size: 10000, label: '$10,000', price: 60, id: '11111111-1111-1111-1111-111111111111' },
  { size: 25000, label: '$25,000', price: 139, id: '22222222-2222-2222-2222-222222222222' },
  { size: 50000, label: '$50,000', price: 239, id: '33333333-3333-3333-3333-333333333333' },
  { size: 100000, label: '$100,000', price: 399, id: '44444444-4444-4444-4444-444444444444' },
  { size: 200000, label: '$200,000', price: 799, id: '55555555-5555-5555-5555-555555555555' },
];

const RECENT_PAYOUTS = [
  { trader: 'Marcus B.', country: '🇺🇸 US', amount: '$6,420.00', time: '4m ago', method: 'Crypto (USDT)' },
  { trader: 'Aarav S.', country: '🇮🇳 IN', amount: '$3,180.50', time: '11m ago', method: 'Bank Transfer' },
  { trader: 'Oliver T.', country: '🇬🇧 UK', amount: '$8,940.00', time: '19m ago', method: 'Crypto (USDC)' },
  { trader: 'Sven K.', country: '🇩🇪 DE', amount: '$5,210.00', time: '26m ago', method: 'Bank Transfer' },
  { trader: 'Tariq M.', country: '🇦🇪 AE', amount: '$12,450.00', time: '34m ago', method: 'Crypto (USDT)' },
  { trader: 'Mateo R.', country: '🇪🇸 ES', amount: '$4,150.00', time: '48m ago', method: 'Crypto (USDT)' },
];

const FAQS = [
  {
    q: 'How does the evaluation process work?',
    a: 'Our evaluation is divided into phases designed to discover talented traders. In Phase 1 (Student), you trade towards an 8% profit target. In Phase 2 (Practitioner), you confirm consistency with a 5% target. Once completed while respecting the 5% daily and 10% maximum total drawdown, you earn a simulated Master Account with up to 100% profit split.',
  },
  {
    q: 'Are there any time limits or minimum trading days?',
    a: 'There are ZERO time limits on any of our evaluation models! You can take as many weeks or months as needed to pass at your own pace without arbitrary deadline stress. Minimum trading days is only 0 to 3 days depending on the selected model.',
  },
  {
    q: 'How is the 5% maximum daily loss calculated?',
    a: 'Maximum daily loss is calculated based on the account equity at 00:00:00 UTC at the beginning of each trading day. Your equity must not drop below 95% of that day-start equity at any point during that 24-hour cycle.',
  },
  {
    q: 'When and how can I request my payouts?',
    a: 'Traders can request payouts on demand directly through their dashboard as soon as 7-14 days after the first trade on a Master Account. Payouts are reviewed and disbursed rapidly in under 2 hours via Crypto (USDT, USDC, BTC) or Direct Bank Wire.',
  },
  {
    q: 'Is the evaluation fee refundable?',
    a: 'Yes, 100%! When you complete your evaluation stages and request your first payout from your Master Account, your initial evaluation registration fee is fully refunded alongside your profit split.',
  },
  {
    q: 'Can I trade crypto over the weekends and during high-impact news?',
    a: 'Yes. Our platform connects directly to 24/7 institutional liquidity feeds. You are completely permitted to hold positions overnight, over weekends, and trade through high-impact news events without restrictions.',
  },
];

export default function HomePage() {
  const [selectedModel, setSelectedModel] = useState<ModelType>('2-step');
  const [selectedTierIndex, setSelectedTierIndex] = useState<number>(4); // Default $100K
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const tier = ACCOUNT_TIERS[selectedTierIndex];

  // Dynamic parameters based on model
  const getModelSpecs = () => {
    switch (selectedModel) {
      case '1-step':
        return {
          steps: '1 Phase',
          p1Target: '10%',
          p1Amount: tier.size * 0.10,
          p2Target: 'N/A (Single Step)',
          p2Amount: 0,
          dailyLoss: '4%',
          dailyAmount: tier.size * 0.04,
          maxLoss: '8% Trailing',
          maxLossAmount: tier.size * 0.08,
          minDays: '0 Days',
          profitSplit: 'Up to 90%',
          fee: Math.round(tier.price * 1.15),
          leverage: '1:50 Forex • 1:5 Crypto',
        };
      case 'pro':
        return {
          steps: '2 Phases (Pro)',
          p1Target: '7%',
          p1Amount: tier.size * 0.07,
          p2Target: '4%',
          p2Amount: tier.size * 0.04,
          dailyLoss: '5%',
          dailyAmount: tier.size * 0.05,
          maxLoss: '12% Static',
          maxLossAmount: tier.size * 0.12,
          minDays: '3 Days',
          profitSplit: 'Up to 100%',
          fee: Math.round(tier.price * 1.25),
          leverage: '1:100 Forex • 1:5 Crypto',
        };
      case '3-step':
        return {
          steps: '3 Phases',
          p1Target: '6%',
          p1Amount: tier.size * 0.06,
          p2Target: '4%',
          p2Amount: tier.size * 0.04,
          dailyLoss: '5%',
          dailyAmount: tier.size * 0.05,
          maxLoss: '10% Static',
          maxLossAmount: tier.size * 0.10,
          minDays: '0 Days',
          profitSplit: 'Up to 85%',
          fee: Math.round(tier.price * 0.85),
          leverage: '1:100 Forex • 1:5 Crypto',
        };
      case '2-step':
      default:
        return {
          steps: '2 Phases',
          p1Target: '8%',
          p1Amount: tier.size * 0.08,
          p2Target: '5%',
          p2Amount: tier.size * 0.05,
          dailyLoss: '5%',
          dailyAmount: tier.size * 0.05,
          maxLoss: '10% Static',
          maxLossAmount: tier.size * 0.10,
          minDays: '0 Days',
          profitSplit: 'Up to 100%',
          fee: tier.price,
          leverage: '1:100 Forex • 1:5 Crypto',
        };
    }
  };

  const specs = getModelSpecs();

  return (
    <div className="flex-1 flex flex-col bg-[#06080f] text-slate-100 overflow-x-hidden">
      {/* 1. Hero Section with Signature PropEdge Purple Glow & Tagline */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32 border-b border-[#1b2234]">
        {/* Subtle radial ambient purple glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.18)_0%,rgba(109,40,217,0.06)_40%,transparent_70%)] pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl space-y-7">
          {/* Top Pill Tagline */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold tracking-wide shadow-sm shadow-violet-500/10">
            <span className="flex h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
            <span className="uppercase tracking-widest text-[11px]">Your Skill Is Our Capital</span>
            <span className="text-violet-500">•</span>
            <span className="text-slate-300">Unlimited Trading Days</span>
          </div>

          {/* Main Huge Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Built By Traders, <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-300 to-indigo-400 bg-clip-text text-transparent">
              For Traders.
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Trade up to <strong className="text-white font-semibold">$300,000</strong> in simulated capital. Prove your trading consistency, trade with zero time limits, and receive fast on-demand payouts with up to <strong className="text-emerald-400 font-semibold">100% profit split</strong>.
          </p>

          {/* Dual Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            <Link href="/pricing" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full sm:w-auto rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold px-9 py-6 text-base shadow-[0_0_30px_rgba(139,92,246,0.45)] border border-violet-400/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Buy Evaluation <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>

            <Link href="/terminal" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto rounded-full border-[#232f48] bg-[#0c101c]/80 hover:bg-[#151c2e] hover:border-violet-500/50 text-slate-200 px-8 py-6 text-base transition-all"
              >
                <BarChart3 className="h-5 w-5 mr-2 text-violet-400" />
                Launch Web Terminal
              </Button>
            </Link>
          </div>

          {/* Trustpilot Review Badge */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1 bg-[#101625] px-3 py-1.5 rounded-full border border-[#1d2639]">
              <span className="font-semibold text-white">Trustpilot</span>
              <div className="flex text-emerald-400 ml-1">
                {'★'.repeat(5)}
              </div>
              <span className="font-bold text-white ml-1">4.8</span>
              <span className="text-slate-500">/ 5.0</span>
            </div>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span>⚡ Over <strong>$125M+</strong> in rewards distributed worldwide</span>
          </div>
        </div>
      </section>

      {/* 2. Global Key Metrics Ribbon */}
      <section className="border-b border-[#1b2234] bg-[#080c16] py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">$128,450,000+</div>
              <div className="text-xs text-slate-400 font-medium">Total Rewards Distributed</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-violet-400 font-mono tracking-tight">&lt; 2 Hours</div>
              <div className="text-xs text-slate-400 font-medium">Average Payout Speed</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">Up to 100%</div>
              <div className="text-xs text-slate-400 font-medium">Performance Profit Split</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">280,000+</div>
              <div className="text-xs text-slate-400 font-medium">Global Active Traders</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE SIGNATURE PROPEDGE INTERACTIVE EVALUATION SELECTOR & MATRIX */}
      <section id="evaluation" className="py-20 md:py-28 border-b border-[#1b2234] bg-[#06080f] relative">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Section Header */}
          <div className="text-center space-y-3 mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-xs font-semibold text-violet-400 uppercase tracking-wider">
              <Sliders className="h-3.5 w-3.5" /> Interactive Evaluation Matrix
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Choose Your Challenge
            </h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
              Select your preferred evaluation model and account size. All fees are 100% refundable upon your first reward payout.
            </p>
          </div>

          {/* Model Type Selector Tabs (1-Step, 2-Step Standard, 2-Step Pro, 3-Step) */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1.5 rounded-2xl bg-[#0c111e] border border-[#1c2438] shadow-inner max-w-full overflow-x-auto">
              <button
                onClick={() => setSelectedModel('2-step')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all whitespace-nowrap ${
                  selectedModel === '2-step'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                2-Step Evaluation
              </button>
              <button
                onClick={() => setSelectedModel('1-step')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all whitespace-nowrap ${
                  selectedModel === '1-step'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                1-Step Flex
              </button>
              <button
                onClick={() => setSelectedModel('pro')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all whitespace-nowrap ${
                  selectedModel === 'pro'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                2-Step Pro
              </button>
              <button
                onClick={() => setSelectedModel('3-step')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all whitespace-nowrap ${
                  selectedModel === '3-step'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                3-Step Superflex
              </button>
            </div>
          </div>

          {/* Account Balance Pills ($5K, $10K, $25K, $50K, $100K, $200K) */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3 mb-10 max-w-4xl mx-auto">
            {ACCOUNT_TIERS.map((item, index) => {
              const isSelected = selectedTierIndex === index;
              return (
                <button
                  key={item.size}
                  onClick={() => setSelectedTierIndex(index)}
                  className={`py-3 px-2 rounded-xl text-center border font-bold transition-all relative ${
                    isSelected
                      ? 'border-violet-500 bg-violet-600/20 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] ring-1 ring-violet-500'
                      : 'border-[#1b2336] bg-[#0c111e]/90 text-slate-300 hover:border-violet-500/40 hover:bg-[#121829]'
                  }`}
                >
                  {item.size === 100000 && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[9px] px-2 py-0.2 rounded-full font-extrabold uppercase tracking-wider">
                      Popular
                    </span>
                  )}
                  <div className="text-sm sm:text-base font-extrabold">{item.label}</div>
                  <div className="text-[11px] font-mono text-slate-400 pt-0.5">
                    ${item.price}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Spec Table Matrix Card */}
          <div className="rounded-2xl border border-[#1f283d] bg-gradient-to-b from-[#0e1424] to-[#0a0e19] shadow-2xl overflow-hidden max-w-4xl mx-auto">
            {/* Header Ribbon of the Card */}
            <div className="px-6 py-4 bg-[#12192c] border-b border-[#1f283d] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {tier.label} Capital Evaluation
                    <Badge variant="outline" className="text-[10px] bg-violet-500/15 border-violet-500/30 text-violet-300 uppercase">
                      {specs.steps}
                    </Badge>
                  </h3>
                  <p className="text-xs text-slate-400">Standard Simulated Master Progression Plan</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
                <span className="px-2.5 py-1 rounded-md bg-[#090d18] border border-[#1d2639]">MatchTrader</span>
                <span className="px-2.5 py-1 rounded-md bg-[#090d18] border border-[#1d2639]">cTrader</span>
                <span className="px-2.5 py-1 rounded-md bg-[#090d18] border border-[#1d2639]">TradeLocker</span>
                <span className="px-2.5 py-1 rounded-md bg-violet-500/20 border border-violet-500/40 text-violet-300 font-bold">Web Terminal</span>
              </div>
            </div>

            {/* Matrix Parameters Rows */}
            <div className="divide-y divide-[#1b2336] text-xs sm:text-sm">
              <div className="grid grid-cols-2 sm:grid-cols-3 px-6 py-3.5 hover:bg-white/[0.02] transition">
                <span className="text-slate-400 font-medium">Trading Period</span>
                <span className="text-white font-bold sm:col-span-2 flex items-center gap-1.5 text-violet-300">
                  <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                  Unlimited (No time limit)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 px-6 py-3.5 hover:bg-white/[0.02] transition">
                <span className="text-slate-400 font-medium">Minimum Trading Days</span>
                <span className="text-white font-bold sm:col-span-2 font-mono">
                  {specs.minDays}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 px-6 py-3.5 hover:bg-white/[0.02] transition">
                <span className="text-slate-400 font-medium">Maximum Daily Loss</span>
                <div className="sm:col-span-2 flex items-center gap-2">
                  <span className="text-rose-400 font-bold font-mono">
                    {specs.dailyLoss} (-${specs.dailyAmount.toLocaleString()})
                  </span>
                  <span className="text-[11px] text-slate-500 hidden sm:inline">(Calculated on 00:00 UTC Equity)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 px-6 py-3.5 hover:bg-white/[0.02] transition">
                <span className="text-slate-400 font-medium">Maximum Total Loss</span>
                <div className="sm:col-span-2 flex items-center gap-2">
                  <span className="text-rose-400 font-bold font-mono">
                    {specs.maxLoss} (-${specs.maxLossAmount.toLocaleString()})
                  </span>
                  <span className="text-[11px] text-slate-500 hidden sm:inline">(Static Drawdown)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 px-6 py-3.5 hover:bg-white/[0.02] transition">
                <span className="text-slate-400 font-medium">Phase 1 Target</span>
                <span className="text-emerald-400 font-bold font-mono sm:col-span-2">
                  {specs.p1Target} (+${specs.p1Amount.toLocaleString()})
                </span>
              </div>

              {specs.p2Amount > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 px-6 py-3.5 hover:bg-white/[0.02] transition">
                  <span className="text-slate-400 font-medium">Phase 2 Target</span>
                  <span className="text-emerald-400 font-bold font-mono sm:col-span-2">
                    {specs.p2Target} (+${specs.p2Amount.toLocaleString()})
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 px-6 py-3.5 hover:bg-white/[0.02] transition">
                <span className="text-slate-400 font-medium">Leverage</span>
                <span className="text-slate-200 font-mono sm:col-span-2">
                  {specs.leverage}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 px-6 py-3.5 hover:bg-white/[0.02] transition">
                <span className="text-slate-400 font-medium">Profit Split</span>
                <span className="text-emerald-400 font-bold font-mono sm:col-span-2 flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-emerald-400" />
                  {specs.profitSplit} (Scales up to 100%)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 px-6 py-3.5 hover:bg-white/[0.02] transition">
                <span className="text-slate-400 font-medium">Registration Fee</span>
                <div className="sm:col-span-2 flex items-center gap-2">
                  <span className="text-2xl font-extrabold text-white font-mono">
                    ${specs.fee}
                  </span>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                    100% Refundable
                  </Badge>
                </div>
              </div>
            </div>

            {/* Bottom Checkout CTA Banner */}
            <div className="p-6 bg-[#0c1221] border-t border-[#1f283d] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <div className="text-xs text-slate-400 font-medium">Selected Package:</div>
                <div className="text-base font-extrabold text-white">
                  {tier.label} • {specs.steps} • One-Time Fee: ${specs.fee}
                </div>
              </div>

              <Link href={`/pricing?tier=${tier.size}&model=${selectedModel}`} className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold px-8 py-5 text-sm shadow-[0_0_25px_rgba(139,92,246,0.45)] border border-violet-400/40"
                >
                  Start Evaluation <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PropEdge Trader Progression Path: Student -> Practitioner -> Master */}
      <section className="py-20 md:py-28 border-b border-[#1b2234] bg-[#070b14] relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center space-y-3 mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-xs font-semibold text-violet-400 uppercase tracking-wider">
              <Layers className="h-3.5 w-3.5" /> Career Journey
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              From Student to Master Trader
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Our structured path guides you from evaluation to trading institutional-grade capital with guaranteed rewards.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Step 1: Student */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-[#0e1424] to-[#090d18] border border-[#1e2638] relative space-y-4 shadow-lg hover:border-violet-500/40 transition">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-400 font-extrabold text-base">
                  1
                </div>
                <Badge variant="outline" className="text-[10px] bg-violet-500/10 border-violet-500/30 text-violet-300">
                  Phase 1
                </Badge>
              </div>
              <h3 className="text-lg font-bold text-white">The Student</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Prove your profitability and discipline. Hit an 8% profit target with zero time limits while managing your daily and total drawdowns.
              </p>
              <div className="pt-2 text-[11px] font-mono text-violet-400 space-y-1">
                <div>• 8% Profit Target</div>
                <div>• Unlimited Days (Trade at your pace)</div>
                <div>• 5% Daily / 10% Overall Max Loss</div>
              </div>
            </div>

            {/* Step 2: Practitioner */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-[#0e1424] to-[#090d18] border border-[#1e2638] relative space-y-4 shadow-lg hover:border-violet-500/40 transition">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-400 font-extrabold text-base">
                  2
                </div>
                <Badge variant="outline" className="text-[10px] bg-violet-500/10 border-violet-500/30 text-violet-300">
                  Phase 2
                </Badge>
              </div>
              <h3 className="text-lg font-bold text-white">The Practitioner</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Verify that your Phase 1 performance wasn&apos;t luck. Achieve a reduced 5% target with the exact same risk boundaries.
              </p>
              <div className="pt-2 text-[11px] font-mono text-violet-400 space-y-1">
                <div>• 5% Profit Target</div>
                <div>• Confirmed Strategy Consistency</div>
                <div>• Instant Verification</div>
              </div>
            </div>

            {/* Step 3: Master Trader */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-[#131a30] to-[#0a0e1c] border border-violet-500/60 relative space-y-4 shadow-xl shadow-violet-500/10 hover:border-violet-400 transition">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-base">
                  3
                </div>
                <Badge variant="outline" className="text-[10px] bg-emerald-500/15 border-emerald-500/30 text-emerald-300">
                  Funded Stage
                </Badge>
              </div>
              <h3 className="text-lg font-bold text-white">Master Account</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Trade simulated firm capital with complete freedom. Request on-demand payouts and scale your balance all the way to $2,000,000+.
              </p>
              <div className="pt-2 text-[11px] font-mono text-emerald-400 space-y-1">
                <div>• 80% to 100% Profit Split</div>
                <div>• 100% Refundable Evaluation Fee</div>
                <div>• On-Demand Fast Withdrawals</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Core Value Propositions & Advantages */}
      <section className="py-20 md:py-28 border-b border-[#1b2234] bg-[#06080f]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Why Elite Traders Choose Us
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Built on transparent institutional rules, rapid liquidity, and lightning-fast reward processing.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#0b101c] border border-[#1b2336] space-y-3 hover:border-violet-500/30 transition">
              <div className="h-10 w-10 rounded-xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">On-Demand Payouts in &lt; 2h</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Receive your profits on demand via cryptocurrency or direct wire without waiting weeks for arbitrary calendar cycles.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0b101c] border border-[#1b2336] space-y-3 hover:border-violet-500/30 transition">
              <div className="h-10 w-10 rounded-xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Zero Time Restrictions</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Take all the time you need. There are no maximum days to finish your evaluation, allowing you to wait for high-probability setups.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0b101c] border border-[#1b2336] space-y-3 hover:border-violet-500/30 transition">
              <div className="h-10 w-10 rounded-xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Scale Up To $2,000,000</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Consistent traders receive 20% balance increases every 10% simulated profit milestone, unlocking scaling up to $2M and 100% split.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0b101c] border border-[#1b2336] space-y-3 hover:border-violet-500/30 transition">
              <div className="h-10 w-10 rounded-xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">100% Refundable Fee</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your initial challenge purchase fee is reimbursed 100% directly alongside your first profit payout on your Master Account.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0b101c] border border-[#1b2336] space-y-3 hover:border-violet-500/30 transition">
              <div className="h-10 w-10 rounded-xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Raw Spreads & Low Latency</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Trade crypto, forex, and commodities with sub-millisecond market execution, institutional liquidity, and zero markups.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0b101c] border border-[#1b2336] space-y-3 hover:border-violet-500/30 transition">
              <div className="h-10 w-10 rounded-xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <Globe className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Weekend & News Trading</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Never miss high-impact market momentum. Hold swing trades through weekends and trade during breaking macroeconomic events.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Recent Verified Payouts Live Proof Stream */}
      <section className="py-16 border-b border-[#1b2234] bg-[#070b14] overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-extrabold text-white flex items-center justify-center sm:justify-start gap-2">
                <Wallet className="h-5 w-5 text-violet-400" />
                Live Reward Stream
              </h3>
              <p className="text-xs text-slate-400">Real-time payouts processed to Master Account holders</p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              All Payout Systems Operational
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {RECENT_PAYOUTS.map((payout, i) => (
              <div key={i} className="p-4 rounded-xl bg-[#0b101d] border border-[#1c2438] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-sm font-bold text-violet-300">
                    {payout.trader[0]}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      {payout.trader}
                      <span className="text-[10px] text-slate-400 font-normal">{payout.country}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">{payout.method} • {payout.time}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-extrabold text-emerald-400 font-mono">{payout.amount}</div>
                  <div className="text-[9px] text-slate-500 font-mono">Completed ✓</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Trader FAQ Accordion */}
      <section className="py-20 md:py-28 border-b border-[#1b2234] bg-[#06080f]">
        <div className="container mx-auto px-4 max-w-4xl space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-xs font-semibold text-violet-400 uppercase tracking-wider">
              <HelpCircle className="h-3.5 w-3.5" /> FAQ
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Frequently Asked Questions</h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Everything you need to know about our evaluation models, risk policies, and payout procedures.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index} 
                  className={`rounded-xl border transition-all overflow-hidden ${
                    isOpen ? 'border-violet-500/50 bg-[#0d1322]' : 'border-[#1b2336] bg-[#090d18] hover:border-slate-700'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between text-sm sm:text-base font-bold text-white gap-4"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-violet-400">•</span> {faq.q}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-violet-400' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-[#1a2236] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. Call To Action Footer Banner */}
      <section className="py-20 bg-gradient-to-b from-[#06080f] via-[#0d1222] to-[#080c16] relative border-b border-[#1b2234] text-center">
        <div className="container mx-auto px-4 max-w-3xl space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Ready to Prove Your Edge?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Choose your evaluation account, trade with institutional execution, and earn simulated Master status today.
          </p>
          <div className="pt-2">
            <Link href="/pricing">
              <Button 
                size="lg" 
                className="rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold px-10 py-6 text-base shadow-[0_0_35px_rgba(139,92,246,0.5)] border border-violet-400/30"
              >
                Start Evaluation Challenge <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 9. PropEdge Modern Obsidian Footer */}
      <footer className="py-16 bg-[#04060a] border-t border-[#151c2e] text-xs text-slate-400 space-y-10 px-4">
        <div className="container mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-3 col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m13 17 5-5-5-5M6 17l5-5-5-5" />
                </svg>
              </div>
              <span className="font-extrabold text-lg text-white">
                Prop<span className="text-violet-400">Edge</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Leading proprietary trader evaluation firm providing simulated capital and up to 100% performance rewards.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Evaluation Models</h4>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li><Link href="/pricing" className="hover:text-white transition">2-Step Standard</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition">1-Step Flex</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition">2-Step Pro</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition">3-Step Superflex</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Trading Platforms</h4>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li><Link href="/terminal" className="hover:text-white transition">Web Terminal</Link></li>
              <li><span className="hover:text-white transition cursor-pointer">cTrader Integration</span></li>
              <li><span className="hover:text-white transition cursor-pointer">MatchTrader Portal</span></li>
              <li><span className="hover:text-white transition cursor-pointer">TradeLocker Mobile</span></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Trader Portal</h4>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li><Link href="/login" className="hover:text-white transition">Trader Login</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition">Risk Dashboard</Link></li>
              <li><Link href="/leaderboard" className="hover:text-white transition">Leaderboard</Link></li>
              <li><Link href="/payouts" className="hover:text-white transition">Payout Proofs</Link></li>
            </ul>
          </div>
        </div>

        <div className="container mx-auto max-w-6xl pt-6 border-t border-[#151c2e] space-y-3 text-[11px] text-slate-500">
          <p className="leading-relaxed">
            <strong>Regulatory & Risk Disclosure:</strong> All accounts provided by PropEdge are simulated accounts operating in a simulated environment using live market liquidity feeds. Trading financial instruments involves significant risk of loss and is not suitable for every individual. PropEdge does not act as a broker-dealer or custodian of funds. Passing evaluation phases unlocks simulated funded capital and profit-sharing agreements pursuant to firm terms.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-[10px] text-slate-600">
            <span>© {new Date().getFullYear()} PropEdge Technologies Inc. All rights reserved.</span>
            <span>Your skill is our capital.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
