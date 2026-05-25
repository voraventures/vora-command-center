import { createServerClient } from '@/lib/supabase'
import { ProductCard } from '@/components/product-card'
import { AgentLog } from '@/components/agent-log'
import { HermesFeed } from '@/components/hermes-feed'
import { StatStrip } from '@/components/stat-strip'
import { Settings } from 'lucide-react'

export const revalidate = 30

const FINANCE_AGENTS = [
  { id: 'market-intel',     label: 'Market Intelligence' },
  { id: 'portfolio',        label: 'Portfolio Strategist' },
  { id: 'savings',          label: 'Savings Optimizer' },
  { id: 'finance-crypto',   label: 'Crypto & Alt Assets' },
]

function LocalCard({
  accentColor,
  accentBg,
  label,
  pill,
  pillBg,
  pillColor,
  footer,
  children,
  animDelay = 0,
}: {
  accentColor: string
  accentBg: string
  label: string
  pill: string
  pillBg: string
  pillColor: string
  footer: string
  children: React.ReactNode
  animDelay?: number
}) {
  return (
    <div
      className="product-card rounded-lg border bg-vsurface flex flex-col animate-fade-up"
      style={{ borderColor: 'var(--vborder)', borderLeft: `4px solid ${accentColor}`, animationDelay: `${animDelay}ms` }}
    >
      <div className="px-5 pt-5 pb-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span
              style={{
                fontFamily: 'var(--font-syne)',
                fontWeight: 700,
                fontSize: 16,
                color: 'var(--vtext)',
              }}
            >
              {label}
            </span>
            <span
              className="px-1.5 py-0.5 rounded text-[8px]"
              style={{
                fontFamily: 'var(--font-dm-mono)',
                fontWeight: 500,
                letterSpacing: '0.1em',
                background: pillBg,
                color: pillColor,
              }}
            >
              {pill}
            </span>
          </div>
        </div>
        <button
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-[11px] transition-colors duration-100"
          style={{
            fontFamily: 'var(--font-dm-mono)',
            color: 'var(--vmuted)',
            borderColor: 'var(--vborder)',
            background: 'transparent',
          }}
        >
          <Settings className="w-3 h-3" />
          Configure
        </button>
      </div>

      <div className="px-5 flex-1">{children}</div>

      <div
        className="px-5 py-3 border-t mt-4"
        style={{
          borderColor: 'var(--vborder)',
          fontFamily: 'var(--font-dm-mono)',
          fontSize: 11,
          color: 'var(--vmuted)',
        }}
      >
        {footer}
      </div>
    </div>
  )
}

