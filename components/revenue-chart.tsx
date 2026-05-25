'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { MrrSnapshot } from '@/lib/types'

interface Props {
  snapshots: MrrSnapshot[]
}

export function RevenueChart({ snapshots }: Props) {
  const byDate: Record<string, Record<string, number>> = {}

  for (const s of snapshots) {
    const date = new Date(s.recorded_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
    if (!byDate[date]) byDate[date] = {}
    byDate[date][s.product] = s.mrr_usd
  }

  const data = Object.entries(byDate).map(([date, vals]) => ({
    date,
    sparkcheck: vals['sparkcheck'] ?? null,
    twitter_growth_optimizer: vals['twitter_growth_optimizer'] ?? null,
  }))

  return (
    <div className="border border-[#1E1E1E] bg-[#0F0F0F] rounded p-4">
      <div className="font-mono text-[10px] text-zinc-500 tracking-widest uppercase mb-4">
        MRR Over Time
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono', fill: '#52525b' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono', fill: '#52525b' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            contentStyle={{
              background: '#0F0F0F',
              border: '1px solid #1E1E1E',
              fontSize: 11,
              fontFamily: 'IBM Plex Mono',
            }}
            formatter={(v) => [`$${v ?? 0}`, '']}
          />
          <Legend
            wrapperStyle={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }}
          />
          <ReferenceLine
            y={5000}
            stroke="#22c55e"
            strokeDasharray="4 4"
            label={{
              value: '$5K TARGET',
              fill: '#22c55e',
              fontSize: 9,
              fontFamily: 'IBM Plex Mono',
            }}
          />
          <Line
            type="monotone"
            dataKey="sparkcheck"
            name="SparkCheck"
            stroke="#FF5C8D"
            strokeWidth={1.5}
            dot={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="twitter_growth_optimizer"
            name="Twitter Growth Opt."
            stroke="#1DA1F2"
            strokeWidth={1.5}
            dot={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
