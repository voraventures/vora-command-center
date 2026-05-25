'use client'

import { useState } from 'react'
import { ExternalLink, GitFork } from 'lucide-react'
import { Product, MrrSnapshot } from '@/lib/types'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'

const CONFIG: Record<string, { accent: string; accentGlow: string; label: string }> = {
  sparkcheck:               { accent: '#FF4D8D', accentGlow: 'rgba(255,77,141,0.2)',  label: 'SparkCheck' },
  twitter_growth_optimizer: { accent: '#1D9BF0', accentGlow: 'rgba(29,155,240,0.2)', label: 'Twitter Growth Opt.' },
}

interface Props {
  product: Product
  snapshots?: MrrSnapshot[]
  latestMrr?: number
  latestSubs?: number
  animDelay?: number
}

export function ProductCard({ product, snapshots = [], latestMrr = 0, latestSubs = 0, animDelay = 0 }: Props) {
  const { accent, accentGlow } = CONFIG[product.id] ?? { accent: '#9C6FFF', accentGlow: 'rgba(156,111,255,0.2)', label: product.label }
  const sparkData = snapshots.slice(-10).map((s, i) => ({ v: s.mrr_usd, i }))
  const [sparkKey, setSparkKey] = useState(0)
  const [hovered, setHovered] = useState(false)
  const gradId = `pc-grad-${product.id}`

  return (
    <div
      className="product-card rounded-lg border animate-fade-up flex flex-col"
      style={{
        background: 'var(--vsurface)',
        borderColor: hovered ? accent : 'var(--vborder)',
        borderLeft: `3px solid ${accent}`,
        animationDelay: `${animDelay}ms`,
        boxShadow: hovered ? `0 8px 32px ${accentGlow}` : 'none',
        transition: 'box-shadow 0.2s ease-out, border-color 0.2s ease-out, transform 0.2s ease-out',
      }}
      onMouseEnter={() => { setSparkKey((k) => k + 1); setHovered(true) }}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 20,
                color: 'var(--vtext)',
                letterSpacing: '-0.01em',
              }}
            >
              {CONFIG[product.id]?.label ?? product.label}
            </span>
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded"
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 400,
                fontSize: 8,
                letterSpacing: '0.1em',
                background: product.status === 'live'
                  ? 'rgba(0,230,118,0.12)'
                  : 'rgba(90,106,138,0.15)',
                color: product.status === 'live' ? '#00E676' : 'var(--vmuted)',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse-dot"
                style={{ background: product.status === 'live' ? '#00E676' : 'var(--vmuted)' }}
              />
              {product.status.toUpperCase()}
            </span>
          </div>
          {product.notes && (
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 12, color: 'var(--vmuted)' }}>
              {product.notes}
            </div>
          )}
        </div>
      </div>

      {/* MRR row */}
      <div className="px-5 pb-3">
        <div className="flex items-baseline gap-2">
          <span
            className="tabular-nums"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: 40,
              color: accent,
              lineHeight: 1,
            }}
          >
            ${latestMrr.toLocaleString()}
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
          className="mt-1"
          style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 11, color: 'var(--vmuted)' }}
        >
          {latestSubs.toLocaleString()} subscribers
        </div>
      </div>

      {/* Full-width AreaChart sparkline */}
      {sparkData.length >= 2 ? (
        <div className="flex-1 min-h-0" style={{ height: 60 }}>
          <ResponsiveContainer width="100%" height={60}>
            <AreaChart key={sparkKey} data={sparkData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
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
                isAnimationActive={sparkKey > 0}
                animationDuration={600}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div style={{ height: 60 }} />
      )}

      {/* Footer */}
      <div
        className="px-5 py-3 border-t flex items-center gap-3"
        style={{ borderColor: 'var(--vborder)' }}
      >
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 transition-colors duration-100"
          style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 11, color: 'var(--vmuted)' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = accent)}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--vmuted)')}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Live site
        </a>
        <a
          href={`https://github.com/${product.github_repo}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 transition-colors duration-100"
          style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 11, color: 'var(--vmuted)' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = accent)}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--vmuted)')}
        >
          <GitFork className="w-3.5 h-3.5" />
          GitHub
        </a>
      </div>
    </div>
  )
}
