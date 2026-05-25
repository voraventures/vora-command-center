'use client'

import { useState } from 'react'
import { ExternalLink, GitFork } from 'lucide-react'
import { Product, MrrSnapshot } from '@/lib/types'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

const CONFIG: Record<string, { accent: string; label: string }> = {
  sparkcheck:               { accent: '#E8194B', label: 'SparkCheck' },
  twitter_growth_optimizer: { accent: '#0066FF', label: 'Twitter Growth Opt.' },
}

interface Props {
  product: Product
  snapshots?: MrrSnapshot[]
  latestMrr?: number
  latestSubs?: number
  animDelay?: number
}

export function ProductCard({ product, snapshots = [], latestMrr = 0, latestSubs = 0, animDelay = 0 }: Props) {
  const { accent } = CONFIG[product.id] ?? { accent: '#7C3AED', label: product.label }
  const sparkData = snapshots.slice(-8).map((s, i) => ({ v: s.mrr_usd, i }))

  const [sparkKey, setSparkKey] = useState(0)

  return (
    <div
      className="product-card rounded-lg border bg-vsurface animate-fade-up"
      style={{
        borderColor: 'var(--vborder)',
        borderLeft: `4px solid ${accent}`,
        animationDelay: `${animDelay}ms`,
      }}
      onMouseEnter={() => setSparkKey((k) => k + 1)}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span
              style={{
                fontFamily: 'var(--font-syne)',
                fontWeight: 700,
                fontSize: 18,
                color: 'var(--vtext)',
                letterSpacing: '-0.01em',
              }}
            >
              {CONFIG[product.id]?.label ?? product.label}
            </span>
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded"
              style={{
                fontFamily: 'var(--font-dm-mono)',
                fontWeight: 500,
                fontSize: 8,
                letterSpacing: '0.1em',
                background: product.status === 'live' ? '#DCFCE7' : '#F3F4F6',
                color: product.status === 'live' ? '#059669' : '#6B7280',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: product.status === 'live' ? '#059669' : '#9CA3AF' }}
              />
              {product.status.toUpperCase()}
            </span>
          </div>
          {product.notes && (
            <div style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: 'var(--vmuted)' }}>
              {product.notes}
            </div>
          )}
        </div>
      </div>

      {/* MRR row */}
      <div className="px-5 pb-4 flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <span
              className="tabular-nums"
              style={{
                fontFamily: 'var(--font-syne)',
                fontWeight: 800,
                fontSize: 36,
                color: 'var(--vtext)',
                lineHeight: 1,
              }}
            >
              ${latestMrr.toLocaleString()}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-dm-mono)',
                fontWeight: 500,
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
            style={{
              fontFamily: 'var(--font-dm-mono)',
              fontSize: 11,
              color: 'var(--vmuted)',
            }}
          >
            {latestSubs.toLocaleString()} subscribers
          </div>
        </div>

        {/* Sparkline */}
        {sparkData.length >= 2 && (
          <div className="w-28 h-10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart key={sparkKey} data={sparkData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke={accent}
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive
                  animationDuration={600}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

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
          style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 11, color: 'var(--vmuted)' }}
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
          style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 11, color: 'var(--vmuted)' }}
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
