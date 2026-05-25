import { createServerClient } from '@/lib/supabase'
import { ProductCard } from '@/components/product-card'
import { AgentLog } from '@/components/agent-log'
import { HermesFeed } from '@/components/hermes-feed'
import { StatStrip } from '@/components/stat-strip'
import { Settings } from 'lucide-react'

export const revalidate = 30

const FINANCE_AGENTS = [
  { id: 'market-intel', label: 'Market Intelligence', color: 'var(--finance)' },
  { id: 'portfolio', label: 'Portfolio Strategist', color: 'var(--finance)' },
  { id: 'savings', label: 'Savings Optimizer', color: 'var(--finance)' },
  { id: 'crypto', label: 'Crypto & Alt Assets', color: 'var(--finance)' },
]

function LocalAgentCard({
  accent,
  accentHex,
  label,
  status,
  children,
}: {
  accent: string
  accentHex: string
  label: string
  status: string
  children: React.ReactNode
}) {
  return (
    <div
      className="rounded-lg border p-5"
      style={{
        background: 'oklch(0.14 0.022 255)',
        borderColor: `color-mix(in oklch, ${accentHex} 25%, oklch(0.27 0.035 255))`,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div
            className="text-xs uppercase tracking-widest mb-1.5"
            style={{ fontFamily: 'var(--font-dm-mono)', color: accent }}
          >
            {label}
          </div>
          <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider"
            style={{
              fontFamily: 'var(--font-dm-mono)',
              background: 'oklch(0.52 0.04 255 / 0.15)',
              color: 'var(--vmuted)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-vmuted" />
            {status}
          </span>
        </div>
        <button
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] text-vmuted hover:text-vtext transition-colors"
          style={{
            fontFamily: 'var(--font-dm-mono)',
            background: 'oklch(0.22 0.022 255)',
          }}
        >
          <Settings className="w-3 h-3" />
          Configure
        </button>
      </div>
      {children}
    </div>
  )
}

function MrrProgressBar({ current, target = 5000 }: { current: number; target?: number }) {
  const pct = Math.min((current / target) * 100, 100)
  const milestones = [
    { value: 1000, label: '$1K', pct: 20 },
    { value: 2500, label: '$2.5K', pct: 50 },
    { value: target, label: '$5K', pct: 100 },
  ]

  return (
    <div
      className="rounded-lg border border-vborder p-6"
      style={{ background: 'oklch(0.14 0.02 255)' }}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <div
            className="text-[10px] text-vmuted uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            FL Move Progress
          </div>
          <div
            className="text-vtext mt-1"
            style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 22 }}
          >
            ${current.toLocaleString()} <span className="text-vmuted text-sm">/ $5,000 MRR</span>
          </div>
        </div>
        <div className="text-right">
          <div
            className="text-vgreen tabular-nums"
            style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 22 }}
          >
            {pct.toFixed(1)}%
          </div>
          <div
            className="text-vdim text-[10px] mt-1"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            ${(target - current).toLocaleString()} remaining
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative">
        <div className="h-2 rounded-full bg-vsurface2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, oklch(0.61 0.21 280), oklch(0.70 0.17 155))',
            }}
          />
        </div>

        {/* Milestone markers */}
        <div className="relative mt-3">
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
                style={{
                  background: current >= m.value ? 'var(--vgreen)' : 'var(--vborder2)',
                }}
              />
              <span
                className="text-[10px] mt-1 tabular-nums"
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
    </div>
  )
}

export default async function OverviewPage() {
  const supabase = createServerClient()
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

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

  const snapshotsByProduct = (id: string) =>
    (snapshots ?? []).filter((s) => s.product === id)

  const latestByProduct = productIds.map((id) => {
    const snaps = snapshotsByProduct(id)
    return { id, latest: snaps[snaps.length - 1], prev: snaps[snaps.length - 2] }
  })

  const totalMrr = latestByProduct.reduce((sum, { latest }) => sum + (latest?.mrr_usd ?? 0), 0)
  const totalSubs = latestByProduct.reduce((sum, { latest }) => sum + (latest?.subscriber_count ?? 0), 0)
  const prevTotalSubs = latestByProduct.reduce((sum, { prev }) => sum + (prev?.subscriber_count ?? 0), 0)
  const subsDelta = totalSubs - prevTotalSubs
  const pctToTarget = Math.min((totalMrr / 5000) * 100, 100)

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Section 1: Stats */}
      <StatStrip
        totalMrr={totalMrr}
        totalSubs={totalSubs}
        agentCount={agentCount ?? 0}
        hermesCount={hermesCount ?? 0}
        subsDelta={subsDelta}
        pctToTarget={pctToTarget}
      />

      {/* Section 2: Product + Local Agent cards */}
      <div className="grid grid-cols-2 gap-4">
        {(products ?? []).map((p) => {
          const { latest } = latestByProduct.find((x) => x.id === p.id) ?? {}
          return (
            <ProductCard
              key={p.id}
              product={p}
              snapshots={snapshotsByProduct(p.id)}
              latestMrr={latest?.mrr_usd ?? 0}
              latestSubs={latest?.subscriber_count ?? 0}
            />
          )
        })}

        {/* Finance Agents */}
        <LocalAgentCard
          accent="var(--finance)"
          accentHex="#10B981"
          label="Finance Agents"
          status="Local"
        >
          <div className="space-y-2">
            {FINANCE_AGENTS.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center gap-2.5 py-1.5"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: 'var(--finance)' }}
                />
                <span
                  className="text-[12px] text-vmuted"
                  style={{ fontFamily: 'var(--font-dm-mono)' }}
                >
                  {agent.label}
                </span>
              </div>
            ))}
          </div>
        </LocalAgentCard>

        {/* Speech Coach */}
        <LocalAgentCard
          accent="var(--speech)"
          accentHex="#F59E0B"
          label="Speech Coach"
          status="Local"
        >
          <div
            className="text-vmuted text-[12px] leading-relaxed"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            Advanced accent refinement
            <br />
            <span className="text-vdim text-[11px]">Spanish native &rarr; American English</span>
          </div>
          <div
            className="mt-3 pt-3 border-t border-vborder text-[10px] text-vdim"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            Phoneme analysis &middot; prosody training &middot; real-time feedback
          </div>
        </LocalAgentCard>
      </div>

      {/* Section 3: Agent log + Hermes feed */}
      <div className="grid grid-cols-2 gap-4">
        <AgentLog initial={agentRuns ?? []} limit={5} realtime />
        <HermesFeed initial={hermesLogs ?? []} limit={5} realtime />
      </div>

      {/* Section 4: MRR Progress */}
      <MrrProgressBar current={totalMrr} />
    </div>
  )
}
