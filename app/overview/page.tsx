import { createServerClient } from '@/lib/supabase'
import { ProductCard } from '@/components/product-card'
import { AgentLog } from '@/components/agent-log'
import { HermesFeed } from '@/components/hermes-feed'
import { StatStrip } from '@/components/stat-strip'
import { OverviewRevenueChart } from '@/components/overview-revenue-chart'
import { SubscriberDonut } from '@/components/subscriber-donut'
import { TokenUsage } from '@/components/token-usage'
import { Settings } from 'lucide-react'

export const revalidate = 30

const FINANCE_AGENTS = [
  { id: 'market-intel',   label: 'Market Intelligence' },
  { id: 'portfolio',      label: 'Portfolio Strategist' },
  { id: 'savings',        label: 'Savings Optimizer' },
  { id: 'finance-crypto', label: 'Crypto & Alt Assets' },
]

function LocalCard({
  accentColor,
  label,
  pill,
  pillColor,
  footer,
  children,
  animDelay = 0,
}: {
  accentColor: string
  label: string
  pill: string
  pillColor: string
  footer: string
  children: React.ReactNode
  animDelay?: number
}) {
  return (
    <div
      className="product-card rounded-lg flex flex-col animate-fade-up"
      style={{
        background: '#161B2E',
        border: '1px solid #252D45',
        borderLeft: `3px solid ${accentColor}`,
        borderRadius: 12,
        animationDelay: `${animDelay}ms`,
      }}
    >
      <div className="px-5 pt-5 pb-4 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 18,
              color: '#F0F4FF',
            }}
          >
            {label}
          </span>
          <span
            className="px-1.5 py-0.5 rounded"
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 400,
              fontSize: 9,
              letterSpacing: '0.1em',
              background: `${accentColor}18`,
              color: pillColor,
            }}
          >
            {pill}
          </span>
        </div>
        <button
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-colors duration-100"
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 400,
            fontSize: 11,
            color: '#5A6A8A',
            border: '1px solid #252D45',
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
          borderColor: '#252D45',
          fontFamily: 'var(--font-mono)',
          fontWeight: 400,
          fontSize: 11,
          color: '#5A6A8A',
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
      className="animate-fade-up"
      style={{
        background: '#161B2E',
        border: '1px solid #252D45',
        borderRadius: 12,
        animationDelay: '300ms',
      }}
    >
      <div style={{ padding: '24px 28px' }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 400,
            fontSize: 10,
            color: '#5A6A8A',
            letterSpacing: '0.25em',
          }}
        >
          FL MOVE PROGRESS
        </div>

        <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span
            className="tabular-nums"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: 48,
              color: '#00E676',
              lineHeight: 1,
            }}
          >
            ${current.toLocaleString()}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 14, color: '#5A6A8A' }}>
            / $5,000 MRR
          </span>
        </div>

        {/* Track */}
        <div style={{ marginTop: 20, position: 'relative' }}>
          {/* Track background */}
          <div style={{ height: 8, borderRadius: 4, background: '#252D45', position: 'relative', overflow: 'visible' }}>
            {/* Fill */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: `${pct}%`,
                borderRadius: 4,
                background: 'linear-gradient(90deg, #00E676, #9C6FFF)',
                animation: 'progressFill 800ms ease-out both',
              }}
            />

            {/* Milestone circles on track */}
            {milestones.map((m) => (
              <div
                key={m.value}
                style={{
                  position: 'absolute',
                  left: `${m.pct}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: current >= m.value ? '#00E676' : '#161B2E',
                  border: `2px solid ${current >= m.value ? '#00E676' : '#2F3A58'}`,
                  zIndex: 1,
                }}
              />
            ))}
          </div>

          {/* Milestone labels */}
          <div style={{ position: 'relative', marginTop: 12, height: 16 }}>
            {milestones.map((m) => (
              <div
                key={m.value}
                style={{
                  position: 'absolute',
                  left: `${m.pct}%`,
                  transform: m.pct === 100 ? 'translateX(-100%)' : m.pct === 0 ? 'none' : 'translateX(-50%)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 400,
                    fontSize: 10,
                    color: current >= m.value ? '#00E676' : '#5A6A8A',
                  }}
                >
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 12, color: '#5A6A8A', marginTop: 20 }}
        >
          {pct.toFixed(1)}% to Florida.{' '}
          <span style={{ color: '#A8B4D0' }}>
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
    { data: tokenRuns },
    { count: agentCount },
    { count: hermesCount },
  ] = await Promise.all([
    supabase.from('products').select('*').order('id'),
    supabase.from('mrr_snapshots').select('*').order('recorded_at', { ascending: true }),
    supabase.from('agent_runs').select('*').order('ran_at', { ascending: false }).limit(5),
    supabase.from('hermes_log').select('*').order('logged_at', { ascending: false }).limit(5),
    supabase
      .from('agent_runs')
      .select('id,agent_id,agent_label,model,input_tokens,output_tokens,estimated_cost_usd,ran_at')
      .order('ran_at', { ascending: false })
      .limit(500),
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

  const sparkSubs   = latestByProduct.find((x) => x.id === 'sparkcheck')?.latest?.subscriber_count ?? 0
  const twitterSubs = latestByProduct.find((x) => x.id === 'twitter_growth_optimizer')?.latest?.subscriber_count ?? 0

  // Combined sparkline data (group by date, sum across products)
  const mrrByDate = new Map<string, { mrr: number; subs: number }>()
  for (const s of (snapshots ?? [])) {
    const d = new Date(s.recorded_at).toDateString()
    const curr = mrrByDate.get(d) ?? { mrr: 0, subs: 0 }
    mrrByDate.set(d, { mrr: curr.mrr + s.mrr_usd, subs: curr.subs + s.subscriber_count })
  }
  const sortedDates  = Array.from(mrrByDate.values())
  const mrrSparkline = sortedDates.slice(-7).map((d) => d.mrr)
  const subsSparkline = sortedDates.slice(-7).map((d) => d.subs)

  return (
    <div className="space-y-5 max-w-6xl">

      {/* 1. Stat strip — 4 cards */}
      <StatStrip
        totalMrr={totalMrr}
        totalSubs={totalSubs}
        agentCount={agentCount ?? 0}
        hermesCount={hermesCount ?? 0}
        subsDelta={subsDelta}
        pctToTarget={pctToTarget}
        mrrSparkline={mrrSparkline}
        subsSparkline={subsSparkline}
      />

      {/* 1b. Token usage + cost tracker */}
      <TokenUsage initialRuns={(tokenRuns ?? []) as any} />

      {/* 2. Key KPI heading */}
      <div style={{ paddingTop: 8 }}>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 28,
            color: '#F0F4FF',
            lineHeight: 1,
          }}
        >
          Key KPI
        </h2>
      </div>

      {/* 3. Revenue chart (2/3) + Subscriber donut (1/3) */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <OverviewRevenueChart snapshots={snapshots ?? []} />
        </div>
        <SubscriberDonut sparkSubs={sparkSubs} twitterSubs={twitterSubs} />
      </div>

      {/* 4. SparkCheck + Twitter product cards */}
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
      </div>

      {/* 5. Finance Agents + Speech Coach cards */}
      <div className="grid grid-cols-2 gap-4">
        <LocalCard
          accentColor="#00E676"
          label="Finance Agents"
          pill="LOCAL"
          pillColor="#00E676"
          footer="4 agents configured · Mac Studio M4 Max"
          animDelay={0}
        >
          <div className="space-y-2.5 pb-2">
            {FINANCE_AGENTS.map((a) => (
              <div key={a.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: '#00E676' }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 400,
                      fontSize: 13,
                      color: '#A8B4D0',
                    }}
                  >
                    {a.label}
                  </span>
                </div>
                <span
                  className="px-1.5 py-0.5 rounded"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 400,
                    fontSize: 9,
                    color: '#5A6A8A',
                    border: '1px solid #252D45',
                    background: '#1E2540',
                  }}
                >
                  QWEN3
                </span>
              </div>
            ))}
          </div>
        </LocalCard>

        <LocalCard
          accentColor="#FFB800"
          label="Speech Coach"
          pill="LOCAL"
          pillColor="#FFB800"
          footer="1 agent configured · Mac Studio M4 Max"
          animDelay={60}
        >
          <div className="pb-2">
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 16,
                color: '#F0F4FF',
              }}
            >
              Advanced accent refinement
            </div>
            <div
              className="mt-1"
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 400,
                fontSize: 13,
                color: '#5A6A8A',
              }}
            >
              Spanish native &rarr; American English
            </div>
            <div
              className="mt-3"
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 400,
                fontSize: 11,
                color: '#5A6A8A',
              }}
            >
              Phoneme analysis &middot; Prosody training &middot; Domain drilling
            </div>
          </div>
        </LocalCard>
      </div>

      {/* 6. Agent Runs + Hermes Activity */}
      <div className="grid grid-cols-2 gap-4">
        <AgentLog initial={agentRuns ?? []} limit={5} realtime />
        <HermesFeed initial={hermesLogs ?? []} limit={5} realtime />
      </div>

      {/* 7. FL Move Progress */}
      <MrrProgressBar current={totalMrr} />

    </div>
  )
}
