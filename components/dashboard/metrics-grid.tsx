'use client';

import React from 'react';
import { Trophy, TrendingUp, TrendingDown, Target, BarChart2, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Trade } from '@/types';

interface MetricsGridProps {
  trades: Trade[];
}

export function MetricsGrid({ trades }: MetricsGridProps) {
  const totalTrades = trades.length;
  const profitableTrades = trades.filter((t) => Number(t.realized_pnl) > 0);
  const losingTrades = trades.filter((t) => Number(t.realized_pnl) < 0);

  const winRate = totalTrades > 0 ? (profitableTrades.length / totalTrades) * 100 : 0;

  const totalGrossWin = profitableTrades.reduce((acc, t) => acc + Number(t.realized_pnl), 0);
  const totalGrossLoss = Math.abs(losingTrades.reduce((acc, t) => acc + Number(t.realized_pnl), 0));
  const profitFactor = totalGrossLoss > 0 ? totalGrossWin / totalGrossLoss : totalGrossWin > 0 ? 99.9 : 0;

  const bestTrade = totalTrades > 0 ? Math.max(...trades.map((t) => Number(t.realized_pnl))) : 0;
  const worstTrade = totalTrades > 0 ? Math.min(...trades.map((t) => Number(t.realized_pnl))) : 0;
  const totalRealizedPnl = trades.reduce((acc, t) => acc + Number(t.realized_pnl), 0);

  const avgWin = profitableTrades.length > 0 ? totalGrossWin / profitableTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? totalGrossLoss / losingTrades.length : 1;
  const avgRiskReward = avgLoss > 0 ? avgWin / avgLoss : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* Win Rate */}
      <Card className="border-slate-800 bg-slate-900/60">
        <CardContent className="p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Win Rate</span>
            <Target className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {winRate.toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {profitableTrades.length}W - {losingTrades.length}L
          </div>
        </CardContent>
      </Card>

      {/* Profit Factor */}
      <Card className="border-slate-800 bg-slate-900/60">
        <CardContent className="p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Profit Factor</span>
            <BarChart2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {profitFactor.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            ${totalGrossWin.toFixed(0)} / ${totalGrossLoss.toFixed(0)}
          </div>
        </CardContent>
      </Card>

      {/* Avg R:R */}
      <Card className="border-slate-800 bg-slate-900/60">
        <CardContent className="p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Avg Risk:Reward</span>
            <Trophy className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            1:{avgRiskReward.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Avg Win vs Loss
          </div>
        </CardContent>
      </Card>

      {/* Best Trade */}
      <Card className="border-slate-800 bg-slate-900/60">
        <CardContent className="p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Best Trade</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            +${bestTrade.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Single peak win
          </div>
        </CardContent>
      </Card>

      {/* Worst Trade */}
      <Card className="border-slate-800 bg-slate-900/60">
        <CardContent className="p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Worst Trade</span>
            <TrendingDown className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-400">
            ${worstTrade.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Single max drawdown
          </div>
        </CardContent>
      </Card>

      {/* Total Realized P&L */}
      <Card className="border-slate-800 bg-slate-900/60">
        <CardContent className="p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Net Realized P&L</span>
            <DollarSign className="h-4 w-4 text-blue-400" />
          </div>
          <div className={`text-xl font-bold font-mono ${totalRealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalRealizedPnl >= 0 ? '+' : ''}${totalRealizedPnl.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {totalTrades} Total Trades
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
