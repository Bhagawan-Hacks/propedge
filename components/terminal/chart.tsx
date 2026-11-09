'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData as TVCandle, ColorType } from 'lightweight-charts';
import { fetchHistoricalKlines } from '@/lib/binance/rest';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ChartProps {
  symbol: string;
  onPriceUpdate?: (price: number) => void;
}

const TIMEFRAMES = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: '4h', value: '4h' },
  { label: '1d', value: '1d' },
];

export function TradingChart({ symbol, onPriceUpdate }: ChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const [interval, setInterval] = useState('15m');
  const [loading, setLoading] = useState(true);
  const [lastPrice, setLastPrice] = useState<number | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // 1. Initialize Lightweight Chart with MT5 Dark Theme
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight || 450,
      layout: {
        background: { type: ColorType.Solid, color: '#090e17' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#131b2c' },
        horzLines: { color: '#131b2c' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#3b82f6',
          width: 1,
          style: 2,
        },
        horzLine: {
          color: '#3b82f6',
          width: 1,
          style: 2,
        },
      },
      timeScale: {
        borderColor: '#1e293b',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#1e293b',
        autoScale: true,
      },
    });

    const series = chart.addCandlestickSeries({
      upColor: '#10b981', // green bull
      downColor: '#ef4444', // red bear
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    // Handle responsive resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // 2. Fetch Historical Klines when symbol or interval changes
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    async function loadKlines() {
      try {
        const klines = await fetchHistoricalKlines(symbol, interval, 300);
        if (!isCancelled && seriesRef.current && klines.length > 0) {
          seriesRef.current.setData(klines as TVCandle[]);
          chartRef.current?.timeScale().fitContent();
          const latest = klines[klines.length - 1];
          setLastPrice(latest.close);
          onPriceUpdate?.(latest.close);
        }
      } catch (err) {
        console.error('Failed to load klines:', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadKlines();

    return () => {
      isCancelled = true;
    };
  }, [symbol, interval]);

  // 3. Connect Direct Browser-to-Binance WebSocket for Live Ticks
  useEffect(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const cleanSymbol = symbol.toLowerCase().replace('/', '');
    const wsUrl = `wss://stream.binance.com:9443/ws/${cleanSymbol}@kline_${interval}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.e === 'kline' && seriesRef.current) {
          const k = message.k;
          const candle: TVCandle = {
            time: Math.floor(k.t / 1000) as any,
            open: parseFloat(k.o),
            high: parseFloat(k.h),
            low: parseFloat(k.l),
            close: parseFloat(k.c),
          };
          seriesRef.current.update(candle);
          const currentClose = parseFloat(k.c);
          setLastPrice(currentClose);
          onPriceUpdate?.(currentClose);
        }
      } catch (e) {
        // ignore parse error
      }
    };

    ws.onerror = (err) => {
      console.warn('Binance WebSocket ticker warning:', err);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [symbol, interval]);

  return (
    <div className="flex flex-col h-full bg-[#090e17] border border-slate-800 rounded-lg overflow-hidden">
      {/* Chart Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950/80 border-b border-slate-800/80 text-xs">
        <div className="flex items-center space-x-3">
          <span className="font-bold text-white text-sm font-mono tracking-wide">{symbol}</span>
          {lastPrice !== null && (
            <span className="font-mono font-bold text-emerald-400 text-sm">
              ${lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          )}
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center space-x-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setInterval(tf.value)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                interval === tf.value
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative flex-1 min-h-[380px] w-full">
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#090e17]/80 backdrop-blur-xs">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
            <span className="text-xs text-slate-400">Streaming Binance Candlesticks...</span>
          </div>
        )}
        <div ref={chartContainerRef} className="absolute inset-0 w-full h-full" />
      </div>
    </div>
  );
}

