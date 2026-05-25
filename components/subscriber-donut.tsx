'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

interface Props {
  sparkSubs: number
  twitterSubs: number
}

export function SubscriberDonut({ sparkSubs, twitterSubs }: Props) {
  const total = sparkSubs + twitterSubs
  const hasData = total > 0

  const data = hasData
    ? [
        { name: 'SparkCheck',    value: sparkSubs,   color: '#FF4D8D' },
        { name: 'Twitter Growth', value: twitterSubs, color: '#1D9BF0' },
      ]
    : [
        { name: 'SparkCheck',    value: 1, color: '#FF4D8D' },
        { name: 'Twitter Growth', value: 1, color: '#1D9BF0' },
      ]

  return (
    <div
      style={{
        background: '#161B2E',
        border: '1px solid #252D45',
        borderRadius: 12,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 400,
          fontSize: 10,
          color: '#A78BFA',
          letterSpacing: '0.25em',
          marginBottom: 8,
        }}
      >
        SUBSCRIBERS
      </div>

      {/* Donut chart */}
      <div style={{ position: 'relative', height: 180, flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              strokeWidth={0}
            >
              {data.map(({ color }, i) => (
                <Cell key={i} fill={color} opacity={hasData ? 1 : 0.25} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: 32,
              color: '#F0F4FF',
              lineHeight: 1,
            }}
          >
            {total.toLocaleString()}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: '#A78BFA',
              letterSpacing: '0.15em',
              marginTop: 4,
            }}
          >
            TOTAL
          </div>
        </div>
      </div>

      {/* Legend rows */}
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { name: 'SparkCheck',    value: sparkSubs,   color: '#FF4D8D' },
          { name: 'Twitter Growth', value: twitterSubs, color: '#1D9BF0' },
        ].map(({ name, value, color }) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#A78BFA' }}>
                {name}
              </span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                fontWeight: 500,
                color: '#A8B4D0',
              }}
            >
              {value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
