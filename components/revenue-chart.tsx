'use client'

import { useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { MrrSnapshot } from '@/lib/types'

const RANGES = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
  { label: 'ALL', days: Infinity },
]

interface Props {
  snapshots: MrrSnapshot[]
}

export function RevenueChart({ snapshots }: Props) {
  const [range, setRange] = useState<number>(30)

  const data = useMemo(() => {
    const cutoff =
      range === Infinity
        ? new Date(0)
        : new Date(Date.now() - range * 24 * 60 * 60 * 1000)

    const filtered = snapshots.filter((s) => new Date(s.recorded_at) >= cutoff)

    const byDate: Record<string, Record<string, number>> = {}
    for (const s of filtered) {
      const date = new Date(s.recorded_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
      if (!byDate[date]) byDate[date] = {}
      byDate[date][s.product] = s.mrr_usd
    }

    return Object.entries(byDate).map(([date, vals]) => ({
      date,
      sparkcheck: vals['sparkcheck'] ?? null,
      twitter_growth_optimizer: vals['twitter_growth_optimizer'] ?? null,
    }))
  }, [snapshots, range])

  return (
    <div
      className="rounded-lg border border-vborder p-5"
      style={{ background: 'oklch(0.14 0.02 255)' }}
    >
      <div className="flex items-center justify-between mb-5">
        <span
          className="text-[10px] text-vmuted uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          MRR Over Time
        </span>
        <div className="flex items-center gap-1">
          {RANGES.map(({ label, days }) => (
            <button
              key={label}
              onClick={() => setRange(days)}
              className="px-2.5 py-1 rounded text-[11px] transition-colors duration-100 focus-visible:ring-1 focus-visible:ring-vborder2 outline-none"
              style={{
                fontFamily: 'var(--font-dm-mono)',
                background: range === days ? 'oklch(0.22 0.022 255)' : 'transparent',
                color: range === days ? 'var(--vtext)' : 'var(--vmuted)',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -8 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="oklch(0.27 0.035 255)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fontFamily: 'var(--font-dm-mono)', fill: 'oklch(0.32 0.04 255)' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fontFamily: 'var(--font-dm-mono)', fill: 'oklch(0.32 0.04 255)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            contentStyle={{
              background: 'oklch(0.17 0.018 255)',
              border: '1px solid oklch(0.27 0.035 255)',
              borderRadius: 6,
              fontSize: 11,
              fontFamily: 'var(--font-dm-mono)',
              padding: '6px 10px',
            }}
            formatter={(v) => [`$${Number(v ?? 0).toLocaleString()}`, '']}
          />
          <ReferenceLine
            y={5000}
            stroke="oklch(0.70 0.17 155)"
            strokeDasharray="4 6"
            label={{
              value: '$5K FL TRIGGER',
              fill: 'oklch(0.70 0.17 155)',
              fontSize: 9,
              fontFamily: 'var(--font-dm-mono)',
              position: 'insideTopRight',
              dy: -6,
            }}
          />
          <Line
            type="monotone"
            dataKey="sparkcheck"
            name="SparkCheck"
            stroke="#FF4D8D"
            strokeWidth={1.5}
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="twitter_growth_optimizer"
            name="Twitter Growth Opt."
            stroke="#1D9BF0"
            strokeWidth={1.5}
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-3 pt-3 border-t border-vborder">
        {[
          { label: 'SparkCheck', color: '#FF4D8D' },
          { label: 'Twitter Growth', color: '#1D9BF0' },
          { label: '$5K Target', color: 'oklch(0.70 0.17 155)', dashed: true },
        ].map(({ label, color, dashed }) => (
          <div key={label} className="flex items-center gap-1.5">
            <svg width="16" height="2" viewBox="0 0 16 2">
              <line
                x1="0" y1="1" x2="16" y2="1"
                stroke={color}
                strokeWidth="1.5"
                strokeDasharray={dashed ? '3 3' : undefined}
              />
            </svg>
            <span
              className="text-[10px] text-vmuted"
              style={{ fontFamily: 'var(--font-dm-mono)' }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
