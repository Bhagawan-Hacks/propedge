'use client';

import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, Clock, Target, Scale } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { evaluateAccountRisk } from '@/lib/engine/risk';
import { TradingAccount } from '@/types';

interface RulesProgressProps {
  account: TradingAccount;
}

export function RulesProgress({ account }: RulesProgressProps) {
  const risk = evaluateAccountRisk(account);

  // Daily loss progress (0% to 100% of 5% limit)
  const dailyLossMeter = Math.min(100, (risk.dailyLossPct / 5.0) * 100);

  // Total drawdown progress (0% to 100% of 10% limit)
  const drawdownMeter = Math.min(100, (risk.drawdownPct / 10.0) * 100);

  // Profit target progress (0% to 100% of target)
  const targetPct = account.status === 'phase1' ? 8.0 : 5.0;
  const profitProgress = Math.min(100, Math.max(0, (risk.profitPct / targetPct) * 100));

  // Minimum trading days progress
  const daysProgress = Math.min(100, (risk.currentTradingDays / risk.minTradingDays) * 100);

  return (
    <Card className="border-slate-800 bg-slate-900/60">
      <CardHeader className="pb-3 border-b border-slate-800/80">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-400" />
            Evaluation Objectives & Risk Parameters
          </CardTitle>
          <Badge
            variant={
              account.status === 'funded'
                ? 'funded'
                : account.status === 'breached'
                ? 'breached'
                : account.status === 'phase2'
                ? 'phase2'
                : 'phase1'
            }
            className="uppercase text-xs"
          >
            {account.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-5 text-xs font-mono">
        {/* Rule 1: Max Daily Loss (5%) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 font-sans font-medium text-slate-300">
              <Scale className="h-4 w-4 text-rose-400" />
              <span>Maximum Daily Loss (5.0%)</span>
            </div>
            <span className={`font-bold ${risk.dailyLossBreached ? 'text-rose-400' : 'text-slate-300'}`}>
              -${risk.currentDailyLoss.toFixed(2)} / -${risk.dailyLossLimit.toFixed(2)} ({risk.dailyLossPct.toFixed(2)}%)
            </span>
          </div>
          <Progress
            value={dailyLossMeter}
            indicatorColor={dailyLossMeter >= 80 ? 'bg-rose-500' : dailyLossMeter >= 50 ? 'bg-amber-500' : 'bg-emerald-500'}
            className="h-2 bg-slate-800"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-sans">
            <span>Calculated from 00:00 UTC day-start equity (${Number(account.day_start_equity).toFixed(2)})</span>
            <span className={risk.dailyLossBreached ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
              {risk.dailyLossBreached ? 'RULE BREACHED' : 'HEALTHY'}
            </span>
          </div>
        </div>

        {/* Rule 2: Max Total Drawdown (10%) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 font-sans font-medium text-slate-300">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>Maximum Total Drawdown (10.0%)</span>
            </div>
            <span className={`font-bold ${risk.drawdownBreached ? 'text-rose-400' : 'text-slate-300'}`}>
              -${risk.currentDrawdown.toFixed(2)} / -${risk.maxTotalDrawdown.toFixed(2)} ({risk.drawdownPct.toFixed(2)}%)
            </span>
          </div>
          <Progress
            value={drawdownMeter}
            indicatorColor={drawdownMeter >= 80 ? 'bg-rose-500' : drawdownMeter >= 50 ? 'bg-amber-500' : 'bg-blue-500'}
            className="h-2 bg-slate-800"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-sans">
            <span>Fixed floor: must stay above ${(Number(account.initial_balance) * 0.9).toFixed(2)}</span>
            <span className={risk.drawdownBreached ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
              {risk.drawdownBreached ? 'RULE BREACHED' : 'HEALTHY'}
            </span>
          </div>
        </div>

        {/* Rule 3: Profit Target */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 font-sans font-medium text-slate-300">
              <Target className="h-4 w-4 text-emerald-400" />
              <span>
                Profit Target ({targetPct.toFixed(1)}% {account.status === 'phase1' ? 'Phase 1' : 'Phase 2'})
              </span>
            </div>
            <span className="font-bold text-emerald-400">
              +${Math.max(0, risk.currentProfit).toFixed(2)} / +${risk.profitTarget.toFixed(2)} ({risk.profitPct.toFixed(2)}%)
            </span>
          </div>
          <Progress
            value={profitProgress}
            indicatorColor="bg-emerald-500"
            className="h-2 bg-slate-800"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-sans">
            <span>Target equity to achieve: ${(Number(account.initial_balance) + risk.profitTarget).toFixed(2)}</span>
            <span className={risk.profitTargetReached ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
              {risk.profitTargetReached ? 'TARGET REACHED!' : `${profitProgress.toFixed(0)}% Completed`}
            </span>
          </div>
        </div>

        {/* Rule 4: Minimum Trading Days (5) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 font-sans font-medium text-slate-300">
              <Clock className="h-4 w-4 text-indigo-400" />
              <span>Minimum Trading Days</span>
            </div>
            <span className="font-bold text-indigo-400">
              {risk.currentTradingDays} / {risk.minTradingDays} Days
            </span>
          </div>
          <Progress
            value={daysProgress}
            indicatorColor="bg-indigo-500"
            className="h-2 bg-slate-800"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-sans">
            <span>Must execute at least 1 trade on 5 unique calendar days</span>
            <span className={risk.tradingDaysCompleted ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
              {risk.tradingDaysCompleted ? 'COMPLETED' : `${risk.minTradingDays - risk.currentTradingDays} days remaining`}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

