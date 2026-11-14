'use client';

import React, { useEffect, useState, useRef } from 'react';
import { TrendingUp, TrendingDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface WatchlistProps {
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  onPriceUpdate?: (symbol: string, bid: number, ask: number) => void;
}

interface SymbolTicker {
  symbol: string;
  displayName: string;
  bid: number;
  ask: number;
  price: number;
  change24h: number;
  high: number;
  low: number;
}

const DEFAULT_SYMBOLS: SymbolTicker[] = [
  { symbol: 'BTCUSDT', displayName: 'BTC/USDT', bid: 65175.0, ask: 65176.5, price: 65175.75, change24h: -5.03, high: 68400, low: 64800 },
  { symbol: 'ETHUSDT', displayName: 'ETH/USDT', bid: 1822.4, ask: 1822.5, price: 1822.45, change24h: -5.67, high: 1950, low: 1810 },
  { symbol: 'SOLUSDT', displayName: 'SOL/USDT', bid: 72.76, ask: 72.78, price: 72.77, change24h: -8.86, high: 80.2, low: 71.5 },
  { symbol: 'BNBUSDT', displayName: 'BNB/USDT', bid: 589.8, ask: 589.9, price: 589.85, change24h: -6.60, high: 635, low: 582 },
  { symbol: 'XRPUSDT', displayName: 'XRP/USDT', bid: 0.9612, ask: 0.9614, price: 0.9613, change24h: -5.47, high: 1.05, low: 0.94 },
  { symbol: 'DOGEUSDT', displayName: 'DOGE/USDT', bid: 0.0602, ask: 0.0603, price: 0.06025, change24h: -7.51, high: 0.066, low: 0.059 },
];

export function Watchlist({ selectedSymbol, onSelectSymbol, onPriceUpdate }: WatchlistProps) {
  const [tickers, setTickers] = useState<Record<string, SymbolTicker>>(() => {
    const init: Record<string, SymbolTicker> = {};
    DEFAULT_SYMBOLS.forEach((s) => { init[s.symbol] = s; });
    return init;
  });
  const [filter, setFilter] = useState('');
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect browser directly to Binance Combined WebSocket Tickers stream
    const streams = DEFAULT_SYMBOLS.map((s) => `${s.symbol.toLowerCase()}@ticker`).join('/');
    const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const data = payload.data;
        if (!data || !data.s) return;

        const sym = data.s;
        const bid = parseFloat(data.b);
        const ask = parseFloat(data.a);
        const price = parseFloat(data.c);
        const change24h = parseFloat(data.P);
        const high = parseFloat(data.h);
        const low = parseFloat(data.l);

        setTickers((prev) => ({
          ...prev,
          [sym]: {
            symbol: sym,
            displayName: `${sym.replace('USDT', '')}/USDT`,
            bid,
            ask,
            price,
            change24h,
            high,
            low,
          },
        }));

        onPriceUpdate?.(sym, bid, ask);
      } catch (err) {
        // ignore websocket parse error
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, []);

  const filteredSymbols = Object.values(tickers).filter((t) =>
    t.symbol.toLowerCase().includes(filter.toLowerCase()) ||
    t.displayName.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#090e17] border border-slate-800 rounded-lg overflow-hidden text-xs">
      {/* Header & Filter */}
      <div className="p-2.5 bg-slate-950/90 border-b border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-200 tracking-wide text-xs">MARKET WATCH</span>
          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            LIVE WS
          </span>
        </div>
        <div className="relative">
          <Search className="h-3.5 w-3.5 absolute left-2 top-2 text-slate-500" />
          <Input
            placeholder="Search coin..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-7 pl-7 text-xs bg-slate-900 border-slate-800"
          />
        </div>
      </div>

      {/* Symbol Table Header */}
      <div className="grid grid-cols-4 px-3 py-1.5 bg-slate-900/60 border-b border-slate-800 text-[10px] text-slate-400 font-semibold uppercase">
        <span className="col-span-1">Symbol</span>
        <span className="text-right">Bid</span>
        <span className="text-right">Ask</span>
        <span className="text-right">24h %</span>
      </div>

      {/* Symbol Rows */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
        {filteredSymbols.map((item) => {
          const isSelected = item.symbol === selectedSymbol;
          const isPositive = item.change24h >= 0;

          return (
            <div
              key={item.symbol}
              onClick={() => onSelectSymbol(item.symbol)}
              className={`grid grid-cols-4 px-3 py-2 cursor-pointer transition-colors items-center font-mono select-none ${
                isSelected
                  ? 'bg-blue-600/15 border-l-2 border-blue-500 text-white'
                  : 'hover:bg-slate-900/60 text-slate-300'
              }`}
            >
              <div className="col-span-1 flex flex-col">
                <span className="font-bold text-white text-xs">{item.displayName}</span>
                <span className="text-[9px] text-slate-500">{item.symbol}</span>
              </div>
              <span className="text-right text-rose-400 text-xs">
                {item.bid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
              </span>
              <span className="text-right text-emerald-400 text-xs">
                {item.ask.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
              </span>
              <span className={`text-right text-xs font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPositive ? '+' : ''}{item.change24h.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

