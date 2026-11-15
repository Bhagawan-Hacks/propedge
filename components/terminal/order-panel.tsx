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
          clientPrice: currentPrice,
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
    <div className="flex flex-col h-full bg-[#080c18] border border-[#1b2234] rounded-2xl p-4 space-y-4 text-xs text-slate-300 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1b2234] pb-3">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-white text-xs tracking-wider">ORDER EXECUTION</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-400 font-mono font-bold">
            LIVE
          </span>
        </div>
        <span className="font-mono text-violet-400 text-xs font-bold">{symbol}</span>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs flex items-start space-x-2 ${
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
      <div className="grid grid-cols-2 gap-1 bg-[#06080f] p-1 rounded-xl border border-[#1b2234]">
        <button
          onClick={() => setOrderType('MARKET')}
          className={`py-1.5 text-xs font-bold rounded-lg transition ${
            orderType === 'MARKET' ? 'bg-[#151c2e] text-white shadow-sm border border-[#232f48]' : 'text-slate-400 hover:text-white'
          }`}
        >
          Market
        </button>
        <button
          onClick={() => setOrderType('LIMIT')}
          className={`py-1.5 text-xs font-bold rounded-lg transition ${
            orderType === 'LIMIT' ? 'bg-[#151c2e] text-white shadow-sm border border-[#232f48]' : 'text-slate-400 hover:text-white'
          }`}
        >
          Limit
        </button>
      </div>

      {/* Limit Price Input if LIMIT */}
      {orderType === 'LIMIT' && (
        <div className="space-y-1">
          <label className="text-[11px] text-slate-400">Limit Price ($)</label>
          <Input
            type="number"
            step="0.01"
            placeholder={currentPrice.toFixed(2)}
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            className="bg-[#06080f] border-[#1b2234] text-white font-mono text-xs rounded-xl"
          />
        </div>
      )}

      {/* Order Size & Preset Lots */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-slate-400 font-medium">Position Volume (Lots)</span>
          <span className="text-slate-400 font-mono">Notional: ${notionalValue.toFixed(2)}</span>
        </div>
        <Input
          type="number"
          step="0.01"
          min="0.01"
          value={size}
          onChange={(e) => setSize(Math.max(0.01, parseFloat(e.target.value) || 0))}
          className="bg-[#06080f] border-[#1b2234] text-white font-mono text-sm font-semibold rounded-xl"
        />

        {/* Quick Lot Presets */}
        <div className="grid grid-cols-6 gap-1 pt-1">
          {LOT_PRESETS.map((lot) => (
            <button
              key={lot}
              type="button"
              onClick={() => setSize(lot)}
              className={`py-1 text-[10px] font-mono rounded-lg border transition ${
                size === lot
                  ? 'bg-violet-600/20 border-violet-500/50 text-violet-300 font-bold'
                  : 'bg-[#06080f] border-[#1b2234] text-slate-400 hover:bg-[#121827]'
              }`}
            >
              {lot}
            </button>
          ))}
        </div>
      </div>

      {/* Risk Presets */}
      <div className="space-y-1.5">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Account Risk Calc</span>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => applyRiskPreset(1)}
            className="py-1.5 px-2 rounded-xl bg-[#06080f] border border-[#1b2234] hover:border-violet-500/40 text-[11px] text-slate-300 font-mono transition"
          >
            1% Equity
          </button>
          <button
            type="button"
            onClick={() => applyRiskPreset(2)}
            className="py-1.5 px-2 rounded-xl bg-[#06080f] border border-[#1b2234] hover:border-violet-500/40 text-[11px] text-slate-300 font-mono transition"
          >
            2% Equity
          </button>
          <button
            type="button"
            onClick={() => applyRiskPreset(5)}
            className="py-1.5 px-2 rounded-xl bg-[#06080f] border border-[#1b2234] hover:border-amber-500/40 text-[11px] text-amber-400 font-mono transition"
          >
            5% Max
          </button>
        </div>
      </div>

      {/* Leverage Slider */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-slate-400">Leverage (Max 1:20)</span>
          <span className="font-mono font-bold text-white bg-violet-600/20 border border-violet-500/30 px-2 py-0.5 rounded-full text-[10px] text-violet-300">
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
            className="bg-[#06080f] border-[#1b2234] text-xs font-mono text-white rounded-xl"
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
            className="bg-[#06080f] border-[#1b2234] text-xs font-mono text-white rounded-xl"
          />
        </div>
      </div>

      {/* Margin Requirement Summary */}
      <div className="p-3 rounded-xl bg-[#06080f] border border-[#1b2234] space-y-1.5 text-[11px]">
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
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <Button
          onClick={() => handleExecuteOrder('SELL')}
          disabled={loading || !isMarginSufficient}
          className="rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold h-12 flex flex-col items-center justify-center py-1 transition shadow-lg shadow-rose-600/15"
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
          className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold h-12 flex flex-col items-center justify-center py-1 transition shadow-lg shadow-emerald-600/15"
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
