'use client';

import React, { useEffect, useRef, useState } from 'react';
import { 
  createChart, 
  IChartApi, 
  ISeriesApi, 
  CandlestickData as TVCandle, 
  LineData, 
  HistogramData, 
  ColorType 
} from 'lightweight-charts';
import { fetchHistoricalKlines } from '@/lib/binance/rest';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  Maximize2, 
  Minimize2, 
  TrendingUp, 
  BarChart2, 
  Activity, 
  Layers, 
  RotateCcw,
  CandlestickChart,
  LineChart as LineChartIcon
} from 'lucide-react';

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

function calculateEMA(data: { time: any; close: number }[], period: number): LineData[] {
  const k = 2 / (period + 1);
  const emaData: LineData[] = [];
  let prevEMA = 0;

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) continue;
    if (i === period - 1) {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[j].close;
      }
      prevEMA = sum / period;
      emaData.push({ time: data[i].time, value: prevEMA });
    } else {
      const currentEMA = data[i].close * k + prevEMA * (1 - k);
      emaData.push({ time: data[i].time, value: currentEMA });
      prevEMA = currentEMA;
    }
  }
  return emaData;
}

export function TradingChart({ symbol, onPriceUpdate }: ChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartWrapperRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<'Area'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const ema20SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema50SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema200SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const [interval, setInterval] = useState('15m');
  const [chartType, setChartType] = useState<'candles' | 'line'>('candles');
  const [showVolume, setShowVolume] = useState(true);
  const [showEma20, setShowEma20] = useState(true);
  const [showEma50, setShowEma50] = useState(true);
  const [showEma200, setShowEma200] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastPrice, setLastPrice] = useState<number | null>(null);
  const [change24h, setChange24h] = useState<number>(0);
  const [high24h, setHigh24h] = useState<number | null>(null);
  const [low24h, setLow24h] = useState<number | null>(null);
  const [hoverOhlc, setHoverOhlc] = useState<{ open: number; high: number; low: number; close: number } | null>(null);

  const rawKlinesRef = useRef<any[]>([]);

  // 1. Initialize TradingView Lightweight Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight || 450,
      layout: {
        background: { type: ColorType.Solid, color: '#090d16' },
        textColor: '#94a3b8',
        fontSize: 11,
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      grid: {
        vertLines: { color: '#131b2c', style: 1 },
        horzLines: { color: '#131b2c', style: 1 },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#38bdf8',
          width: 1,
          style: 3,
          labelBackgroundColor: '#0f172a',
        },
        horzLine: {
          color: '#38bdf8',
          width: 1,
          style: 3,
          labelBackgroundColor: '#0f172a',
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
        scaleMargins: {
          top: 0.1,
          bottom: 0.2, // space for volume
        },
      },
    });

    // Candlestick Series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    // Area / Line Series (for Line mode)
    const lineSeries = chart.addAreaSeries({
      topColor: 'rgba(16, 185, 129, 0.28)',
      bottomColor: 'rgba(16, 185, 129, 0.02)',
      lineColor: '#10b981',
      lineWidth: 2,
      visible: false,
    });

    // Volume Histogram Series
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });

    chart.priceScale('volume').applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    // Indicator Lines: EMA 20 (Cyan), EMA 50 (Gold), EMA 200 (Purple)
    const ema20Series = chart.addLineSeries({
      color: '#06b6d4',
      lineWidth: 2,
      title: 'EMA 20',
      priceLineVisible: false,
    });

    const ema50Series = chart.addLineSeries({
      color: '#f59e0b',
      lineWidth: 2,
      title: 'EMA 50',
      priceLineVisible: false,
    });

    const ema200Series = chart.addLineSeries({
      color: '#a855f7',
      lineWidth: 2,
      title: 'EMA 200',
      priceLineVisible: false,
      visible: false,
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    lineSeriesRef.current = lineSeries;
    volumeSeriesRef.current = volumeSeries;
    ema20SeriesRef.current = ema20Series;
    ema50SeriesRef.current = ema50Series;
    ema200SeriesRef.current = ema200Series;

    // Crosshair move handler for OHLC legend
    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !param.seriesData) {
        setHoverOhlc(null);
        return;
      }
      const data = param.seriesData.get(candleSeries) as TVCandle;
      if (data && data.open !== undefined) {
        setHoverOhlc({
          open: data.open,
          high: data.high,
          low: data.low,
          close: data.close,
        });
      }
    });

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
        if (!isCancelled && chartRef.current && klines.length > 0) {
          rawKlinesRef.current = klines;

          // Set candle data
          candleSeriesRef.current?.setData(klines as unknown as TVCandle[]);

          // Set line data
          lineSeriesRef.current?.setData(
            klines.map((k: any) => ({ time: k.time, value: k.close })) as any
          );

          // Set volume data with bull/bear colors
          const volumeData = klines.map((k: any) => ({
            time: k.time,
            value: k.volume,
            color: k.close >= k.open ? 'rgba(16, 185, 129, 0.45)' : 'rgba(239, 68, 68, 0.45)',
          }));
          volumeSeriesRef.current?.setData(volumeData as any);

          // Calculate and set EMAs
          const ema20 = calculateEMA(klines, 20);
          const ema50 = calculateEMA(klines, 50);
          const ema200 = calculateEMA(klines, 200);

          ema20SeriesRef.current?.setData(ema20 as any);
          ema50SeriesRef.current?.setData(ema50 as any);
          ema200SeriesRef.current?.setData(ema200 as any);

          chartRef.current.timeScale().fitContent();

          const latest = klines[klines.length - 1];
          setLastPrice(latest.close);
          onPriceUpdate?.(latest.close);

          // Calculate 24h range from klines
          const last24 = klines.slice(-Math.min(96, klines.length));
          if (last24.length > 0) {
            const high = Math.max(...last24.map((k: any) => k.high));
            const low = Math.min(...last24.map((k: any) => k.low));
            const first = last24[0].open;
            setHigh24h(high);
            setLow24h(low);
            setChange24h(((latest.close - first) / first) * 100);
          }
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

  // 3. Connect Live Browser-to-Binance WebSocket
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
        if (message.e === 'kline') {
          const k = message.k;
          const currentClose = parseFloat(k.c);
          const openPrice = parseFloat(k.o);
          const candle: TVCandle = {
            time: Math.floor(k.t / 1000) as any,
            open: openPrice,
            high: parseFloat(k.h),
            low: parseFloat(k.l),
            close: currentClose,
          };

          candleSeriesRef.current?.update(candle);
          lineSeriesRef.current?.update({ time: candle.time, value: currentClose });

          volumeSeriesRef.current?.update({
            time: candle.time,
            value: parseFloat(k.v),
            color: currentClose >= openPrice ? 'rgba(16, 185, 129, 0.45)' : 'rgba(239, 68, 68, 0.45)',
          });

          setLastPrice(currentClose);
          onPriceUpdate?.(currentClose);
        }
      } catch (e) {
        // ignore websocket parse error
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [symbol, interval]);

  // Toggle chart type (Candlestick vs Line)
  function toggleChartType(type: 'candles' | 'line') {
    setChartType(type);
    if (candleSeriesRef.current && lineSeriesRef.current) {
      candleSeriesRef.current.applyOptions({ visible: type === 'candles' });
      lineSeriesRef.current.applyOptions({ visible: type === 'line' });
    }
  }

  // Toggle indicators
  function toggleIndicator(indicator: 'vol' | 'ema20' | 'ema50' | 'ema200') {
    if (indicator === 'vol') {
      const next = !showVolume;
      setShowVolume(next);
      volumeSeriesRef.current?.applyOptions({ visible: next });
    } else if (indicator === 'ema20') {
      const next = !showEma20;
      setShowEma20(next);
      ema20SeriesRef.current?.applyOptions({ visible: next });
    } else if (indicator === 'ema50') {
      const next = !showEma50;
      setShowEma50(next);
      ema50SeriesRef.current?.applyOptions({ visible: next });
    } else if (indicator === 'ema200') {
      const next = !showEma200;
      setShowEma200(next);
      ema200SeriesRef.current?.applyOptions({ visible: next });
    }
  }

  function handleResetZoom() {
    chartRef.current?.timeScale().fitContent();
  }

  function toggleFullscreen() {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    }, 50);
  }

  const isUp = change24h >= 0;

  return (
    <div 
      ref={chartWrapperRef}
      className={`flex flex-col bg-[#090d16] border border-slate-800 rounded-lg overflow-hidden transition-all duration-200 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-full'
      }`}
    >
      {/* Top TradingView Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-slate-950/90 border-b border-slate-800 text-xs gap-2 select-none">
        {/* Left: Symbol & Stats */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-white text-sm font-mono tracking-wider">{symbol}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800/80 text-slate-300 font-mono">
              BINANCE
            </span>
          </div>

          {lastPrice !== null && (
            <div className="flex items-baseline space-x-2">
              <span className={`font-mono font-bold text-sm ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                ${lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`text-[11px] font-mono font-medium ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isUp ? '+' : ''}{change24h.toFixed(2)}%
              </span>
            </div>
          )}

          {/* 24h High/Low Stats */}
          {high24h && low24h && (
            <div className="hidden xl:flex items-center space-x-3 text-[10px] text-slate-400 font-mono pl-2 border-l border-slate-800">
              <div>24h High: <strong className="text-slate-200">${high24h.toFixed(2)}</strong></div>
              <div>24h Low: <strong className="text-slate-200">${low24h.toFixed(2)}</strong></div>
            </div>
          )}
        </div>

        {/* Right: TradingView Tools & Indicators */}
        <div className="flex items-center space-x-1.5">
          {/* Chart Style Toggle (Candles vs Line) */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-0.5">
            <button
              onClick={() => toggleChartType('candles')}
              title="Candlestick Chart"
              className={`p-1 rounded transition ${chartType === 'candles' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'}`}
            >
              <CandlestickChart className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => toggleChartType('line')}
              title="Line / Area Chart"
              className={`p-1 rounded transition ${chartType === 'line' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'}`}
            >
              <LineChartIcon className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center space-x-0.5 bg-slate-900 border border-slate-800 rounded p-0.5">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setInterval(tf.value)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                  interval === tf.value
                    ? 'bg-emerald-600 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Technical Indicator Toggles */}
          <div className="flex items-center space-x-1 pl-1 border-l border-slate-800">
            <button
              onClick={() => toggleIndicator('ema20')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono border transition ${
                showEma20 ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400 font-bold' : 'border-slate-800 text-slate-500'
              }`}
            >
              EMA 20
            </button>
            <button
              onClick={() => toggleIndicator('ema50')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono border transition ${
                showEma50 ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 font-bold' : 'border-slate-800 text-slate-500'
              }`}
            >
              EMA 50
            </button>
            <button
              onClick={() => toggleIndicator('ema200')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono border transition ${
                showEma200 ? 'bg-purple-500/10 border-purple-500/40 text-purple-400 font-bold' : 'border-slate-800 text-slate-500'
              }`}
            >
              EMA 200
            </button>
            <button
              onClick={() => toggleIndicator('vol')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono border transition ${
                showVolume ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-bold' : 'border-slate-800 text-slate-500'
              }`}
            >
              VOL
            </button>
          </div>

          {/* Fit & Fullscreen Actions */}
          <div className="flex items-center space-x-1 pl-1 border-l border-slate-800">
            <button
              onClick={handleResetZoom}
              title="Reset Zoom / Fit Content"
              className="p-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              className="p-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* OHLC Bar Legend Overlay */}
      <div className="flex items-center space-x-4 px-3 py-1 bg-slate-950/60 border-b border-slate-800/40 text-[10px] font-mono text-slate-400">
        {hoverOhlc ? (
          <>
            <div>O: <span className="text-white">${hoverOhlc.open.toFixed(2)}</span></div>
            <div>H: <span className="text-white">${hoverOhlc.high.toFixed(2)}</span></div>
            <div>L: <span className="text-white">${hoverOhlc.low.toFixed(2)}</span></div>
            <div>C: <span className="text-white">${hoverOhlc.close.toFixed(2)}</span></div>
          </>
        ) : (
          <div className="text-slate-500">Hover over candles to view precise OHLC coordinates</div>
        )}

        <div className="ml-auto hidden sm:flex items-center space-x-3 text-[10px]">
          {showEma20 && <div className="text-cyan-400">● EMA(20)</div>}
          {showEma50 && <div className="text-amber-400">● EMA(50)</div>}
          {showEma200 && <div className="text-purple-400">● EMA(200)</div>}
          {showVolume && <div className="text-emerald-400">● Vol</div>}
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative flex-1 min-h-[360px] w-full">
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#090d16]/80 backdrop-blur-xs">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500 mr-2" />
            <span className="text-xs text-slate-300">Connecting TradingView WebSocket Stream...</span>
          </div>
        )}
        <div ref={chartContainerRef} className="absolute inset-0 w-full h-full" />
      </div>
    </div>
  );
}
