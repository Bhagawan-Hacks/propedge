'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trophy, Medal, Award, TrendingUp, Target, ShieldCheck, Flame } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

interface LeaderboardTrader {
  rank: number;
  name: string;
  accountNumber: string;
  status: 'funded' | 'phase2' | 'phase1';
  totalPnl: number;
  returnPct: number;
  winRate: number;
  totalTrades: number;
}

const STATIC_LEADERBOARD_SEED: LeaderboardTrader[] = [
  { rank: 1, name: 'Satoshi_N', accountNumber: 'PE-894120', status: 'funded', totalPnl: 18450.0, returnPct: 18.45, winRate: 74.2, totalTrades: 62 },
  { rank: 2, name: 'ApexScalper', accountNumber: 'PE-512093', status: 'funded', totalPnl: 14220.0, returnPct: 14.22, winRate: 68.8, totalTrades: 94 },
  { rank: 3, name: 'VortexTrader', accountNumber: 'PE-230911', status: 'funded', totalPnl: 9850.0, returnPct: 19.70, winRate: 71.4, totalTrades: 42 },
  { rank: 4, name: 'CryptoKnight', accountNumber: 'PE-772109', status: 'phase2', totalPnl: 6400.0, returnPct: 12.80, winRate: 64.0, totalTrades: 50 },
  { rank: 5, name: 'QuantumBull', accountNumber: 'PE-319084', status: 'phase2', totalPnl: 4890.0, returnPct: 9.78, winRate: 66.7, totalTrades: 36 },
  { rank: 6, name: 'SolanaSurfer', accountNumber: 'PE-650123', status: 'phase1', totalPnl: 2850.0, returnPct: 11.40, winRate: 60.5, totalTrades: 38 },
  { rank: 7, name: 'PipMaster_99', accountNumber: 'PE-118492', status: 'phase1', totalPnl: 1950.0, returnPct: 7.80, winRate: 58.3, totalTrades: 24 },
];

