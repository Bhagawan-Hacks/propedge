'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { TradingAccount, Position, Trade, Order } from '@/types';
import { TradingChart } from '@/components/terminal/chart';
import { Watchlist } from '@/components/terminal/watchlist';
import { OrderPanel } from '@/components/terminal/order-panel';
import { PositionsTable } from '@/components/terminal/positions-table';
import { AccountSummaryBar } from '@/components/terminal/account-summary-bar';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2, CreditCard } from 'lucide-react';
import { calculatePnL } from '@/lib/engine/pnl';

// Default mock account if user runs locally without Supabase account yet
const DEMO_ACCOUNT: TradingAccount = {
  id: '00000000-0000-0000-0000-000000000001',
  user_id: '00000000-0000-0000-0000-000000000001',
  plan_id: '11111111-1111-1111-1111-111111111111',
  account_number: 'PE-DEMO-1001',
  status: 'phase1',
  initial_balance: 10000,
  current_balance: 10000,
  current_equity: 10000,
  margin_used: 0,
  free_margin: 10000,
  high_water_mark: 10000,
  day_start_equity: 10000,
  current_trading_day: new Date().toISOString().split('T')[0],
  trading_days_count: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export default function TerminalPage() {
  const router = useRouter();
  const supabase = createClient();

  const [accounts, setAccounts] = useState<TradingAccount[]>([DEMO_ACCOUNT]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(DEMO_ACCOUNT.id);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTCUSDT');
  const [livePrices, setLivePrices] = useState<Record<string, number>>({
    BTCUSDT: 65175.0,
    ETHUSDT: 1822.4,
    SOLUSDT: 72.8,
    BNBUSDT: 589.8,
    XRPUSDT: 0.9612,
    DOGEUSDT: 0.0602,
  });

  const [positions, setPositions] = useState<Position[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const activeAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0] || DEMO_ACCOUNT;

  // Load account data
  const loadAccountData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Fetch user accounts
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

      const accId = selectedAccountId || (accs as any)?.[0]?.id || DEMO_ACCOUNT.id;

      // Fetch positions
      const { data: pos } = await supabase
        .from('positions')
        .select('*')
        .eq('account_id', accId)
        .order('opened_at', { ascending: false });

      if (pos) setPositions(pos);

      // Fetch trades
      const { data: trs } = await supabase
        .from('trades')
        .select('*')
        .eq('account_id', accId)
        .order('closed_at', { ascending: false })
        .limit(50);

      if (trs) setTrades(trs);

      // Fetch orders
      const { data: ords } = await supabase
        .from('orders')
        .select('*')
        .eq('account_id', accId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (ords) setOrders(ords);
    } catch (err) {
      console.warn('Terminal data fetch note:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedAccountId]);

  useEffect(() => {
    loadAccountData();

    // Supabase Realtime channel subscription
    const channel = supabase
      .channel('terminal-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'positions' },
        () => loadAccountData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trades' },
        () => loadAccountData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trading_accounts' },
        () => loadAccountData()
      )
      .subscribe();

    // Background tick evaluator loop (checks SL/TP every 5 seconds)
    const tickInterval = setInterval(() => {
      fetch('/api/trades/tick-eval', { method: 'POST' }).catch(() => {});
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(tickInterval);
    };
  }, [loadAccountData]);

  // Price update callback from Watchlist or Chart
  const handlePriceUpdate = (symbol: string, bid: number, ask: number) => {
    const mid = (bid + ask) / 2;
    setLivePrices((prev) => ({ ...prev, [symbol]: mid }));
  };

  // Calculate total unrealized P&L
  const totalUnrealizedPnl = positions.reduce((acc, pos) => {
    const currentPrice = livePrices[pos.symbol] || Number(pos.current_price) || Number(pos.entry_price);
    const pnl = calculatePnL(pos.side, Number(pos.size), Number(pos.entry_price), currentPrice, false);
    return acc + pnl.grossPnl;
  }, 0);

  return (
    <div className="flex-1 flex flex-col p-2 gap-2 bg-[#060910] overflow-hidden min-h-[calc(100vh-80px)]">
      {/* Top Account Metrics Toolbar */}
      <AccountSummaryBar
        account={activeAccount}
        accounts={accounts}
        onSelectAccount={(id) => setSelectedAccountId(id)}
        unrealizedPnlTotal={totalUnrealizedPnl}
      />

      {/* Main Terminal Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2 min-h-0">
        {/* Left: Watchlist (2 cols) */}
        <div className="lg:col-span-3 xl:col-span-2 hidden md:flex flex-col h-[480px] lg:h-full">
          <Watchlist
            selectedSymbol={selectedSymbol}
            onSelectSymbol={(s) => setSelectedSymbol(s)}
            onPriceUpdate={handlePriceUpdate}
          />
        </div>

        {/* Center: Chart + Positions (7 cols) */}
        <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-2 min-h-0">
          {/* Top: Candlestick Chart */}
          <div className="h-[440px] xl:h-[480px]">
            <TradingChart
              symbol={selectedSymbol}
              onPriceUpdate={(p) => setLivePrices((prev) => ({ ...prev, [selectedSymbol]: p }))}
            />
          </div>

          {/* Bottom: Positions / Orders / History Tables */}
          <div className="flex-1 min-h-[220px]">
            <PositionsTable
              positions={positions}
              trades={trades}
              orders={orders}
              livePrices={livePrices}
              onRefresh={loadAccountData}
            />
          </div>
        </div>

        {/* Right: Order Entry Panel (3 cols) */}
        <div className="lg:col-span-3 xl:col-span-3 flex flex-col">
          <OrderPanel
            symbol={selectedSymbol}
            currentPrice={livePrices[selectedSymbol] || 65175.0}
            account={activeAccount}
            onOrderExecuted={loadAccountData}
          />
        </div>
      </div>
    </div>
  );
}
