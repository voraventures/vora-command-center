'use client'

import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'

interface Props {
  data: number[]
  color: string
  height?: number
}

export function Sparkline({ data, color, height = 40 }: Props) {
  if (data.length < 2) return null
  const chartData = data.map((v, i) => ({ v, i }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
        <Tooltip
          contentStyle={{
            background: 'oklch(0.17 0.018 255)',
            border: '1px solid oklch(0.27 0.035 255)',
            borderRadius: 4,
            fontSize: 10,
            fontFamily: 'var(--font-dm-mono)',
            padding: '3px 6px',
          }}
          formatter={(v) => [`$${Number(v ?? 0).toLocaleString()}`, '']}
          labelFormatter={() => ''}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