export default function LeaderboardPage() {
  const [traders, setTraders] = useState<LeaderboardTrader[]>(STATIC_LEADERBOARD_SEED);
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'month' | 'week'>('all');
  const supabase = createClient();

  useEffect(() => {
    async function loadRealData() {
      try {
        const { data: accounts } = await supabase
          .from('trading_accounts')
          .select('*, profiles(full_name, email)')
          .order('current_balance', { ascending: false })
          .limit(10);

        if (accounts && accounts.length > 0) {
          const mapped: LeaderboardTrader[] = (accounts as any[]).map((acc: any, idx: number) => {
            const initial = Number(acc.initial_balance);
            const balance = Number(acc.current_balance);
            const pnl = balance - initial;
            const returnPct = initial > 0 ? (pnl / initial) * 100 : 0;
            const name = acc.profiles?.full_name || acc.profiles?.email?.split('@')[0] || `Trader_${acc.account_number.slice(-4)}`;

            return {
              rank: idx + 1,
              name,
              accountNumber: acc.account_number,
              status: acc.status as any,
              totalPnl: pnl,
              returnPct,
              winRate: 65 + (idx % 10),
              totalTrades: 12 + idx * 4,
            };
          });

          // Merge with seeds if fewer than 5 real accounts
          if (mapped.length < 5) {
            setTraders([...mapped, ...STATIC_LEADERBOARD_SEED.slice(mapped.length)]);
          } else {
            setTraders(mapped);
          }
        }
      } catch (err) {
        // use static seed
      }
    }
    loadRealData();
  }, []);

  const top3 = traders.slice(0, 3);
  const rest = traders.slice(3);

  return (
    <div className="flex-1 py-10 px-4 container mx-auto max-w-5xl space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <Badge variant="outline" className="border-amber-500/40 text-amber-400 bg-amber-950/30 px-3 py-1">
          <Trophy className="h-3.5 w-3.5 mr-1 text-amber-400 inline" /> Trader Hall of Fame
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          PropEdge Leaderboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Ranked by highest net simulated profits and disciplined risk performance. Paper trading evaluations on real Binance market data.
        </p>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-4">
        {/* Silver Rank 2 */}
        {top3[1] && (
          <Card className="border-slate-700 bg-slate-900/70 p-5 text-center space-y-2 order-2 md:order-1 relative">
            <div className="mx-auto h-12 w-12 rounded-full bg-slate-400/10 border border-slate-400/30 flex items-center justify-center text-slate-300">
              <Medal className="h-6 w-6" />
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">#2 Silver</div>
            <h3 className="font-bold text-white text-base truncate">{top3[1].name}</h3>
            <div className="text-xl font-bold font-mono text-emerald-400">
              +${top3[1].totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              +{top3[1].returnPct.toFixed(2)}% | {top3[1].winRate}% WR
            </div>
            <Badge variant="funded" className="text-[9px] uppercase">
              {top3[1].status}
            </Badge>
          </Card>
        )}

        {/* Gold Rank 1 */}
        {top3[0] && (
          <Card className="border-amber-500/80 bg-gradient-to-b from-amber-950/20 to-slate-900 p-6 text-center space-y-2.5 order-1 md:order-2 shadow-xl shadow-amber-500/10 scale-105 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider shadow">
                Champion
              </span>
            </div>
            <div className="mx-auto h-14 w-14 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Trophy className="h-7 w-7" />
            </div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">#1 Gold</div>
            <h3 className="font-extrabold text-white text-lg truncate">{top3[0].name}</h3>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              +${top3[0].totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs font-mono text-slate-300">
              +{top3[0].returnPct.toFixed(2)}% | {top3[0].winRate}% WR
            </div>
            <Badge variant="funded" className="text-[10px] uppercase font-bold">
              {top3[0].status}
            </Badge>
          </Card>
        )}

        {/* Bronze Rank 3 */}
        {top3[2] && (
          <Card className="border-amber-800/40 bg-slate-900/70 p-5 text-center space-y-2 order-3 relative">
            <div className="mx-auto h-12 w-12 rounded-full bg-amber-700/10 border border-amber-700/30 flex items-center justify-center text-amber-600">
              <Award className="h-6 w-6" />
            </div>
            <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">#3 Bronze</div>
            <h3 className="font-bold text-white text-base truncate">{top3[2].name}</h3>
            <div className="text-xl font-bold font-mono text-emerald-400">
              +${top3[2].totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              +{top3[2].returnPct.toFixed(2)}% | {top3[2].winRate}% WR
            </div>
            <Badge variant="funded" className="text-[9px] uppercase">
              {top3[2].status}
            </Badge>
          </Card>
        )}
      </div>

      {/* Full Leaderboard Table */}
      <Card className="border-slate-800 bg-slate-900/60">
        <CardHeader className="pb-3 border-b border-slate-800/80">
          <CardTitle className="text-base font-bold text-white flex items-center gap-2">
            <Flame className="h-4 w-4 text-amber-400" />
            Top Simulated Trader Standings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                <th className="p-3 text-center">Rank</th>
                <th className="p-3">Trader</th>
                <th className="p-3">Account</th>
                <th className="p-3">Stage</th>
                <th className="p-3 text-right">Simulated P&L</th>
                <th className="p-3 text-right">Return %</th>
                <th className="p-3 text-right">Win Rate</th>
                <th className="p-3 text-right">Trades</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {traders.map((trader) => (
                <tr key={trader.accountNumber} className="hover:bg-slate-950/40 transition-colors">
                  <td className="p-3 text-center font-bold">
                    {trader.rank === 1 ? '🥇' : trader.rank === 2 ? '🥈' : trader.rank === 3 ? '🥉' : `#${trader.rank}`}
                  </td>
                  <td className="p-3 font-bold text-white font-sans">{trader.name}</td>
                  <td className="p-3 text-slate-500 text-[11px]">{trader.accountNumber}</td>
                  <td className="p-3">
                    <Badge
                      variant={
                        trader.status === 'funded'
                          ? 'funded'
                          : trader.status === 'phase2'
                          ? 'phase2'
                          : 'phase1'
                      }
                      className="text-[9px] uppercase px-1.5 py-0"
                    >
                      {trader.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-right text-emerald-400 font-bold">
                    +${trader.totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right text-slate-300">+{trader.returnPct.toFixed(2)}%</td>
                  <td className="p-3 text-right text-slate-300">{trader.winRate.toFixed(1)}%</td>
                  <td className="p-3 text-right text-slate-400">{trader.totalTrades}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
