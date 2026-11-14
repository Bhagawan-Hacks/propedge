'use client';

import React, { useState } from 'react';
import { ArrowDown, ArrowUp, ShieldCheck, CheckCircle2, AlertCircle, Loader2, DollarSign, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
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
  const notionalValue = size * execPrice;

  // Preset lot buttons
  const LOT_PRESETS = [0.05, 0.1, 0.25, 0.5, 1.0, 2.0];

  function applyRiskPreset(pct: number) {
    if (!account) return;
    const riskDollar = (Number(account.current_equity) * pct) / 100;
    // Calculate size so margin or notional is appropriate
    const calculatedSize = Math.max(0.01, parseFloat(((riskDollar * leverage) / execPrice).toFixed(2)));
    setSize(calculatedSize);
  }

  async function handleExecuteOrder(targetSide: 'BUY' | 'SELL') {
    if (!account) {
      setFeedback({ type: 'error', message: 'No active trading account selected.' });
      return;
    }

    if (size <= 0) {
      setFeedback({ type: 'error', message: 'Order size must be greater than zero.' });
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
          clientPrice: currentPrice, // send actual live price from browser WebSocket
          stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
          takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || data.error || 'Order execution failed.');
      }

      const filledPrice = data.executedPrice || execPrice;
      setFeedback({
        type: 'success',
        message: `${targetSide} ${size} ${symbol} filled @ $${filledPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      });
      onOrderExecuted?.();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Execution error.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0e17] border border-slate-800 rounded-lg p-3.5 space-y-3.5 text-xs text-slate-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white text-xs tracking-wider">ORDER EXECUTION</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-emerald-400 font-mono font-semibold">
            LIVE
          </span>
        </div>
        <span className="font-mono text-slate-400 text-xs font-semibold">{symbol}</span>
      </div>

      {feedback && (
        <div
          className={`p-2.5 rounded-lg text-xs flex items-start space-x-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          )}
          <span className="leading-tight">{feedback.message}</span>
        </div>
      )}

      {/* Order Type Toggle */}
      <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
        <button
          onClick={() => setOrderType('MARKET')}
          className={`py-1 text-xs font-semibold rounded transition ${
            orderType === 'MARKET' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Market
        </button>
        <button
          onClick={() => setOrderType('LIMIT')}
          className={`py-1 text-xs font-semibold rounded transition ${
            orderType === 'LIMIT' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Limit
        </button>
      </div>

      {/* Limit Price Input if LIMIT */}
      {orderType === 'LIMIT' && (
        <div className="space-y-1">
          <label className="text-[11px] text-slate-400">Limit Execution Price ($)</label>
          <Input
            type="number"
            step="0.01"
            placeholder={currentPrice.toFixed(2)}
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            className="bg-slate-950 border-slate-800 text-white font-mono text-xs"
          />
        </div>
      )}

      {/* Order Size & Preset Lots */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-slate-400">Position Volume (Lots)</span>
          <span className="text-slate-400 font-mono">Notional: ${notionalValue.toFixed(2)}</span>
        </div>
        <Input
          type="number"
          step="0.01"
          min="0.01"
          value={size}
          onChange={(e) => setSize(Math.max(0.01, parseFloat(e.target.value) || 0))}
          className="bg-slate-950 border-slate-800 text-white font-mono text-sm font-semibold"
        />

        {/* Quick Lot Presets */}
        <div className="grid grid-cols-6 gap-1 pt-0.5">
          {LOT_PRESETS.map((lot) => (
            <button
              key={lot}
              type="button"
              onClick={() => setSize(lot)}
              className={`py-0.5 text-[10px] font-mono rounded border transition ${
                size === lot
                  ? 'bg-slate-800 border-slate-600 text-emerald-400 font-bold'
                  : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:bg-slate-900'
              }`}
            >
              {lot}
            </button>
          ))}
        </div>
      </div>

      {/* Risk Presets */}
      <div className="space-y-1">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Account Risk Calc</span>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => applyRiskPreset(1)}
            className="py-1 px-2 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-[11px] text-slate-300 font-mono transition"
          >
            1% Equity
          </button>
          <button
            type="button"
            onClick={() => applyRiskPreset(2)}
            className="py-1 px-2 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-[11px] text-slate-300 font-mono transition"
          >
            2% Equity
          </button>
          <button
            type="button"
            onClick={() => applyRiskPreset(5)}
            className="py-1 px-2 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-[11px] text-amber-400 font-mono transition"
          >
            5% Daily Max
          </button>
        </div>
      </div>

      {/* Leverage Slider */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-slate-400">Leverage (Max 1:20)</span>
          <span className="font-mono font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
            {leverage}x
          </span>
        </div>
        <Slider
          value={[leverage]}
          onValueChange={(val) => setLeverage(val[0])}
          min={1}
          max={MAX_PROP_LEVERAGE}
          step={1}
          className="cursor-pointer"
        />
      </div>

      {/* Stop Loss & Take Profit */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <div className="space-y-1">
          <label className="text-[11px] text-rose-400 font-medium">Stop Loss ($)</label>
          <Input
            type="number"
            step="0.01"
            placeholder="Optional SL"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            className="bg-slate-950 border-slate-800 text-xs font-mono text-white"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] text-emerald-400 font-medium">Take Profit ($)</label>
          <Input
            type="number"
            step="0.01"
            placeholder="Optional TP"
            value={takeProfit}
            onChange={(e) => setTakeProfit(e.target.value)}
            className="bg-slate-950 border-slate-800 text-xs font-mono text-white"
          />
        </div>
      </div>

      {/* Margin Requirement Summary */}
      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1.5 text-[11px]">
        <div className="flex justify-between text-slate-400">
          <span>Required Margin:</span>
          <span className="font-mono font-bold text-white">${marginCalc.requiredMargin.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Available Margin:</span>
          <span className={`font-mono font-bold ${isMarginSufficient ? 'text-slate-300' : 'text-rose-400'}`}>
            ${freeMargin.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Action Execution Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <Button
          onClick={() => handleExecuteOrder('SELL')}
          disabled={loading || !isMarginSufficient}
          className="bg-rose-600 hover:bg-rose-500 text-white font-bold h-12 flex flex-col items-center justify-center py-1 transition shadow-lg shadow-rose-600/10"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <div className="flex items-center gap-1 text-xs">
                <ArrowDown className="h-3.5 w-3.5" /> SELL / SHORT
              </div>
              <span className="font-mono text-[10px] text-rose-100 font-normal">
                ${(currentPrice * 0.9999).toFixed(2)}
              </span>
            </>
          )}
        </Button>

        <Button
          onClick={() => handleExecuteOrder('BUY')}
          disabled={loading || !isMarginSufficient}
          className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold h-12 flex flex-col items-center justify-center py-1 transition shadow-lg shadow-emerald-600/10"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <div className="flex items-center gap-1 text-xs">
                <ArrowUp className="h-3.5 w-3.5" /> BUY / LONG
              </div>
              <span className="font-mono text-[10px] text-slate-900 font-semibold">
                ${(currentPrice * 1.0001).toFixed(2)}
              </span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
