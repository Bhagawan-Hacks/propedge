import React from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Award, 
  BarChart3, 
  ArrowRight, 
  Check, 
  Lock, 
  DollarSign, 
  Clock, 
  Scale, 
  AlertTriangle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

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
  },
];

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-[#0a0f1d] to-[#080c14]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Zap className="h-3.5 w-3.5 text-blue-400" />
            <span>Next-Gen Proprietary Evaluation Simulator</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Prove Your Edge. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400">
              Trade Simulated Capital with Real-Market Feeds.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            PropEdge gives prospective traders a realistic proprietary trading firm evaluation environment. Pass Phase 1 (8%) and Phase 2 (5%), respect strict daily and overall drawdown risk rules, and unlock simulated funded accounts with an <strong>80% virtual profit split</strong>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/pricing">
              <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 shadow-lg shadow-blue-600/30">
                Choose Challenge Plan <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/terminal">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200">
                <BarChart3 className="h-4 w-4 mr-2 text-cyan-400" />
                Launch Trading Terminal
              </Button>
            </Link>
          </div>

          {/* Key Value Badges */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <div className="text-2xl font-bold text-white font-mono">1:20</div>
              <div className="text-xs text-slate-400">Simulated Leverage</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <div className="text-2xl font-bold text-emerald-400 font-mono">80%</div>
              <div className="text-xs text-slate-400">Virtual Profit Split</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <div className="text-2xl font-bold text-blue-400 font-mono">5 Days</div>
              <div className="text-xs text-slate-400">Min Trading Days</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <div className="text-2xl font-bold text-amber-400 font-mono">5% / 10%</div>
              <div className="text-xs text-slate-400">Max Loss / Drawdown</div>
            </div>
          </div>
        </div>
      </section>

      {/* Rules Breakdown Section */}
      <section className="py-16 bg-[#090d18] border-b border-slate-800/80">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Authentic Prop Firm Rules</h2>
            <p className="text-sm text-slate-400">Engineered to cultivate institutional risk management disciplines.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-2">
                  <Award className="h-5 w-5" />
                </div>
                <CardTitle className="text-base text-white">Profit Targets</CardTitle>
                <CardDescription>Two structured evaluation phases</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span>Phase 1 Evaluation:</span>
                  <span className="font-semibold text-emerald-400">8.0% Profit Target</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span>Phase 2 Verification:</span>
                  <span className="font-semibold text-purple-400">5.0% Profit Target</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Funded Stage:</span>
                  <span className="font-semibold text-blue-400">No Target (Earn 80%)</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-2">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <CardTitle className="text-base text-white">Drawdown Limits</CardTitle>
                <CardDescription>Strict capital preservation boundaries</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span>Max Daily Loss:</span>
                  <span className="font-semibold text-rose-400">5.0% (Day-Start Equity)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span>Max Total Drawdown:</span>
                  <span className="font-semibold text-rose-400">10.0% Trailing Limit</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Automated Breach Guard:</span>
                  <span className="font-semibold text-slate-300">Auto-Close on Limit</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-2">
                  <Clock className="h-5 w-5" />
                </div>
                <CardTitle className="text-base text-white">Trading Conditions</CardTitle>
                <CardDescription>Transparent institutional execution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span>Minimum Trading Days:</span>
                  <span className="font-semibold text-indigo-400">5 Unique Days</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span>Max Leverage:</span>
                  <span className="font-semibold text-indigo-400">1:20 Notional</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Market Feeds:</span>
                  <span className="font-semibold text-indigo-400">Real-Time Binance WS</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-16 bg-[#080c14] border-b border-slate-800/80">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Evaluation Challenge Tiers</h2>
            <p className="text-sm text-slate-400">Select a simulated starting balance that fits your trading style.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS.map((plan) => (
              <Card 
                key={plan.id}
                className={`relative border flex flex-col justify-between transition-all duration-200 ${
                  plan.popular 
                    ? 'border-blue-500/80 bg-slate-900 shadow-xl shadow-blue-500/10' 
                    : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-md">
                      Most Popular
                    </span>
                  </div>
                )}

                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-lg font-bold text-white">{plan.name}</CardTitle>
                  <CardDescription className="text-xs">2-Phase Simulated Evaluation</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-extrabold text-white font-mono">${plan.price}</span>
                    <span className="text-xs text-slate-400 ml-1">one-time</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-4 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Starting Balance</span>
                    <span className="font-bold text-white font-mono">${plan.balance.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Phase 1 Target (8%)</span>
                    <span className="font-semibold text-emerald-400 font-mono">+${plan.phase1Target.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Phase 2 Target (5%)</span>
                    <span className="font-semibold text-purple-400 font-mono">+${plan.phase2Target.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Daily Loss Limit (5%)</span>
                    <span className="font-semibold text-rose-400 font-mono">-${plan.dailyLoss.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Max Drawdown (10%)</span>
                    <span className="font-semibold text-rose-400 font-mono">-${plan.maxDrawdown.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-400">Profit Split</span>
                    <span className="font-bold text-emerald-400">80% Virtual Split</span>
                  </div>
                </CardContent>

                <CardFooter className="pt-2">
                  <Link href={`/pricing`} className="w-full">
                    <Button 
                      className={`w-full ${
                        plan.popular 
                          ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      Start Challenge
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Educational Notice Footer */}
      <footer className="py-10 bg-[#060910] border-t border-slate-800/80 text-center text-xs text-slate-500 space-y-3 px-4">
        <div className="flex items-center justify-center space-x-2 text-amber-400/90 font-medium">
          <AlertTriangle className="h-4 w-4" />
          <span>Educational Proprietary Firm Simulation Project</span>
        </div>
        <p className="max-w-3xl mx-auto leading-relaxed">
          PropEdge is strictly an educational college demonstration platform. All accounts are virtual paper trading accounts. Real cryptocurrency market price feeds from Binance public APIs are used exclusively for chart visualization and simulated execution. No real monetary transactions or broker executions occur.
        </p>
        <p className="text-[11px] text-slate-600">
          © {new Date().getFullYear()} PropEdge Simulator. Built with Next.js, Supabase, Tailwind CSS, and Stripe Test Mode.
        </p>
      </footer>
    </div>
  );
}

