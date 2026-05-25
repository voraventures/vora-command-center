'use client'

import { MrrSnapshot } from '@/lib/types'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

const CONFIG: Record<string, { accent: string; label: string }> = {
  sparkcheck:               { accent: '#E8194B', label: 'SparkCheck' },
  twitter_growth_optimizer: { accent: '#0066FF', label: 'Twitter Growth Opt.' },
}

interface Props {
  product: string
  snapshots: MrrSnapshot[]
  animDelay?: number
}

export function MrrCard({ product, snapshots, animDelay = 0 }: Props) {
  const { accent, label } = CONFIG[product] ?? { accent: '#7C3AED', label: product }
  const latest = snapshots[snapshots.length - 1]
  const prev   = snapshots[snapshots.length - 2]
  const delta  = latest && prev ? latest.mrr_usd - prev.mrr_usd : 0
  const mrr    = latest?.mrr_usd ?? 0
  const subs   = latest?.subscriber_count ?? 0
  const sparkData = snapshots.slice(-10).map((s, i) => ({ v: s.mrr_usd, i }))

  return (
    <div
      className="card-hover rounded-lg border animate-fade-up"
      style={{
        background: 'var(--vsurface)',
        borderColor: 'var(--vborder)',
        borderLeft: `4px solid ${accent}`,
        animationDelay: `${animDelay}ms`,
      }}
    >
      <div className="px-5 pt-5 pb-4">
        <div
          style={{
            fontFamily: 'var(--font-dm-mono)',
            fontWeight: 500,
            fontSize: 10,
            color: accent,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </div>

        <div className="mt-3 flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span
                className="tabular-nums"
                style={{
                  fontFamily: 'var(--font-syne)',
                  fontWeight: 800,
                  fontSize: 32,
                  color: 'var(--vtext)',
                  lineHeight: 1,
                }}
              >
                ${mrr.toLocaleString()}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-dm-mono)',
                  fontSize: 11,
                  color: 'var(--vmuted)',
                  letterSpacing: '0.08em',
                }}
              >
                MRR
              </span>
            </div>
            <div
              className="mt-1.5"
              style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 11, color: 'var(--vmuted)' }}
            >
              {subs.toLocaleString()} subscribers
            </div>
            {delta !== 0 && (
              <div
                className="mt-1 tabular-nums"
                style={{
                  fontFamily: 'var(--font-dm-mono)',
                  fontSize: 11,
                  color: delta > 0 ? 'var(--vgreen)' : 'var(--vred)',
                }}
              >
                {delta > 0 ? '+' : ''}${delta.toFixed(0)} vs prev
              </div>
            )}
          </div>

          {sparkData.length >= 2 && (
            <div className="w-24 h-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke={accent}
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
