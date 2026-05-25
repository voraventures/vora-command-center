'use client'

import { ExternalLink, GitFork } from 'lucide-react'
import { Product, MrrSnapshot } from '@/lib/types'
import { Sparkline } from './sparkline'

const ACCENT: Record<string, string> = {
  sparkcheck: 'var(--spark)',
  twitter_growth_optimizer: 'var(--twitterblue)',
}

const ACCENT_HEX: Record<string, string> = {
  sparkcheck: '#FF4D8D',
  twitter_growth_optimizer: '#1D9BF0',
}

interface Props {
  product: Product
  snapshots?: MrrSnapshot[]
  latestMrr?: number
  latestSubs?: number
}

export function ProductCard({ product, snapshots = [], latestMrr = 0, latestSubs = 0 }: Props) {
  const accent = ACCENT[product.id] ?? 'var(--hermes)'
  const accentHex = ACCENT_HEX[product.id] ?? '#8B5CF6'
  const sparkData = snapshots.slice(-7).map((s) => s.mrr_usd)

  return (
    <div
      className="product-card relative rounded-lg p-5 border"
      style={{
        background: 'oklch(0.14 0.022 255)',
        borderColor: `color-mix(in oklch, ${accentHex} 30%, oklch(0.27 0.035 255))`,
        '--card-accent': accentHex,
      } as React.CSSProperties}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div
            className="text-xs tracking-widest uppercase font-medium mb-1.5"
            style={{ fontFamily: 'var(--font-dm-mono)', color: accent }}
          >
            {product.label}
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider"
              style={{
                fontFamily: 'var(--font-dm-mono)',
                background:
                  product.status === 'live'
                    ? 'oklch(0.70 0.17 155 / 0.12)'
                    : 'oklch(0.52 0.04 255 / 0.15)',
                color: product.status === 'live' ? 'var(--vgreen)' : 'var(--vmuted)',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: product.status === 'live' ? 'var(--vgreen)' : 'var(--vmuted)',
                }}
              />
              {product.status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-1 rounded text-vmuted hover:text-vtext transition-colors"
            style={{
              fontFamily: 'var(--font-dm-mono)',
              fontSize: 11,
              background: 'oklch(0.22 0.022 255)',
            }}
          >
            <ExternalLink className="w-3 h-3" />
            Live
          </a>
          <a
            href={`https://github.com/${product.github_repo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-1 rounded text-vmuted hover:text-vtext transition-colors"
            style={{
              fontFamily: 'var(--font-dm-mono)',
              fontSize: 11,
              background: 'oklch(0.22 0.022 255)',
            }}
          >
            <GitFork className="w-3 h-3" />
            Repo
          </a>
        </div>
      </div>

      {/* MRR + Subs */}
      <div className="flex items-end justify-between mb-3">
        <div>
          <div
            className="text-vtext tabular-nums"
            style={{ fontFamily: 'var(--font-syne)', fontSize: 28, fontWeight: 800, lineHeight: 1 }}
          >
            ${latestMrr.toLocaleString()}
          </div>
          <div
            className="text-vmuted text-[11px] mt-1.5"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            MRR &middot; {latestSubs} subscribers
          </div>
        </div>
        {sparkData.length >= 2 && (
          <div className="w-28">
            <Sparkline data={sparkData} color={accentHex} height={40} />
          </div>
        )}
        {sparkData.length < 2 && (
          <div
            className="text-vdim text-[10px]"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            No history
          </div>
        )}
      </div>

      {/* Notes */}
      {product.notes && (
        <div
          className="text-vdim text-[11px] pt-3 border-t border-vborder"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          {product.notes}
        </div>
      )}
    </div>
  )
}
