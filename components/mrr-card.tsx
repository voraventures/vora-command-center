'use client'

import { MrrSnapshot } from '@/lib/types'
import { Sparkline } from './sparkline'

const ACCENT_HEX: Record<string, string> = {
  sparkcheck: '#FF4D8D',
  twitter_growth_optimizer: '#1D9BF0',
}

const LABEL: Record<string, string> = {
  sparkcheck: 'SparkCheck',
  twitter_growth_optimizer: 'Twitter Growth Opt.',
}

interface Props {
  product: string
  snapshots: MrrSnapshot[]
}

export function MrrCard({ product, snapshots }: Props) {
  const accentHex = ACCENT_HEX[product] ?? '#8B5CF6'
  const latest = snapshots[snapshots.length - 1]
  const prev = snapshots[snapshots.length - 2]
  const delta = latest && prev ? latest.mrr_usd - prev.mrr_usd : 0
  const data = snapshots.map((s) => s.mrr_usd)
  const mrr = latest?.mrr_usd ?? 0
  const subs = latest?.subscriber_count ?? 0

  return (
    <div
      className="rounded-lg border border-vborder p-5"
      style={{ background: 'oklch(0.14 0.02 255)' }}
    >
      <div
        className="text-[10px] uppercase tracking-widest mb-4"
        style={{ fontFamily: 'var(--font-dm-mono)', color: accentHex }}
      >
        {LABEL[product] ?? product}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div
            className="text-vtext tabular-nums"
            style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 26, lineHeight: 1 }}
          >
            ${mrr.toLocaleString()}
          </div>
          <div
            className="text-vmuted text-[11px] mt-2"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            {subs} subscribers
          </div>
          {delta !== 0 && (
            <div
              className="text-[11px] mt-1 tabular-nums"
              style={{
                fontFamily: 'var(--font-dm-mono)',
                color: delta > 0 ? 'var(--vgreen)' : 'var(--vred)',
              }}
            >
              {delta > 0 ? '+' : ''}${delta.toFixed(0)} vs prev
            </div>
          )}
        </div>
        {data.length >= 2 && (
          <div className="w-24">
            <Sparkline data={data} color={accentHex} height={44} />
          </div>
        )}
      </div>
    </div>
  )
}
