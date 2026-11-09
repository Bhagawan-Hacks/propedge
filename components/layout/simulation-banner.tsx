import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export function SimulationBanner() {
  return (
    <div className="bg-amber-950/60 border-b border-amber-500/30 text-amber-200 px-4 py-1.5 text-xs font-medium flex items-center justify-between shadow-sm sticky top-0 z-50 backdrop-blur-md">
      <div className="flex items-center space-x-2 container mx-auto justify-center sm:justify-start">
        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 animate-pulse" />
        <span>
          <strong className="text-amber-300 font-semibold uppercase tracking-wider">Simulation Only:</strong> This platform is an educational proprietary firm simulator. All trades are paper-traded using simulated funds. No real money is deposited, traded, or at risk.
        </span>
      </div>
      <div className="hidden lg:flex items-center space-x-1.5 text-amber-300/80 text-[11px] shrink-0 font-mono">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
        <span>Virtual Environment Active</span>
      </div>
    </div>
  );
}
