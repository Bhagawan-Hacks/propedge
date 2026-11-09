'use client';

import React, { useState } from 'react';
import { ArrowDown, ArrowUp, ShieldAlert, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { calculateRequiredMargin, MAX_PROP_LEVERAGE } from '@/lib/engine/margin';
import { TradingAccount } from '@/types';

interface OrderPanelProps {
  symbol: string;
  currentPrice: number;
  account: TradingAccount | null;
  onOrderExecuted?: () => void;
}

export function OrderPanel({ symbol, currentPrice, account, onOrderExecuted }: OrderPanelProps) {
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [size, setSize] = useState<number>(0.1);
  const [leverage, setLeverage] = useState<number>(10);
  const [limitPrice, setLimitPrice] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const execPrice = orderType === 'LIMIT' && limitPrice ? parseFloat(limitPrice) : currentPrice;
  const marginCalc = calculateRequiredMargin(size, execPrice, leverage);
  const freeMargin = Number(account?.free_margin ?? 10000);
  const isMarginSufficient = freeMargin >= marginCalc.requiredMargin;

  async function handleExecuteOrder(targetSide: 'BUY' | 'SELL') {
    if (!account) {
      setFeedback({ type: 'error', message: 'No active trading account selected.' });
      return;
    }

    if (size <= 0) {
      setFeedback({ type: 'error', message: 'Size must be greater than zero.' });
      return;
    }

    if (!isMarginSufficient) {
      setFeedback({ 
        type: 'error', 
        message: `Insufficient Free Margin ($${freeMargin.toFixed(2)} available, $${marginCalc.requiredMargin.toFixed(2)} required).` 
      });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/trades/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: account.id,
          symbol,
          side: targetSide,
          type: orderType,
          size,
          leverage,
          stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
          takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || data.error || 'Order execution failed.');
      }

      setFeedback({
        type: 'success',
        message: `${targetSide} ${size} ${symbol} filled @ $${data.executedPrice?.toFixed(2) || execPrice.toFixed(2)}`,
      });
      onOrderExecuted?.();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Execution error.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#090e17] border border-slate-800 rounded-lg p-3 space-y-3.5 text-xs text-slate-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="font-bold text-white text-xs tracking-wider">ORDER EXECUTION</span>
        <span className="font-mono text-slate-400 text-[11px]">{symbol}</span>
      </div>

      {feedback && (
        <div
          className={`p-2 rounded text-xs flex items-start space-x-1.5 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Market vs Limit */}
      <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
        <button
          onClick={() => setOrderType('MARKET')}
          className={`flex-1 py-1 rounded-md text-center text-xs font-medium transition-all ${
            orderType === 'MARKET' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Market
        </button>
        <button
          onClick={() => setOrderType('LIMIT')}
          className={`flex-1 py-1 rounded-md text-center text-xs font-medium transition-all ${
            orderType === 'LIMIT' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Limit
        </button>
      </div>

      {orderType === 'LIMIT' && (
        <div className="space-y-1">
          <label className="text-[11px] text-slate-400">Limit Price ($)</label>
          <Input
            type="number"
            step="any"
            placeholder={currentPrice.toFixed(2)}
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            className="h-8 bg-slate-950 border-slate-800 text-xs font-mono"
          />
        </div>
      )}

      {/* Volume / Lot Size */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-[11px] text-slate-400">Volume (Size / Lots)</label>
          <span className="text-[10px] text-slate-500 font-mono">Notional: ${(size * execPrice).toFixed(2)}</span>
        </div>
        <Input
          type="number"
          step="0.01"
          min="0.01"
          value={size}
          onChange={(e) => setSize(parseFloat(e.target.value) || 0)}
          className="h-8 bg-slate-950 border-slate-800 text-xs font-mono font-bold text-white"
        />
        {/* Quick size buttons */}
        <div className="grid grid-cols-4 gap-1 pt-1">
          {[0.05, 0.1, 0.5, 1.0].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              className="py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[10px] font-mono text-slate-300"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Leverage Slider (1x to 20x firm limit) */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between">
          <label className="text-[11px] text-slate-400">Leverage (Max 1:20)</label>
          <span className="font-mono font-bold text-blue-400 text-xs">1:{leverage}</span>
        </div>
        <Slider
          value={[leverage]}
          onValueChange={(vals) => setLeverage(vals[0])}
          min={1}
          max={MAX_PROP_LEVERAGE}
          step={1}
          className="w-full"
        />
      </div>

      {/* Stop Loss & Take Profit */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400">Stop Loss ($)</label>
          <Input
            type="number"
            step="any"
            placeholder="Optional"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            className="h-7 bg-slate-950 border-slate-800 text-xs font-mono"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400">Take Profit ($)</label>
          <Input
            type="number"
            step="any"
            placeholder="Optional"
            value={takeProfit}
            onChange={(e) => setTakeProfit(e.target.value)}
            className="h-7 bg-slate-950 border-slate-800 text-xs font-mono"
          />
        </div>
      </div>

      {/* Margin Requirement Summary */}
      <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 space-y-1 font-mono text-[11px]">
        <div className="flex justify-between">
          <span className="text-slate-400">Required Margin:</span>
          <span className={`font-bold ${isMarginSufficient ? 'text-white' : 'text-rose-400'}`}>
            ${marginCalc.requiredMargin.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Free Margin:</span>
          <span className="text-slate-300">${freeMargin.toFixed(2)}</span>
        </div>
      </div>

      {/* BUY / SELL Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-2">
        <Button
          onClick={() => handleExecuteOrder('SELL')}
          disabled={loading || !isMarginSufficient}
          className="bg-rose-600 hover:bg-rose-500 text-white font-bold h-11 flex flex-col justify-center py-1"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span className="text-xs flex items-center">
                <ArrowDown className="h-3.5 w-3.5 mr-1" /> SELL / SHORT
              </span>
              <span className="text-[10px] font-mono opacity-90">${(execPrice * 0.9999).toFixed(2)}</span>
            </>
          )}
        </Button>

        <Button
          onClick={() => handleExecuteOrder('BUY')}
          disabled={loading || !isMarginSufficient}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 flex flex-col justify-center py-1"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span className="text-xs flex items-center">
                <ArrowUp className="h-3.5 w-3.5 mr-1" /> BUY / LONG
              </span>
              <span className="text-[10px] font-mono opacity-90">${(execPrice * 1.0001).toFixed(2)}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
