'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
} from 'recharts';
import type { AnalysisResult } from '@/lib/types';

interface Props {
  result: AnalysisResult;
}

const COMPLEXITY_COLORS: Record<string, string> = {
  'O(1)': '#10b981',
  'O(log n)': '#06b6d4',
  'O(n)': '#6366f1',
  'O(n log n)': '#8b5cf6',
  'O(n²)': '#f59e0b',
  'O(n³)': '#f97316',
  'O(2ⁿ)': '#ef4444',
  'O(n!)': '#dc2626',
};

const ALL_COMPLEXITIES = [
  'O(1)',
  'O(log n)',
  'O(n)',
  'O(n log n)',
  'O(n²)',
  'O(2ⁿ)',
];

export default function ComplexityGraph({ result }: Props) {
  const [tab, setTab] = useState<'growth' | 'comparison' | 'simulation'>(
    'growth'
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.35 }}
      className="rounded-xl border border-border bg-surface-1 p-4"
    >
      {/* Tab bar */}
      <div className="mb-4 flex items-center gap-1 rounded-lg bg-surface-2 p-0.5">
        {[
          { id: 'growth' as const, label: 'Growth Curve' },
          { id: 'comparison' as const, label: 'Comparison' },
          { id: 'simulation' as const, label: 'Simulation' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === t.id
                ? 'text-text-primary'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            {tab === t.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-md bg-surface-0 shadow-sm"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
              />
            )}
            <span className="relative z-10">{t.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'growth' && (
          <motion.div
            key="growth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <GrowthChart result={result} />
          </motion.div>
        )}
        {tab === 'comparison' && (
          <motion.div
            key="comparison"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ComparisonChart result={result} />
          </motion.div>
        )}
        {tab === 'simulation' && (
          <motion.div
            key="simulation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SimulationTable result={result} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function GrowthChart({ result }: Props) {
  const color = COMPLEXITY_COLORS[result.time_complexity] || '#6366f1';

  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={result.graph_points}>
          <defs>
            <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            opacity={0.5}
          />
          <XAxis
            dataKey="n"
            tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
            label={{
              value: 'Input Size (n)',
              position: 'insideBottom',
              offset: -5,
              style: { fontSize: 10, fill: 'var(--text-tertiary)' },
            }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
            tickFormatter={(v) => formatAxis(v)}
            label={{
              value: 'Operations',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 10, fill: 'var(--text-tertiary)' },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              fontSize: '12px',
              color: 'var(--text-primary)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            }}
            formatter={(value: number) => [formatAxis(value), 'Operations']}
            labelFormatter={(label) => `n = ${label}`}
          />
          <Area
            type="monotone"
            dataKey="operations"
            stroke={color}
            strokeWidth={2.5}
            fill="url(#growthGradient)"
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-2 text-center text-xs text-text-tertiary">
        Growth curve for{' '}
        <span className="font-semibold text-accent">
          {result.time_complexity}
        </span>{' '}
        — {result.time_label}
      </div>
    </div>
  );
}

function ComparisonChart({ result }: Props) {
  const yourColor = COMPLEXITY_COLORS[result.time_complexity] || '#6366f1';

  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={result.comparison_data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            opacity={0.5}
          />
          <XAxis
            dataKey="n"
            tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
            tickFormatter={(v) => formatAxis(v)}
            scale="log"
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              fontSize: '11px',
              color: 'var(--text-primary)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            }}
            formatter={(value: number, name: string) => [
              formatAxis(value),
              name === result.time_complexity ? `${name} ← Your Algorithm` : name,
            ]}
            labelFormatter={(label) => `n = ${label}`}
          />
          {ALL_COMPLEXITIES.map((complexity) => (
            <Line
              key={complexity}
              type="monotone"
              dataKey={complexity}
              stroke={COMPLEXITY_COLORS[complexity]}
              strokeWidth={
                complexity === result.time_complexity ? 3 : 1.5
              }
              strokeOpacity={
                complexity === result.time_complexity ? 1 : 0.3
              }
              strokeDasharray={
                complexity === result.time_complexity ? undefined : '4 4'
              }
              dot={
                complexity === result.time_complexity
                  ? { r: 3, fill: yourColor, stroke: yourColor }
                  : false
              }
              animationDuration={1000}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
        {ALL_COMPLEXITIES.map((c) => (
          <div
            key={c}
            className={`flex items-center gap-1.5 text-[10px] ${
              c === result.time_complexity
                ? 'font-semibold text-text-primary'
                : 'text-text-tertiary'
            }`}
          >
            <div
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: COMPLEXITY_COLORS[c],
                boxShadow:
                  c === result.time_complexity
                    ? `0 0 6px ${COMPLEXITY_COLORS[c]}60`
                    : 'none',
              }}
            />
            {c}
            {c === result.time_complexity && (
              <span className="rounded bg-accent/10 px-1 py-0.5 text-[9px] font-semibold text-accent">
                YOU
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SimulationTable({ result }: Props) {
  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-2/50">
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                Input Size (n)
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                Operations
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                Growth
              </th>
            </tr>
          </thead>
          <tbody>
            {result.simulation_table.map((row, i) => (
              <motion.tr
                key={row.n}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border-t border-border/50"
              >
                <td className="px-4 py-2 font-mono text-xs text-text-secondary">
                  {row.n.toLocaleString()}
                </td>
                <td className="px-4 py-2 text-right font-mono text-xs font-medium text-text-primary">
                  {row.formatted}
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface-3" style={{ width: '80px' }}>
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-accent to-purple-500"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(100, (row.operations / (result.simulation_table[result.simulation_table.length - 1]?.operations || 1)) * 100)}%`,
                        }}
                        transition={{ delay: i * 0.05 + 0.2, duration: 0.6 }}
                      />
                    </div>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 text-center text-xs text-text-tertiary">
        Simulated operations for{' '}
        <span className="font-semibold text-accent">{result.time_complexity}</span>
      </div>
    </div>
  );
}

function formatAxis(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(0)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(0)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K`;
  return value.toString();
}
