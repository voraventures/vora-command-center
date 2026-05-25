'use client'

import { MrrSnapshot } from '@/lib/types'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'

const CONFIG: Record<string, { accent: string; label: string }> = {
  sparkcheck:               { accent: '#FF4D8D', label: 'SparkCheck' },
  twitter_growth_optimizer: { accent: '#1D9BF0', label: 'Twitter Growth Opt.' },
}

interface Props {
  product: string
  snapshots: MrrSnapshot[]
  animDelay?: number
}

export function MrrCard({ product, snapshots, animDelay = 0 }: Props) {
  const { accent, label } = CONFIG[product] ?? { accent: '#9C6FFF', label: product }
  const latest = snapshots[snapshots.length - 1]
  const prev   = snapshots[snapshots.length - 2]
  const delta  = latest && prev ? latest.mrr_usd - prev.mrr_usd : 0
  const mrr    = latest?.mrr_usd ?? 0
  const subs   = latest?.subscriber_count ?? 0
  const sparkData = snapshots.slice(-10).map((s, i) => ({ v: s.mrr_usd, i }))
  const gradId = `mc-grad-${product}`

  return (
    <div
      className="card-hover rounded-lg border animate-fade-up overflow-hidden"
      style={{
        background: 'var(--vsurface)',
        borderColor: 'var(--vborder)',
        borderLeft: `3px solid ${accent}`,
        animationDelay: `${animDelay}ms`,
      }}
    >
      <div className="px-5 pt-5 pb-4">
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 400,
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
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  fontSize: 32,
                  color: accent,
                  lineHeight: 1,
                }}
              >
                ${mrr.toLocaleString()}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 400,
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
              style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 11, color: 'var(--vmuted)' }}
            >
              {subs.toLocaleString()} subscribers
            </div>
            {delta !== 0 && (
              <div
                className="mt-1 tabular-nums"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 400,
                  fontSize: 11,
                  color: delta > 0 ? 'var(--vgreen)' : 'var(--vred)',
                }}
              >
                {delta > 0 ? '+' : ''}${delta.toFixed(0)} vs prev
              </div>
            )}
          </div>

          {sparkData.length >= 2 && (
            <div style={{ width: 96, height: 40, flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparkData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={accent} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={accent}
                    strokeWidth={2}
                    fill={`url(#${gradId})`}
                    dot={false}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
