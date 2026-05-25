'use client'

import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'

interface Props {
  data: number[]
  color: string
  height?: number
  animate?: boolean
}

export function Sparkline({ data, color, height = 40, animate = false }: Props) {
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
          isAnimationActive={animate}
          animationDuration={600}
        />
        <Tooltip
          contentStyle={{
            background: '#FFFFFF',
            border: '1px solid #E5E4E0',
            borderRadius: 6,
            fontSize: 11,
            fontFamily: 'var(--font-dm-mono)',
            padding: '4px 8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
          formatter={(v) => [`$${Number(v ?? 0).toLocaleString()}`, '']}
          labelFormatter={() => ''}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
