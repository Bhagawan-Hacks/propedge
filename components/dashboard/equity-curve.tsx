'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, TrendingUp } from 'lucide-react';
import { EquitySnapshot } from '@/types';

interface EquityCurveProps {
  snapshots: EquitySnapshot[];
  initialBalance: number;
}

export function EquityCurve({ snapshots, initialBalance }: EquityCurveProps) {
  // If snapshots are empty or few, build a clean baseline visualization
  const points = snapshots.length > 1
    ? snapshots.map((s) => ({
        equity: Number(s.equity),
        balance: Number(s.balance),
        time: new Date(s.snapshot_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }))
    : [
        { equity: initialBalance, balance: initialBalance, time: 'Start' },
        { equity: initialBalance, balance: initialBalance, time: 'Now' },
      ];

  const minVal = Math.min(...points.map((p) => Math.min(p.equity, p.balance)), initialBalance * 0.9);
  const maxVal = Math.max(...points.map((p) => Math.max(p.equity, p.balance)), initialBalance * 1.08);
  const range = maxVal - minVal || 1;

  const width = 700;
  const height = 240;
  const padding = 40;

  // Generate SVG path points
  const pathD = points
    .map((p, i) => {
      const x = padding + (i / (points.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((p.equity - minVal) / range) * (height - 2 * padding);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Baseline Y position
  const baselineY = height - padding - ((initialBalance - minVal) / range) * (height - 2 * padding);

  return (
    <Card className="border-slate-800 bg-slate-900/60">
      <CardHeader className="pb-2 border-b border-slate-800/80">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-white flex items-center gap-2">
            <LineChart className="h-5 w-5 text-blue-400" />
            Simulated Equity Curve
          </CardTitle>
          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-blue-400">
              <span className="h-2 w-2 rounded-full bg-blue-500" /> Equity
            </span>
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="h-0.5 w-3 bg-slate-600" /> Initial Floor
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="w-full h-56 relative">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            {/* Grid lines */}
            <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#1e293b" strokeDasharray="3 3" />
            <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#1e293b" strokeDasharray="3 3" />
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#1e293b" strokeDasharray="3 3" />

            {/* Initial balance baseline */}
            <line
              x1={padding}
              y1={baselineY}
              x2={width - padding}
              y2={baselineY}
              stroke="#475569"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <text x={padding + 5} y={baselineY - 5} fill="#64748b" fontSize="10" fontFamily="monospace">
              Initial: ${initialBalance.toLocaleString()}
            </text>

            {/* Gradient fill under equity curve */}
            <defs>
              <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d={`${pathD} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`}
              fill="url(#equityGrad)"
            />

            {/* Equity Line */}
            <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />

            {/* Points */}
            {points.map((p, i) => {
              const x = padding + (i / (points.length - 1)) * (width - 2 * padding);
              const y = height - padding - ((p.equity - minVal) / range) * (height - 2 * padding);
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill="#60a5fa"
                  stroke="#1e3a8a"
                  strokeWidth="1.5"
                />
              );
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}
