'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  ShieldCheck, 
  CreditCard, 
  LineChart, 
  RefreshCw, 
  Zap, 
  PlusCircle, 
  DollarSign, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MetricsGrid } from '@/components/dashboard/metrics-grid';
import { RulesProgress } from '@/components/dashboard/rules-progress';
import { EquityCurve } from '@/components/dashboard/equity-curve';
import { TradingJournal } from '@/components/dashboard/trading-journal';
import { createClient } from '@/lib/supabase/client';
import { TradingAccount, Trade, EquitySnapshot } from '@/types';

const MOCK_ACCOUNT: TradingAccount = {
  id: '00000000-0000-0000-0000-000000000001',
  user_id: '00000000-0000-0000-0000-000000000001',
  plan_id: '11111111-1111-1111-1111-111111111111',
  account_number: 'PE-DEMO-1001',
  status: 'phase1',
  initial_balance: 10000,
  current_balance: 10450,
  current_equity: 10450,
  margin_used: 450,
  free_margin: 10000,
  high_water_mark: 10450,
  day_start_equity: 10000,
  current_trading_day: new Date().toISOString().split('T')[0],
  trading_days_count: 2,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<TradingAccount[]>([MOCK_ACCOUNT]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(MOCK_ACCOUNT.id);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [snapshots, setSnapshots] = useState<EquitySnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [evalMessage, setEvalMessage] = useState<string | null>(null);
  const supabase = createClient();

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0] || MOCK_ACCOUNT;

  async function loadData() {
    setLoading(true);
    try {
      const { data: accs } = await supabase
        .from('trading_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (accs && accs.length > 0) {
        const typedAccs = accs as TradingAccount[];
        setAccounts(typedAccs);
        if (!typedAccs.find((a) => a.id === selectedAccountId)) {
          setSelectedAccountId(typedAccs[0].id);
        }
      }

      const accId = selectedAccountId || (accs as any)?.[0]?.id || MOCK_ACCOUNT.id;

      const { data: trs } = await supabase
        .from('trades')
        .select('*')
        .eq('account_id', accId)
        .order('closed_at', { ascending: false });
      if (trs) setTrades(trs);

      const { data: snaps } = await supabase
        .from('equity_snapshots')
        .select('*')
        .eq('account_id', accId)
        .order('snapshot_at', { ascending: true });
      if (snaps) setSnapshots(snaps);
    } catch (err) {
      console.warn('Dashboard fetch note:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [selectedAccountId]);

  async function triggerRiskEvaluation() {
    setEvaluating(true);
    setEvalMessage(null);
    try {
      const res = await fetch('/api/risk/evaluate', { method: 'POST' });
      const data = await res.json();
      setEvalMessage(`Risk evaluation completed: ${data.evaluatedCount || 0} active accounts verified.`);
      loadData();
    } catch (err: any) {
      setEvalMessage('Risk evaluation trigger failed.');
    } finally {
      setEvaluating(false);
    }
  }

  return (
    <div className="flex-1 py-8 px-4 container mx-auto max-w-7xl space-y-6">
      {/* Top Banner & Account Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Trader Dashboard</h1>
            <Badge
              variant={
                selectedAccount.status === 'funded'
                  ? 'funded'
                  : selectedAccount.status === 'breached'
                  ? 'breached'
                  : selectedAccount.status === 'phase2'
                  ? 'phase2'
                  : 'phase1'
              }
              className="uppercase text-xs"
            >
              {selectedAccount.status.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            Account: <strong className="text-white font-mono">{selectedAccount.account_number}</strong> | Initial Allocation: <strong className="text-white font-mono">${Number(selectedAccount.initial_balance).toLocaleString()}</strong>
          </p>
        </div>

        {/* Account controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Account switcher */}
          <select
            value={selectedAccount.id}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-white rounded-md px-3 py-1.5 text-xs font-mono font-bold focus:outline-none"
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.account_number} (${Number(acc.initial_balance).toLocaleString()})
              </option>
            ))}
          </select>

          <Button
            size="sm"
            variant="outline"
            onClick={triggerRiskEvaluation}
            disabled={evaluating}
            className="border-slate-700 text-xs text-slate-300 hover:text-white"
            title="Run Risk Engine check on demand"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${evaluating ? 'animate-spin' : ''}`} />
            Evaluate Risk
          </Button>

          <Link href={`/terminal`}>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-xs">
              <LineChart className="h-3.5 w-3.5 mr-1.5" />
              Open Terminal
            </Button>
          </Link>

          {selectedAccount.status === 'funded' && (
            <Link href="/payouts">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-xs">
                <DollarSign className="h-3.5 w-3.5 mr-1" />
                Request Payout
              </Button>
            </Link>
          )}

          <Link href="/pricing">
            <Button size="sm" variant="outline" className="border-slate-700 text-xs text-slate-300">
              <PlusCircle className="h-3.5 w-3.5 mr-1" />
              New Challenge
            </Button>
          </Link>
        </div>
      </div>

      {evalMessage && (
        <div className="p-3 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs flex items-center justify-between">
          <span>{evalMessage}</span>
          <button onClick={() => setEvalMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Performance Analytics Grid */}
      <MetricsGrid trades={trades} />

      {/* Rules Progress & Risk Parameters */}
      <RulesProgress account={selectedAccount} />

      {/* Equity Curve & Performance Visualization */}
      <EquityCurve
        snapshots={snapshots}
        initialBalance={Number(selectedAccount.initial_balance)}
      />

      {/* Trading Journal */}
      <TradingJournal trades={trades} onRefresh={loadData} />
    </div>
  );
}
