'use client';

import React, { useState } from 'react';
import { Sparkles, X, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function SimulationBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-[#070a14] border-b border-[#1b2234] text-slate-300 px-4 py-2 text-xs font-medium flex items-center justify-between shadow-sm sticky top-0 z-50 backdrop-blur-md">
      <div className="flex items-center space-x-2.5 container mx-auto justify-center sm:justify-start">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-400 font-semibold text-[10px] uppercase tracking-wider">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
          Live Trading
        </span>
        <span className="text-slate-300">
          <strong className="text-white font-semibold">Your Skill is Our Capital:</strong> Complete the evaluation to trade up to <strong className="text-violet-300">$300,000</strong> simulated capital with up to <strong className="text-emerald-400">100% profit split</strong>.
        </span>
        <Link href="/pricing" className="hidden md:inline-flex items-center text-violet-400 hover:text-violet-300 font-semibold ml-2 group transition">
          Start Challenge <ArrowRight className="h-3 w-3 ml-1 transition group-hover:translate-x-0.5" />
        </Link>
      </div>
      <div className="hidden lg:flex items-center space-x-3 text-slate-400 text-[11px] shrink-0 font-mono">
        <div className="flex items-center space-x-1.5 text-emerald-400/90">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>On-Demand Payouts</span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-slate-800 transition"
          aria-label="Dismiss banner"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
