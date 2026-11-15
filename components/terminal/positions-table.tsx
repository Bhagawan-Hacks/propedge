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
    <div className="flex flex-col h-full bg-[#080c18] border border-[#1b2234] rounded-2xl overflow-hidden text-xs shadow-xl">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#0a0f1c] border-b border-[#1b2234]">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('positions')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'positions'
                ? 'bg-violet-600/20 text-violet-300 font-bold border border-violet-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Open Positions ({positions.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-violet-600/20 text-violet-300 font-bold border border-violet-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending Orders ({orders.filter(o => o.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-violet-600/20 text-violet-300 font-bold border border-violet-500/40 shadow-sm'
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
                <tr className="bg-[#0a0f1c] border-b border-[#1b2234] text-[10px] text-slate-400 uppercase tracking-wider">
                  <th className="p-3">Symbol</th>
                  <th className="p-3">Side</th>
                  <th className="p-3">Size</th>
                  <th className="p-3">Entry Price</th>
                  <th className="p-3">Mark Price</th>
                  <th className="p-3">SL / TP</th>
                  <th className="p-3 text-right">Unrealized P&L</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#131c2e]">
                {positions.map((pos) => {
                  const currentPrice = livePrices[pos.symbol] || Number(pos.current_price) || Number(pos.entry_price);
                  const pnl = calculatePnL(pos.side, Number(pos.size), Number(pos.entry_price), currentPrice, false);
                  const isProfit = pnl.grossPnl >= 0;

                  return (
                    <tr key={pos.id} className="hover:bg-[#0d1424]">
                      <td className="p-3 font-bold text-white">{pos.symbol}</td>
                      <td className="p-3">
                        <Badge variant={pos.side === 'BUY' ? 'success' : 'destructive'} className="text-[9px] px-1.5 py-0 uppercase">
                          {pos.side}
                        </Badge>
                      </td>
                      <td className="p-3 text-slate-300">{pos.size}</td>
                      <td className="p-3 text-slate-300">${Number(pos.entry_price).toFixed(2)}</td>
                      <td className="p-3 text-white font-bold">${currentPrice.toFixed(2)}</td>
                      <td className="p-3 text-[11px] text-slate-400">
                        {pos.stop_loss ? `SL: $${Number(pos.stop_loss).toFixed(2)}` : 'SL: -'}{' '}
                        {pos.take_profit ? `| TP: $${Number(pos.take_profit).toFixed(2)}` : ''}
                      </td>
                      <td className={`p-3 text-right font-bold text-xs ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isProfit ? '+' : ''}${pnl.grossPnl.toFixed(2)}
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingPosition(pos);
                            setModifyingSl(pos.stop_loss ? String(pos.stop_loss) : '');
                            setModifyingTp(pos.take_profit ? String(pos.take_profit) : '');
                          }}
                          className="h-6 px-2 text-[10px] rounded-lg border-[#1b2234]"
                        >
                          <Edit3 className="h-3 w-3 mr-1" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleClosePosition(pos.id)}
                          disabled={closingId === pos.id}
                          className="h-6 px-2 text-[10px] bg-rose-600 hover:bg-rose-500 text-white rounded-lg"
                        >
                          {closingId === pos.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Close'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        )}

        {activeTab === 'orders' && (
          orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500">
              <Clock className="h-8 w-8 text-slate-600 mb-1" />
              <p>No pending limit orders</p>
            </div>
          ) : (
            <table className="w-full text-left font-mono border-collapse">
              <thead>
                <tr className="bg-[#0a0f1c] border-b border-[#1b2234] text-[10px] text-slate-400 uppercase">
                  <th className="p-3">Symbol</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Side</th>
                  <th className="p-3">Size</th>
                  <th className="p-3">Limit Price</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#131c2e]">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#0d1424]">
                    <td className="p-3 font-bold text-white">{ord.symbol}</td>
                    <td className="p-3 text-slate-400">{ord.type}</td>
                    <td className="p-3">
                      <Badge variant={ord.side === 'BUY' ? 'success' : 'destructive'} className="text-[9px] px-1.5 py-0 uppercase">
                        {ord.side}
                      </Badge>
                    </td>
                    <td className="p-3 text-slate-300">{ord.size}</td>
                    <td className="p-3 text-white font-bold">${Number(ord.requested_price).toFixed(2)}</td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-[9px] uppercase">
                        {ord.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}

        {activeTab === 'history' && (
          trades.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500">
              <FileText className="h-8 w-8 text-slate-600 mb-1" />
              <p>No closed trade history yet</p>
            </div>
          ) : (
            <table className="w-full text-left font-mono border-collapse">
              <thead>
                <tr className="bg-[#0a0f1c] border-b border-[#1b2234] text-[10px] text-slate-400 uppercase">
                  <th className="p-3">Closed Date</th>
                  <th className="p-3">Symbol</th>
                  <th className="p-3">Side</th>
                  <th className="p-3">Size</th>
                  <th className="p-3">Entry</th>
                  <th className="p-3">Exit</th>
                  <th className="p-3 text-right">Realized P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#131c2e]">
                {trades.map((tr) => {
                  const isProfit = Number(tr.realized_pnl) >= 0;
                  return (
                    <tr key={tr.id} className="hover:bg-[#0d1424]">
                      <td className="p-3 text-slate-400 text-[11px]">
                        {new Date(tr.closed_at).toLocaleDateString()} {new Date(tr.closed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-3 font-bold text-white">{tr.symbol}</td>
                      <td className="p-3">
                        <Badge variant={tr.side === 'BUY' ? 'success' : 'destructive'} className="text-[9px] px-1.5 py-0 uppercase">
                          {tr.side}
                        </Badge>
                      </td>
                      <td className="p-3 text-slate-300">{tr.size}</td>
                      <td className="p-3 text-slate-400">${Number(tr.entry_price).toFixed(2)}</td>
                      <td className="p-3 text-white font-bold">${Number(tr.exit_price).toFixed(2)}</td>
                      <td className={`p-3 text-right font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isProfit ? '+' : ''}${Number(tr.realized_pnl).toFixed(2)}
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
          <DialogContent className="max-w-sm bg-[#0a0f1c] border border-[#1b2234] text-slate-100 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-white">
                Modify SL / TP: {editingPosition.symbol}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Stop Loss ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 64000"
                  value={modifyingSl}
                  onChange={(e) => setModifyingSl(e.target.value)}
                  className="bg-[#06080f] font-mono text-xs rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Take Profit ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 70000"
                  value={modifyingTp}
                  onChange={(e) => setModifyingTp(e.target.value)}
                  className="bg-[#06080f] font-mono text-xs rounded-xl"
                />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button size="sm" variant="outline" onClick={() => setEditingPosition(null)} className="rounded-xl">
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSaveModify} 
                disabled={loading}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold"
              >
                {loading ? 'Saving...' : 'Update Levels'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