function MrrProgressBar({ current, target = 5000 }: { current: number; target?: number }) {
  const pct = Math.min((current / target) * 100, 100)
  const milestones = [
    { value: 1000,  label: '$1K',  pct: 20 },
    { value: 2500,  label: '$2.5K', pct: 50 },
    { value: target, label: '$5K', pct: 100 },
  ]

  return (
    <div
      className="rounded-lg border animate-fade-up"
      style={{ background: 'var(--vsurface)', borderColor: 'var(--vborder)', animationDelay: '300ms' }}
    >
      <div className="px-6 py-5">
        <div
          style={{
            fontFamily: 'var(--font-dm-mono)',
            fontWeight: 500,
            fontSize: 10,
            color: 'var(--vmuted)',
            letterSpacing: '0.2em',
          }}
        >
          FL MOVE PROGRESS
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span
            className="tabular-nums"
            style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 28, color: 'var(--vgreen)', lineHeight: 1 }}
          >
            ${current.toLocaleString()}
          </span>
          <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 14, color: 'var(--vmuted)' }}>
            / $5,000 MRR
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-5 relative">
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: 'var(--vbg)' }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${pct}%`,
                background: 'linear-gradient(90deg, #059669, #10B981)',
                animation: 'progressFill 800ms ease-out both',
              }}
            />
          </div>

          {/* Milestones */}
          <div className="relative mt-3 h-8">
            {milestones.map((m) => (
              <div
                key={m.value}
                className="absolute flex flex-col items-center"
                style={{
                  left: `${m.pct}%`,
                  transform: m.pct === 100 ? 'translateX(-100%)' : m.pct === 0 ? 'none' : 'translateX(-50%)',
                }}
              >
                <div
                  className="w-px h-2"
                  style={{ background: current >= m.value ? 'var(--vgreen)' : 'var(--vborder2)' }}
                />
                <span
                  className="mt-0.5 text-[10px] tabular-nums"
                  style={{
                    fontFamily: 'var(--font-dm-mono)',
                    color: current >= m.value ? 'var(--vgreen)' : 'var(--vdim)',
                  }}
                >
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="mt-6"
          style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 12, color: 'var(--vmuted)' }}
        >
          {pct.toFixed(1)}% to Florida.{' '}
          <span style={{ color: 'var(--vtext2)' }}>
            ${(target - current).toLocaleString()} remaining.
          </span>
        </div>
      </div>
    </div>
  )
}

export default async function OverviewPage() {
  const supabase = createServerClient()
  const since24h = new Date(Date.now() - 86400000).toISOString()

  const [
    { data: products },
    { data: snapshots },
    { data: agentRuns },
    { data: hermesLogs },
    { count: agentCount },
    { count: hermesCount },
  ] = await Promise.all([
    supabase.from('products').select('*').order('id'),
    supabase.from('mrr_snapshots').select('*').order('recorded_at', { ascending: true }),
    supabase.from('agent_runs').select('*').order('ran_at', { ascending: false }).limit(5),
    supabase.from('hermes_log').select('*').order('logged_at', { ascending: false }).limit(5),
    supabase.from('agent_runs').select('*', { count: 'exact', head: true }).gte('ran_at', since24h),
    supabase.from('hermes_log').select('*', { count: 'exact', head: true }).gte('logged_at', since24h),
  ])

  const productIds = ['sparkcheck', 'twitter_growth_optimizer']
  const snapshotsByProduct = (id: string) => (snapshots ?? []).filter((s) => s.product === id)

  const latestByProduct = productIds.map((id) => {
    const snaps = snapshotsByProduct(id)
    return { id, latest: snaps[snaps.length - 1], prev: snaps[snaps.length - 2] }
  })

  const totalMrr  = latestByProduct.reduce((s, { latest }) => s + (latest?.mrr_usd ?? 0), 0)
  const totalSubs = latestByProduct.reduce((s, { latest }) => s + (latest?.subscriber_count ?? 0), 0)
  const prevSubs  = latestByProduct.reduce((s, { prev }) => s + (prev?.subscriber_count ?? 0), 0)
  const subsDelta = totalSubs - prevSubs
  const pctToTarget = Math.min((totalMrr / 5000) * 100, 100)

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Stat strip */}
      <StatStrip
        totalMrr={totalMrr}
        totalSubs={totalSubs}
        agentCount={agentCount ?? 0}
        hermesCount={hermesCount ?? 0}
        subsDelta={subsDelta}
        pctToTarget={pctToTarget}
      />

      {/* Product + local agent cards */}
      <div className="grid grid-cols-2 gap-4">
        {(products ?? []).map((p, i) => {
          const { latest } = latestByProduct.find((x) => x.id === p.id) ?? {}
          return (
            <ProductCard
              key={p.id}
              product={p}
              snapshots={snapshotsByProduct(p.id)}
              latestMrr={latest?.mrr_usd ?? 0}
              latestSubs={latest?.subscriber_count ?? 0}
              animDelay={i * 60}
            />
          )
        })}

        {/* Finance agents */}
        <LocalCard
          accentColor="#059669"
          accentBg="#059669"
          label="FINANCE AGENTS"
          pill="LOCAL"
          pillBg="#DCFCE7"
          pillColor="#059669"
          footer="4 agents configured · Mac Studio M4 Max"
          animDelay={120}
        >
          <div className="space-y-2.5 pb-2">
            {FINANCE_AGENTS.map((a) => (
              <div key={a.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#059669' }} />
                  <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 12, color: 'var(--vtext)' }}>
                    {a.label}
                  </span>
                </div>
                <span
                  className="px-1.5 py-0.5 rounded border text-[9px]"
                  style={{
                    fontFamily: 'var(--font-dm-mono)',
                    color: 'var(--vmuted)',
                    borderColor: 'var(--vborder)',
                    background: 'var(--vbg)',
                  }}
                >
                  QWEN3
                </span>
              </div>
            ))}
          </div>
        </LocalCard>

        {/* Speech coach */}
        <LocalCard
          accentColor="#D97706"
          accentBg="#D97706"
          label="SPEECH COACH"
          pill="LOCAL"
          pillBg="#FEF3C7"
          pillColor="#D97706"
          footer="1 agent configured · Mac Studio M4 Max"
          animDelay={180}
        >
          <div className="pb-2">
            <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 15, color: 'var(--vtext)' }}>
              Advanced accent refinement
            </div>
            <div className="mt-1" style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: 'var(--vmuted)' }}>
              Spanish native &rarr; American English
            </div>
            <div
              className="mt-3"
              style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 11, color: 'var(--vmuted)' }}
            >
              Phoneme analysis &middot; Prosody training &middot; Domain drilling
            </div>
          </div>
        </LocalCard>
      </div>

      {/* Feeds */}
      <div className="grid grid-cols-2 gap-4">
        <AgentLog initial={agentRuns ?? []} limit={5} realtime />
        <HermesFeed initial={hermesLogs ?? []} limit={5} realtime />
      </div>

      {/* MRR progress */}
      <MrrProgressBar current={totalMrr} />
    </div>
  )
}
