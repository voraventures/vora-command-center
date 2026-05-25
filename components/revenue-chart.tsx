'use client'

import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts'
import { MrrSnapshot } from '@/lib/types'

const RANGES = [
  { label: '7D',  days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
  { label: 'ALL', days: Infinity },
]

interface Props { snapshots: MrrSnapshot[] }

export function RevenueChart({ snapshots }: Props) {
  const [range, setRange] = useState<number>(30)

  const data = useMemo(() => {
    const cutoff = range === Infinity
      ? new Date(0)
      : new Date(Date.now() - range * 86400000)

    const filtered = snapshots.filter((s) => new Date(s.recorded_at) >= cutoff)
    const byDate: Record<string, Record<string, number>> = {}
    for (const s of filtered) {
      const d = new Date(s.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      if (!byDate[d]) byDate[d] = {}
      byDate[d][s.product] = s.mrr_usd
    }
    return Object.entries(byDate).map(([date, vals]) => ({
      date,
      sparkcheck: vals['sparkcheck'] ?? null,
      twitter_growth_optimizer: vals['twitter_growth_optimizer'] ?? null,
    }))
  }, [snapshots, range])

  return (
    <div
      className="rounded-lg border"
      style={{ background: 'var(--vsurface)', borderColor: 'var(--vborder)' }}
    >
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: 'var(--vborder)' }}
      >
        <span
          style={{
            fontFamily: 'var(--font-syne)',
            fontWeight: 400,
            fontSize: 10,
            color: 'var(--vmuted)',
            letterSpacing: '0.2em',
          }}
        >
          MRR OVER TIME
        </span>
        <div className="flex items-center gap-1">
          {RANGES.map(({ label, days }) => (
            <button
              key={label}
              onClick={() => setRange(days)}
              className="px-3 py-1 rounded-full text-[11px] transition-all duration-100 outline-none"
              style={{
                fontFamily: 'var(--font-syne)',
                fontWeight: 400,
                background: range === days ? 'var(--vsurface2)' : 'transparent',
                color: range === days ? 'var(--vtext)' : 'var(--vmuted)',
                border: `1px solid ${range === days ? 'var(--vborder2)' : 'var(--vborder)'}`,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -8 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="var(--vborder)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fontFamily: 'var(--font-syne)', fill: 'var(--vdim)' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fontFamily: 'var(--font-syne)', fill: 'var(--vdim)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                background: '#FFFFFF',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 12,
                fontFamily: 'var(--font-syne)',
                padding: '8px 12px',
                boxShadow: '0 4px 16px rgba(10,10,8,0.08)',
              }}
              formatter={(v) => [`$${Number(v ?? 0).toLocaleString()}`, '']}
            />
            <ReferenceLine
              y={5000}
              stroke="var(--vgreen)"
              strokeDasharray="4 6"
              label={{
                value: '$5K FL TRIGGER',
                fill: 'var(--vgreen)',
                fontSize: 9,
                fontFamily: 'var(--font-syne)',
                position: 'insideTopRight',
                dy: -6,
              }}
            />
            <Line
              type="monotone"
              dataKey="sparkcheck"
              name="SparkCheck"
              stroke="#E8194B"
              strokeWidth={2}
              dot={false}
              connectNulls
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="twitter_growth_optimizer"
              name="Twitter Growth"
              stroke="#0066FF"
              strokeWidth={2}
              dot={false}
              connectNulls
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4 pt-4" style={{ borderTop: '1px solid var(--vborder)' }}>
          {[
            { label: 'SparkCheck',    color: '#E8194B' },
            { label: 'Twitter Growth', color: '#0066FF' },
            { label: '$5K Target',    color: 'var(--vgreen)', dashed: true },
          ].map(({ label, color, dashed }) => (
            <div key={label} className="flex items-center gap-2">
              <svg width="20" height="2"><line x1="0" y1="1" x2="20" y2="1" stroke={color} strokeWidth="2" strokeDasharray={dashed ? '3 3' : undefined} /></svg>
              <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 400, fontSize: 11, color: 'var(--vmuted)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
