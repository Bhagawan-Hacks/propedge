'use client';

import React from 'react';
import { Shield, AlertTriangle, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TradingAccount } from '@/types';

interface AccountSummaryBarProps {
  account: TradingAccount | null;
  accounts: TradingAccount[];
  onSelectAccount: (accountId: string) => void;
  unrealizedPnlTotal?: number;
}

export function AccountSummaryBar({
  account,
  accounts,
  onSelectAccount,
  unrealizedPnlTotal = 0,
}: AccountSummaryBarProps) {
  if (!account) {
    return (
      <div className="bg-[#090e17] border border-slate-800 rounded-lg p-2.5 flex items-center justify-between text-xs text-slate-400">
        <span>No trading account selected.</span>
      </div>
    );
  }

  const balance = Number(account.current_balance);
  const equity = balance + unrealizedPnlTotal;
  const marginUsed = Number(account.margin_used);
  const freeMargin = Math.max(0, equity - marginUsed);
  const marginLevelPct = marginUsed > 0 ? (equity / marginUsed) * 100 : 999;

  // Daily P&L = current equity - day start equity
  const dayStart = Number(account.day_start_equity || balance);
  const dailyPnl = equity - dayStart;
  const dailyPnlPct = dayStart > 0 ? (dailyPnl / dayStart) * 100 : 0;

  // Total Drawdown = (initialBalance - equity) / initialBalance
  const initial = Number(account.initial_balance);
  const totalLoss = Math.max(0, initial - equity);
  const drawdownPct = initial > 0 ? (totalLoss / initial) * 100 : 0;

  const isProfitDaily = dailyPnl >= 0;
  const isBreached = account.status === 'breached';

  return (
    <div className="bg-[#090e17] border border-slate-800 rounded-lg px-3 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
      {/* Account Switcher & Status */}
      <div className="flex items-center space-x-2">
        <select
          value={account.id}
          onChange={(e) => onSelectAccount(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-white rounded px-2 py-1 text-xs font-bold focus:outline-none"
        >
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.account_number} (${Number(acc.initial_balance).toLocaleString()} {acc.status.toUpperCase()})
            </option>
          ))}
        </select>

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
          className="uppercase text-[10px] px-2 py-0.5"
        >
          {account.status}
        </Badge>
      </div>

      {/* Metrics Row */}
      <div className="flex items-center flex-wrap gap-4 text-slate-300">
        <div>
          <span className="text-slate-500 text-[10px] block">BALANCE</span>
          <span className="font-bold text-white text-xs">${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div>
          <span className="text-slate-500 text-[10px] block">EQUITY</span>
          <span className={`font-bold text-xs ${unrealizedPnlTotal >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ${equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div>
          <span className="text-slate-500 text-[10px] block">MARGIN USED</span>
          <span className="font-semibold text-slate-300 text-xs">${marginUsed.toFixed(2)}</span>
        </div>

        <div>
          <span className="text-slate-500 text-[10px] block">FREE MARGIN</span>
          <span className="font-semibold text-slate-300 text-xs">${freeMargin.toFixed(2)}</span>
        </div>

        <div>
          <span className="text-slate-500 text-[10px] block">DAILY P&L (5% Max)</span>
          <span className={`font-bold text-xs ${isProfitDaily ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isProfitDaily ? '+' : ''}${dailyPnl.toFixed(2)} ({isProfitDaily ? '+' : ''}{dailyPnlPct.toFixed(2)}%)
          </span>
        </div>

        <div>
          <span className="text-slate-500 text-[10px] block">DRAWDOWN (10% Max)</span>
          <div className="flex items-center space-x-1.5">
            <span className={`font-bold text-xs ${drawdownPct >= 8 ? 'text-rose-400' : drawdownPct >= 5 ? 'text-amber-400' : 'text-slate-300'}`}>
              {drawdownPct.toFixed(2)}%
            </span>
            <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${drawdownPct >= 8 ? 'bg-rose-500' : drawdownPct >= 5 ? 'bg-amber-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(100, (drawdownPct / 10) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
