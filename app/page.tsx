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
  DollarSign, 
  Clock, 
  Scale, 
  Globe, 
  Layers, 
  HelpCircle,
  Activity,
  CheckCircle2,
  ChevronRight
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
    description: 'Ideal starting balance to prove your strategy and risk discipline.',
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
    description: 'Our most popular evaluation tier with optimal risk-to-reward ratio.',
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
    description: 'Substantial capital for seasoned traders with proven track records.',
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
    description: 'Institutional-tier simulated allocation for maximum performance.',
  },
];

const FAQS = [
  {
    q: 'How does the 2-phase evaluation process work?',
    a: 'In Phase 1 (Evaluation), you trade towards an 8% profit target. In Phase 2 (Verification), you confirm consistency with a 5% target. Once both are passed while adhering to the 5% daily and 10% maximum drawdown rules, you advance to the Funded Stage.',
  },
  {
    q: 'How is the 5% maximum daily loss calculated?',
    a: 'Daily loss is measured dynamically from your account equity at 00:00:00 UTC at the start of each trading day. Your equity must not drop below 95% of that day-start equity at any moment during the 24-hour cycle.',
  },
  {
    q: 'How does the 80% profit split payout work?',
    a: 'Traders in the Funded stage earn an 80% performance split on all simulated gains generated. You can request payouts directly from your dashboard to your crypto wallet or bank account, with review and processing under 24 hours.',
  },
  {
    q: 'Can I hold trades overnight and through weekends?',
    a: 'Yes. PropEdge is built on continuous 24/7 cryptocurrency market liquidity feeds from Binance. You have full freedom to hold positions overnight and over weekends.',
  },
  {
    q: 'Are there any minimum trading day requirements?',
    a: 'Yes, a minimum of 5 individual trading days must be logged before graduating each phase. This ensures your performance stems from systematic risk management rather than a single erratic trade.',
  },
];

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col bg-[#0b0f17]">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-28 border-b border-slate-800/80 bg-gradient-to-b from-[#0f172a] via-[#0b0f17] to-[#0b0f17]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.08),transparent_50%)]" />
        
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wide">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>GLOBAL TRADER EVALUATION PROGRAM • WORLDWIDE BETA</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Trade Up To <span className="text-emerald-400 font-mono">$100,000</span>. <br />
            <span className="text-slate-100">
              Keep 80% Of What You Earn.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            PropEdge gives prospective traders worldwide a disciplined proprietary evaluation environment with real-time liquidity feeds. Prove your edge across two structured phases and unlock funded capital.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/pricing">
              <Button size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-8 shadow-lg shadow-emerald-600/20 text-sm">
                Get Started Now <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/terminal">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-sm">
                <BarChart3 className="h-4 w-4 mr-2 text-emerald-400" />
                Launch Trading Terminal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Global Trust & Performance Metrics Bar */}
      <section className="border-b border-slate-800/80 bg-slate-950/60 py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">$25,000,000+</div>
              <div className="text-xs text-slate-400 font-medium">Simulated Capital Allocated</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">80%</div>
              <div className="text-xs text-slate-400 font-medium">Performance Profit Split</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">120+</div>
              <div className="text-xs text-slate-400 font-medium">Countries Worldwide</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">&lt; 24 Hours</div>
              <div className="text-xs text-slate-400 font-medium">Average Payout Processing</div>
            </div>
          </div>
        </div>
      </section>

      {/* Step-by-Step "How It Works" Flow */}
      <section className="py-20 border-b border-slate-800/80 bg-[#0b0f17]">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center space-y-3 mb-16">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <Layers className="h-4 w-4" /> Clear Evaluation Journey
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">How PropEdge Works</h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">Three transparent steps from evaluation to consistent funded payouts.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800/90 relative space-y-4">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-base">
                1
              </div>
              <h3 className="text-lg font-bold text-white">Choose Your Challenge</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Select an account size ranging from $10,000 to $100,000. Receive immediate terminal credentials with real-time market liquidity.
              </p>
              <div className="text-[11px] font-mono text-emerald-400 font-medium pt-2">
                • 1:20 Notional Leverage
              </div>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800/90 relative space-y-4">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-base">
                2
              </div>
              <h3 className="text-lg font-bold text-white">Pass The Rules</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Reach the 8% target in Phase 1 and 5% in Phase 2 across a minimum of 5 trading days. Respect the 5% daily and 10% maximum drawdown limits.
              </p>
              <div className="text-[11px] font-mono text-emerald-400 font-medium pt-2">
                • Automated Compliance Guard
              </div>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800/90 relative space-y-4">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-base">
                3
              </div>
              <h3 className="text-lg font-bold text-white">Get Funded & Earn</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Trade your funded balance without any arbitrary profit deadline. Request withdrawals on demand and receive your 80% profit split.
              </p>
              <div className="text-[11px] font-mono text-emerald-400 font-medium pt-2">
                • 80% Payout Share
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Matrix Section */}
      <section className="py-20 border-b border-slate-800/80 bg-slate-950/40">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Evaluation Challenge Tiers</h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Choose the simulated balance that fits your trading plan. All tiers include full terminal access.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS.map((plan) => (
              <Card 
                key={plan.id}
                className={`relative border flex flex-col justify-between transition-all duration-200 ${
                  plan.popular 
                    ? 'border-emerald-500/80 bg-slate-900/90 shadow-xl shadow-emerald-500/5' 
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-emerald-600 text-slate-950 text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-md">
                      Most Popular
                    </span>
                  </div>
                )}

                <CardHeader className="text-center pb-2 pt-6">
                  <CardTitle className="text-lg font-bold text-white">{plan.name}</CardTitle>
                  <CardDescription className="text-xs pt-1 text-slate-400">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-extrabold text-white font-mono">${plan.price}</span>
                    <span className="text-xs text-slate-400 ml-1">one-time</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-4 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                    <span className="text-slate-400">Starting Balance</span>
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
                    <span className="text-slate-400">Daily Loss Limit (5%)</span>
                    <span className="font-semibold text-rose-400 font-mono">-${plan.dailyLoss.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                    <span className="text-slate-400">Max Drawdown (10%)</span>
                    <span className="font-semibold text-rose-400 font-mono">-${plan.maxDrawdown.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-400">Profit Split</span>
                    <span className="font-bold text-emerald-400 font-mono">80% Performance</span>
                  </div>
                </CardContent>

                <CardFooter className="pt-2 pb-6">
                  <Link href="/pricing" className="w-full">
                    <Button 
                      className={`w-full font-semibold ${
                        plan.popular 
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold' 
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

      {/* Institutional Execution & Risk Guard */}
      <section className="py-20 border-b border-slate-800/80 bg-[#0b0f17]">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Built For Professional Discipline</h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Our automated risk engine replicates institutional trading firm guidelines with sub-millisecond precision.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Dynamic 00:00 UTC Daily Drawdown</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Calculated strictly from your equity at midnight UTC. This protects accumulated profits from previous trading sessions while enforcing daily risk limits.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Real-Time Market Data Feeds</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                All order executions, slippage models, and chart candles stream directly from live public Binance WebSocket channels for 100% price transparency.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Integrated Advanced Terminal</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Native order book, interactive multi-timeframe charts, one-click market and limit executions, and automatic position margin tracking.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Automated Phase Advancement</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                As soon as your profit target and minimum trading days are achieved, your account automatically advances to the next stage without delays.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trader FAQ Section */}
      <section className="py-20 border-b border-slate-800/80 bg-slate-950/40">
        <div className="container mx-auto px-4 max-w-4xl space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <HelpCircle className="h-4 w-4" /> Frequently Asked Questions
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Trader Knowledge Base</h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="p-5 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  {faq.q}
                </h3>
                <p className="text-xs text-slate-300 pl-6 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Worldwide Footer */}
      <footer className="py-12 bg-[#080c14] border-t border-slate-800 text-xs text-slate-400 space-y-8 px-4">
        <div className="container mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-3 col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <TrendingUp className="h-4 w-4" />
              </div>
              <span className="font-bold text-base text-white">PropEdge</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Global proprietary trading firm evaluation platform providing simulated capital and performance profit sharing.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Platform</h4>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li><Link href="/pricing" className="hover:text-white transition">Challenges & Plans</Link></li>
              <li><Link href="/terminal" className="hover:text-white transition">Trading Terminal</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition">Risk Dashboard</Link></li>
              <li><Link href="/leaderboard" className="hover:text-white transition">Trader Leaderboard</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Evaluation Rules</h4>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li><span className="hover:text-white transition">5% Max Daily Drawdown</span></li>
              <li><span className="hover:text-white transition">10% Overall Drawdown</span></li>
              <li><span className="hover:text-white transition">8% Phase 1 Profit Target</span></li>
              <li><span className="hover:text-white transition">80% Performance Payout Split</span></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Account</h4>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li><Link href="/login" className="hover:text-white transition">Trader Sign In</Link></li>
              <li><Link href="/signup" className="hover:text-white transition">Create Challenge Account</Link></li>
              <li><Link href="/reset-password" className="hover:text-white transition">Forgot Password</Link></li>
              <li><Link href="/payouts" className="hover:text-white transition">Payout Portal</Link></li>
            </ul>
          </div>
        </div>

        <div className="container mx-auto max-w-6xl pt-6 border-t border-slate-800/80 space-y-3 text-[11px] text-slate-500">
          <p className="leading-relaxed">
            <strong>Risk Disclosure:</strong> All accounts provided by PropEdge are simulated trading accounts operating in a simulated environment using real-time market data. Trading financial instruments involves significant risk of loss and is not suitable for every individual. PropEdge does not act as a broker-dealer or custodian of funds. Passing evaluation phases unlocks simulated funded capital and profit-sharing agreements pursuant to firm terms.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-[10px] text-slate-600">
            <span>© {new Date().getFullYear()} PropEdge Technologies Inc. All rights reserved.</span>
            <span>Worldwide Beta Release 1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
