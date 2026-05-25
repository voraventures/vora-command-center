'use client'

import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'

interface Props {
  data: number[]
  color: string
}

export function Sparkline({ data, color }: Props) {
  const chartData = data.map((v, i) => ({ v, i }))
  return (
    <div className="w-24 h-12">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
          />
          <Tooltip
            contentStyle={{ background: '#0F0F0F', border: '1px solid #1E1E1E', fontSize: 10 }}
            formatter={(v: number) => [`$${v}`, 'MRR']}
            labelFormatter={() => ''}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
