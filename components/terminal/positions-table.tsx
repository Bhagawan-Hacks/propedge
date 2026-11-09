'use client';

import React, { useState } from 'react';
import { 
  X, 
  Edit3, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Position, Trade, Order } from '@/types';
import { calculatePnL } from '@/lib/engine/pnl';

interface PositionsTableProps {
  positions: Position[];
  trades: Trade[];
  orders: Order[];
  livePrices?: Record<string, number>;
  onRefresh?: () => void;
}

export function PositionsTable({ positions, trades, orders, livePrices = {}, onRefresh }: PositionsTableProps) {
  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'history'>('positions');
  const [closingId, setClosingId] = useState<string | null>(null);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [modifyingSl, setModifyingSl] = useState('');
  const [modifyingTp, setModifyingTp] = useState('');
  const [journalTrade, setJournalTrade] = useState<Trade | null>(null);
  const [journalNote, setJournalNote] = useState('');
  const [loading, setLoading] = useState(false);

  // Close position handler
  async function handleClosePosition(positionId: string) {
    setClosingId(positionId);
    try {
      const res = await fetch('/api/trades/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positionId, reason: 'MANUAL' }),
      });
      if (!res.ok) throw new Error('Close failed');
      onRefresh?.();
    } catch (err) {
      console.error(err);
    } finally {
      setClosingId(null);
    }
  }

  // Modify SL/TP handler
  async function handleSaveModify() {
    if (!editingPosition) return;
    setLoading(true);
    try {
      const res = await fetch('/api/trades/modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          positionId: editingPosition.id,
          stopLoss: modifyingSl ? parseFloat(modifyingSl) : null,
          takeProfit: modifyingTp ? parseFloat(modifyingTp) : null,
        }),
      });
      if (!res.ok) throw new Error('Modify failed');
      setEditingPosition(null);
      onRefresh?.();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Save trading journal note
  async function handleSaveJournal() {
    if (!journalTrade) return;
    setLoading(true);
    try {
      const res = await fetch('/api/trades/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tradeId: journalTrade.id,
          notes: journalNote,
        }),
      });
      setJournalTrade(null);
      onRefresh?.();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#090e17] border border-slate-800 rounded-lg overflow-hidden text-xs">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/80 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('positions')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              activeTab === 'positions'
                ? 'bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Open Positions ({positions.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              activeTab === 'orders'
                ? 'bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending Orders ({orders.filter(o => o.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Trade History ({trades.length})
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'positions' && (
          positions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500 space-y-1">
              <TrendingUp className="h-8 w-8 text-slate-600" />
              <p>No active open positions</p>
              <span className="text-[11px] text-slate-600">Execute an order using the right panel.</span>
            </div>
          ) : (
            <table className="w-full text-left font-mono border-collapse">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                  <th className="p-2.5">Symbol</th>
                  <th className="p-2.5">Side</th>
                  <th className="p-2.5">Size</th>
                  <th className="p-2.5">Entry Price</th>
                  <th className="p-2.5">Mark Price</th>
                  <th className="p-2.5">Margin</th>
                  <th className="p-2.5">SL / TP</th>
                  <th className="p-2.5 text-right">Floating P&L</th>
                  <th className="p-2.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {positions.map((pos) => {
                  const currentPrice = livePrices[pos.symbol] || Number(pos.current_price) || Number(pos.entry_price);
                  const pnl = calculatePnL(pos.side, Number(pos.size), Number(pos.entry_price), currentPrice, false);
                  const isProfit = pnl.grossPnl >= 0;

                  return (
                    <tr key={pos.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-2.5 font-bold text-white">{pos.symbol}</td>
                      <td className="p-2.5">
                        <Badge
                          variant={pos.side === 'BUY' ? 'success' : 'destructive'}
                          className="text-[10px] px-1.5 py-0 uppercase"
                        >
                          {pos.side} {pos.leverage}x
                        </Badge>
                      </td>
                      <td className="p-2.5 text-slate-200">{Number(pos.size).toFixed(2)}</td>
                      <td className="p-2.5 text-slate-300">${Number(pos.entry_price).toFixed(2)}</td>
                      <td className="p-2.5 text-slate-300 font-bold">${currentPrice.toFixed(2)}</td>
                      <td className="p-2.5 text-slate-400">${Number(pos.margin).toFixed(2)}</td>
                      <td className="p-2.5 text-[11px] text-slate-400">
                        {pos.stop_loss ? `$${Number(pos.stop_loss).toFixed(2)}` : '—'} /{' '}
                        {pos.take_profit ? `$${Number(pos.take_profit).toFixed(2)}` : '—'}
                      </td>
                      <td className={`p-2.5 text-right font-bold text-xs ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isProfit ? '+' : ''}${pnl.grossPnl.toFixed(2)} ({pnl.returnPct > 0 ? '+' : ''}{pnl.returnPct.toFixed(2)}%)
                      </td>
                      <td className="p-2.5 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingPosition(pos);
                              setModifyingSl(pos.stop_loss ? pos.stop_loss.toString() : '');
                              setModifyingTp(pos.take_profit ? pos.take_profit.toString() : '');
                            }}
                            className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                            title="Modify SL/TP"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleClosePosition(pos.id)}
                            disabled={closingId === pos.id}
                            className="h-6 px-2 text-[10px] bg-rose-600/80 hover:bg-rose-600"
                          >
                            {closingId === pos.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              'Close'
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        )}

        {activeTab === 'orders' && (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500 space-y-1">
            <Clock className="h-8 w-8 text-slate-600" />
            <p>No pending limit orders</p>
          </div>
        )}

        {activeTab === 'history' && (
          trades.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500 space-y-1">
              <TrendingDown className="h-8 w-8 text-slate-600" />
              <p>No closed trade history yet</p>
            </div>
          ) : (
            <table className="w-full text-left font-mono border-collapse">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                  <th className="p-2.5">Closed Time</th>
                  <th className="p-2.5">Symbol</th>
                  <th className="p-2.5">Side</th>
                  <th className="p-2.5">Size</th>
                  <th className="p-2.5">Entry</th>
                  <th className="p-2.5">Exit</th>
                  <th className="p-2.5 text-right">Realized P&L</th>
                  <th className="p-2.5">Reason</th>
                  <th className="p-2.5 text-center">Journal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {trades.map((tr) => {
                  const isProfit = Number(tr.realized_pnl) >= 0;
                  return (
                    <tr key={tr.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-2.5 text-slate-500 text-[11px]">
                        {new Date(tr.closed_at).toLocaleTimeString()}
                      </td>
                      <td className="p-2.5 font-bold text-white">{tr.symbol}</td>
                      <td className="p-2.5">
                        <Badge
                          variant={tr.side === 'BUY' ? 'success' : 'destructive'}
                          className="text-[10px] px-1.5 py-0 uppercase"
                        >
                          {tr.side}
                        </Badge>
                      </td>
                      <td className="p-2.5 text-slate-300">{Number(tr.size).toFixed(2)}</td>
                      <td className="p-2.5 text-slate-400">${Number(tr.entry_price).toFixed(2)}</td>
                      <td className="p-2.5 text-slate-300">${Number(tr.exit_price).toFixed(2)}</td>
                      <td className={`p-2.5 text-right font-bold text-xs ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isProfit ? '+' : ''}${Number(tr.realized_pnl).toFixed(2)}
                      </td>
                      <td className="p-2.5">
                        <Badge variant="outline" className="text-[9px] uppercase px-1 py-0">
                          {tr.close_reason}
                        </Badge>
                      </td>
                      <td className="p-2.5 text-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setJournalTrade(tr);
                            setJournalNote(tr.journal_notes || '');
                          }}
                          className={`h-6 w-6 p-0 ${tr.journal_notes ? 'text-blue-400' : 'text-slate-600 hover:text-slate-300'}`}
                          title="Edit trade journal"
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        )}
      </div>

      {/* Modify SL/TP Dialog */}
      {editingPosition && (
        <Dialog open={!!editingPosition} onOpenChange={() => setEditingPosition(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Modify Position ({editingPosition.symbol})</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400">Stop Loss ($)</label>
                <Input
                  type="number"
                  step="any"
                  value={modifyingSl}
                  onChange={(e) => setModifyingSl(e.target.value)}
                  placeholder="e.g. 92000"
                  className="bg-slate-950 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">Take Profit ($)</label>
                <Input
                  type="number"
                  step="any"
                  value={modifyingTp}
                  onChange={(e) => setModifyingTp(e.target.value)}
                  placeholder="e.g. 98000"
                  className="bg-slate-950 font-mono"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingPosition(null)}>Cancel</Button>
              <Button onClick={handleSaveModify} disabled={loading} className="bg-blue-600 hover:bg-blue-500">
                {loading ? 'Saving...' : 'Update Targets'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Trade Journal Dialog */}
      {journalTrade && (
        <Dialog open={!!journalTrade} onOpenChange={() => setJournalTrade(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Trade Journal Entry ({journalTrade.symbol})</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2 text-xs">
              <p className="text-slate-400">
                Document your rationale, setup quality, emotions, or reflections for this closed trade:
              </p>
              <textarea
                value={journalNote}
                onChange={(e) => setJournalNote(e.target.value)}
                rows={4}
                placeholder="e.g. Clean breakout retest on the 15m timeframe. Exited slightly early before TP..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setJournalTrade(null)}>Close</Button>
              <Button onClick={handleSaveJournal} disabled={loading} className="bg-blue-600 hover:bg-blue-500">
                {loading ? 'Saving...' : 'Save Note'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

