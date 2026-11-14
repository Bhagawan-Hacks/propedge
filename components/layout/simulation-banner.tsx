'use client';

import React, { useState } from 'react';
import { Sparkles, Globe, X, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export function SimulationBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-300 px-4 py-2 text-xs font-medium flex items-center justify-between shadow-sm sticky top-0 z-50 backdrop-blur-md">
      <div className="flex items-center space-x-2.5 container mx-auto justify-center sm:justify-start">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-[11px] uppercase tracking-wider">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Beta Live
        </span>
        <span className="text-slate-300">
          <strong className="text-white font-semibold">PropEdge Worldwide Beta:</strong> Evaluate your strategy with real-time liquidity feeds and qualify for up to an <strong>80% performance profit split</strong>.
        </span>
        <Link href="/pricing" className="hidden md:inline-flex items-center text-emerald-400 hover:text-emerald-300 underline font-semibold ml-2">
          View Challenges →
        </Link>
      </div>
      <div className="hidden lg:flex items-center space-x-3 text-slate-400 text-[11px] shrink-0 font-mono">
        <div className="flex items-center space-x-1.5 text-emerald-400/90">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Real-Time Execution Engine</span>
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
