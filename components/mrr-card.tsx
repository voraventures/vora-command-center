'use client'

import { MrrSnapshot } from '@/lib/types'
import { Sparkline } from './sparkline'

const ACCENT: Record<string, string> = {
  sparkcheck: '#FF5C8D',
  twitter_growth_optimizer: '#1DA1F2',
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
  const accent = ACCENT[product] ?? '#9B5CFF'
  const latest = snapshots[snapshots.length - 1]
  const prev = snapshots[snapshots.length - 2]
  const delta = latest && prev ? latest.mrr_usd - prev.mrr_usd : 0
  const data = snapshots.map((s) => s.mrr_usd)

  return (
    <div className="border border-[#1E1E1E] bg-[#0F0F0F] rounded p-4">
      <div
        className="font-mono text-[10px] font-bold tracking-widest uppercase mb-3"
        style={{ color: accent }}
      >
        {LABEL[product] ?? product}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="font-mono text-2xl font-bold text-white">
            ${latest ? latest.mrr_usd.toLocaleString() : '—'}
          </div>
          <div className="font-mono text-[11px] text-zinc-500 mt-1">
            MRR ·{' '}
            {latest ? latest.subscriber_count : 0} subs
          </div>
          {delta !== 0 && (
            <div
              className={`font-mono text-[11px] mt-1 ${delta > 0 ? 'text-green-400' : 'text-red-400'}`}
            >
              {delta > 0 ? '+' : ''}${delta.toFixed(0)} vs prev
            </div>
          )}
        </div>
        {data.length > 1 && (
          <Sparkline data={data} color={accent} />
        )}
      </div>
    </div>
  )
}
