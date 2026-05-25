'use client'

import { useMemo } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts'
import { MrrSnapshot } from '@/lib/types'

interface Props {
  snapshots: MrrSnapshot[]
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct']
const PLACEHOLDER = MONTHS.map((date) => ({ date, sparkcheck: 0 as number | null, twitter_growth_optimizer: 0 as number | null }))

export function OverviewRevenueChart({ snapshots }: Props) {
  const data = useMemo(() => {
    if (!snapshots.length) return PLACEHOLDER

    const byDate: Record<string, Record<string, number>> = {}
    for (const s of snapshots) {
      const d = new Date(s.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      if (!byDate[d]) byDate[d] = {}
      byDate[d][s.product] = s.mrr_usd
    }
    const result = Object.entries(byDate).map(([date, vals]) => ({
      date,
      sparkcheck: vals['sparkcheck'] ?? null,
      twitter_growth_optimizer: vals['twitter_growth_optimizer'] ?? null,
    }))
    return result.length ? result : PLACEHOLDER
  }, [snapshots])

  return (
    <div
      style={{
        background: '#161B2E',
        border: '1px solid #252D45',
        borderRadius: 12,
        padding: 24,
        height: '100%',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 400,
          fontSize: 10,
          color: '#5A6A8A',
          letterSpacing: '0.2em',
          marginBottom: 20,
        }}
      >
        REVENUE GROWTH
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
          <defs>
            <linearGradient id="ovr-grad-spark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF4D8D" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#FF4D8D" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="ovr-grad-twitter" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1D9BF0" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#1D9BF0" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="0" stroke="#252D45" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: '#5A6A8A' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: '#5A6A8A' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            contentStyle={{
              background: '#1E2540',
              border: '1px solid #252D45',
              borderRadius: 8,
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              padding: '8px 12px',
              color: '#F0F4FF',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            }}
            labelStyle={{ color: '#5A6A8A', marginBottom: 4, fontSize: 10 }}
            formatter={(v) => [`$${Number(v ?? 0).toLocaleString()}`, '']}
          />
          <ReferenceLine
            y={5000}
            stroke="#00E676"
            strokeDasharray="4 6"
            label={{
              value: 'FL Target',
              fill: '#00E676',
              fontSize: 9,
              fontFamily: 'var(--font-mono)',
              position: 'insideTopRight',
              dy: -6,
            }}
          />
          <Area
            type="monotone"
            dataKey="sparkcheck"
            name="SparkCheck"
            stroke="#FF4D8D"
            strokeWidth={2}
            fill="url(#ovr-grad-spark)"
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="twitter_growth_optimizer"
            name="Twitter Growth"
            stroke="#1D9BF0"
            strokeWidth={2}
            fill="url(#ovr-grad-twitter)"
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: 20,
          marginTop: 16,
          paddingTop: 16,
          borderTop: '1px solid #252D45',
        }}
      >
        {[
          { label: 'SparkCheck',    color: '#FF4D8D' },
          { label: 'Twitter Growth', color: '#1D9BF0' },
          { label: 'FL Target',     color: '#00E676' },
        ].map(({ label, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: color,
                flexShrink: 0,
                display: 'inline-block',
              }}
            />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5A6A8A' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
