'use client';

import React, { useState } from 'react';
import { BookOpen, Search, Edit2, FileText, Check, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trade } from '@/types';

interface TradingJournalProps {
  trades: Trade[];
  onRefresh?: () => void;
}

export function TradingJournal({ trades, onRefresh }: TradingJournalProps) {
  const [filter, setFilter] = useState('');
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const filteredTrades = trades.filter((t) =>
    t.symbol.toLowerCase().includes(filter.toLowerCase()) ||
    (t.journal_notes && t.journal_notes.toLowerCase().includes(filter.toLowerCase()))
  );

  async function handleSaveNote(tradeId: string) {
    setSaving(true);
    try {
      const res = await fetch('/api/trades/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tradeId, notes: editingNotes }),
      });
      if (!res.ok) throw new Error('Save journal failed');
      setSelectedTrade(null);
      onRefresh?.();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="border-slate-800 bg-slate-900/60">
      <CardHeader className="pb-3 border-b border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-400" />
            Trading Journal & Reflection Log
          </CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-500" />
            <Input
              placeholder="Search trade or notes..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-8 pl-8 text-xs bg-slate-950 border-slate-800"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {filteredTrades.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 space-y-1">
            <FileText className="h-8 w-8 mx-auto text-slate-600 mb-1" />
            <p>No journal entries found</p>
            <p className="text-[11px] text-slate-600">Execute and close trades in the terminal to document notes.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60 font-mono text-xs max-h-80 overflow-y-auto">
            {filteredTrades.map((t) => {
              const isProfit = Number(t.realized_pnl) >= 0;
              const isEditing = selectedTrade?.id === t.id;

              return (
                <div key={t.id} className="p-3.5 hover:bg-slate-950/40 transition-colors space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-sm">{t.symbol}</span>
                      <Badge variant={t.side === 'BUY' ? 'success' : 'destructive'} className="text-[10px] px-1.5 py-0 uppercase">
                        {t.side}
                      </Badge>
                      <span className="text-[11px] text-slate-500 font-sans">
                        {new Date(t.closed_at).toLocaleDateString()} {new Date(t.closed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isProfit ? '+' : ''}${Number(t.realized_pnl).toFixed(2)}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (isEditing) {
                            setSelectedTrade(null);
                          } else {
                            setSelectedTrade(t);
                            setEditingNotes(t.journal_notes || '');
                          }
                        }}
                        className="h-7 px-2 text-slate-400 hover:text-white"
                      >
                        <Edit2 className="h-3.5 w-3.5 mr-1" />
                        {t.journal_notes ? 'Edit Note' : 'Add Note'}
                      </Button>
                    </div>
                  </div>

                  {/* Notes display */}
                  {t.journal_notes && !isEditing && (
                    <div className="bg-slate-950/80 p-2.5 rounded border border-slate-800/80 text-xs font-sans text-slate-300">
                      {t.journal_notes}
                    </div>
                  )}

                  {/* Inline Edit Form */}
                  {isEditing && (
                    <div className="space-y-2 pt-1">
                      <textarea
                        value={editingNotes}
                        onChange={(e) => setEditingNotes(e.target.value)}
                        placeholder="Write your trade execution notes, setup reasoning, psychological state, and lessons learned..."
                        rows={3}
                        className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-xs text-slate-200 font-sans focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <div className="flex justify-end space-x-2">
                        <Button size="sm" variant="outline" onClick={() => setSelectedTrade(null)}>
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSaveNote(t.id)}
                          disabled={saving}
                          className="bg-blue-600 hover:bg-blue-500"
                        >
                          <Check className="h-3.5 w-3.5 mr-1" />
                          {saving ? 'Saving...' : 'Save Reflection'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
