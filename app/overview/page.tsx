import { createServerClient } from '@/lib/supabase'
import { AgentLog } from '@/components/agent-log'
import { HermesFeed } from '@/components/hermes-feed'
import { StatStrip } from '@/components/stat-strip'
import { TokenUsage } from '@/components/token-usage'
import { GitBranch, ExternalLink } from 'lucide-react'

export const revalidate = 30

const VORA_AGENTS = [
  { id: 'finance-market',    label: 'Market Intelligence',  model: 'CLAUDE', color: '#00E676' },
  { id: 'finance-portfolio', label: 'Portfolio Strategist', model: 'CLAUDE', color: '#00E676' },
  { id: 'finance-savings',   label: 'Savings Optimizer',    model: 'QWEN3',  color: '#00E676' },
  { id: 'finance-crypto',    label: 'Crypto & Alt Assets',  model: 'CLAUDE', color: '#00E676' },
  { id: 'speech-coach',      label: 'Speech Coach',         model: 'QWEN3',  color: '#FFB800' },
]
const ORALIVA_AGENTS = [
  { id: 'email',    label: 'Email Agent',             model: 'QWEN3',       color: '#9C6FFF' },
  { id: 'tasks',    label: 'Task & Assignment Agent',  model: 'QWEN3',      color: '#9C6FFF' },
  { id: 'social',   label: 'OraLiva Social Agent',    model: 'QWEN3',       color: '#9C6FFF' },
  { id: 'cap',      label: 'CAP Inspection Agent',    model: 'CLAUDE CODE', color: '#9C6FFF' },
  { id: 'research', label: 'Research Agent',           model: 'CLAUDE CODE', color: '#9C6FFF' },
]

function SectionHeader({ n, title, subtitle }: { n: string; title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div className="flex items-center justify-between" style={{ paddingBottom: 14 }}>
        <div className="flex items-center gap-3">
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: '#9C6FFF', letterSpacing: '0.15em' }}>{n}</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--vtext)', margin: 0, lineHeight: 1 }}>{title}</h2>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 11, color: 'var(--vmuted)' }}>{subtitle}</span>
      </div>
      <div style={{ borderBottom: '1px solid var(--vborder)' }} />
    </div>
  )
}

function MrrProgressBar({ current, target = 5000, estMonths }: { current: number; target?: number; estMonths?: number | null }) {
  const pct = Math.min((current / target) * 100, 100)
  const milestones = [
    { value: 1000,  label: '$1K',   pct: 20 },
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
            color: '#A78BFA',
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
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 14, color: '#A78BFA' }}>
            / $5,000 MRR
          </span>
        </div>

        {/* Track */}
        <div style={{ marginTop: 20, position: 'relative' }}>
          <div style={{ height: 8, borderRadius: 4, background: '#252D45', position: 'relative', overflow: 'visible' }}>
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
                    color: current >= m.value ? '#00E676' : '#A78BFA',
                  }}
                >
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 12, color: '#A78BFA', marginTop: 20 }}
        >
          {pct.toFixed(1)}% to Florida.{' '}
          <span style={{ color: '#A8B4D0' }}>
            ${(target - current).toLocaleString()} remaining.
          </span>
          {estMonths ? ` Est. arrival: ~${estMonths}mo` : ''}
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

  // Estimate months to $5K FL target
  const mrrGrowthThisPeriod = latestByProduct.reduce((s, { latest, prev }) =>
    s + ((latest?.mrr_usd ?? 0) - (prev?.mrr_usd ?? 0)), 0)
  const remaining = Math.max(0, 5000 - totalMrr)
  const estMonths = mrrGrowthThisPeriod > 0 ? Math.ceil(remaining / mrrGrowthThisPeriod) : null

  // Last run per agent from the already-fetched agentRuns data
  const lastRunByAgent = (agentRuns ?? []).reduce<Record<string, string>>((acc, r) => {
    if (!acc[r.agent_id]) acc[r.agent_id] = r.ran_at
    return acc
  }, {})

  const sparkLatest = latestByProduct.find(x => x.id === 'sparkcheck')?.latest
  const twitterLatest = latestByProduct.find(x => x.id === 'twitter_growth_optimizer')?.latest

  return (
    <div className="space-y-10 max-w-6xl">
      <style>{`.overview-project-row:hover { background: var(--vsurface2); }`}</style>

      {/* SECTION 01 — REVENUE INTELLIGENCE */}
      <section className="space-y-4">
        <SectionHeader n="01" title="Revenue Intelligence" subtitle="Florida move progress · MRR tracking" />
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
        <MrrProgressBar current={totalMrr} estMonths={estMonths} />
      </section>

      <div style={{ paddingBottom: 12 }} />

      {/* SECTION 02 — PROJECTS */}
      <section className="space-y-4">
        <SectionHeader n="02" title="Projects" subtitle="Active products · 3 total" />
        <div style={{ background: 'var(--vsurface)', border: '1px solid var(--vborder)', borderRadius: 12 }}>
          {/* SparkCheck row */}
          <div
            className="overview-project-row"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--vborder)', transition: 'background 0.1s', cursor: 'default' }}
          >
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full" style={{ background: '#FF4D8D', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--vtext)' }}>SparkCheck</span>
              <span className="px-1.5 py-0.5 rounded" style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 9, background: 'rgba(255,77,141,0.12)', color: '#FF4D8D', letterSpacing: '0.1em' }}>ACTIVE</span>
            </div>
            <div className="flex items-center gap-4">
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: 13, color: '#FF4D8D' }}>
                ${(sparkLatest?.mrr_usd ?? 0).toLocaleString()}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 11, color: 'var(--vmuted)' }}>
                {(sparkLatest?.subscriber_count ?? 0)} subs
              </span>
              <GitBranch className="w-3.5 h-3.5" style={{ color: 'var(--vmuted)' }} />
              <ExternalLink className="w-3.5 h-3.5" style={{ color: 'var(--vmuted)' }} />
            </div>
          </div>

          {/* Twitter Growth row */}
          <div
            className="overview-project-row"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--vborder)', transition: 'background 0.1s', cursor: 'default' }}
          >
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full" style={{ background: '#1D9BF0', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--vtext)' }}>Twitter Growth Optimizer</span>
              <span className="px-1.5 py-0.5 rounded" style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 9, background: 'rgba(29,155,240,0.12)', color: '#1D9BF0', letterSpacing: '0.1em' }}>ACTIVE</span>
            </div>
            <div className="flex items-center gap-4">
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: 13, color: '#1D9BF0' }}>
                ${(twitterLatest?.mrr_usd ?? 0).toLocaleString()}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 11, color: 'var(--vmuted)' }}>
                {(twitterLatest?.subscriber_count ?? 0)} subs
              </span>
              <GitBranch className="w-3.5 h-3.5" style={{ color: 'var(--vmuted)' }} />
              <ExternalLink className="w-3.5 h-3.5" style={{ color: 'var(--vmuted)' }} />
            </div>
          </div>

          {/* Aguacate AI row */}
          <div
            className="overview-project-row"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--vborder)', transition: 'background 0.1s', cursor: 'default', opacity: 0.55 }}
          >
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full" style={{ background: '#9C6FFF', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--vtext)' }}>Aguacate AI</span>
              <span className="px-1.5 py-0.5 rounded" style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 9, background: 'rgba(156,111,255,0.12)', color: '#9C6FFF', letterSpacing: '0.1em' }}>COMING SOON</span>
            </div>
            <div className="flex items-center gap-4">
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: 13, color: 'var(--vmuted)' }}>—</span>
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--vborder)', display: 'flex', gap: 32 }}>
            {['Last deploy: —', 'Last deploy: —', 'Last deploy: —'].map((text, i) => (
              <span key={i} style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: 'var(--vmuted)' }}>{text}</span>
            ))}
          </div>
        </div>
      </section>

      <div style={{ paddingBottom: 12 }} />

      {/* SECTION 03 — AGENTS */}
      <section className="space-y-4">
        <SectionHeader n="03" title="Agents" subtitle="Mac Studio · MacBook remote" />
        <div className="grid grid-cols-2 gap-4">
          {/* Mac Studio card */}
          <div style={{ background: 'var(--vsurface)', border: '1px solid var(--vborder)', borderLeft: '3px solid #00E676', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--vborder)', fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: '#00E676', letterSpacing: '0.15em' }}>
              MAC STUDIO — PORT 8001
            </div>
            {VORA_AGENTS.map((a) => (
              <div key={a.id} style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: a.color }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 12, color: 'var(--vtext)' }}>{a.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded" style={{ border: '1px solid var(--vborder)', background: 'var(--vsurface2)', fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 9, color: 'var(--vmuted)' }}>{a.model}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: 'var(--vmuted)' }}>
                    {lastRunByAgent[a.id] ? new Date(lastRunByAgent[a.id]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </span>
                </div>
              </div>
            ))}
            <div style={{ padding: '10px 16px', borderTop: '1px solid var(--vborder)', fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: 'var(--vmuted)' }}>
              5 agents · Mac Studio M4 Max
            </div>
          </div>

          {/* MacBook / OraLiva card */}
          <div style={{ background: 'var(--vsurface)', border: '1px solid var(--vborder)', borderLeft: '3px solid #9C6FFF', borderRadius: 12, overflow: 'hidden', opacity: 0.75 }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--vborder)', fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: '#9C6FFF', letterSpacing: '0.15em' }}>
              ORALIVA — MACBOOK — REMOTE
            </div>
            {ORALIVA_AGENTS.map((a) => (
              <div key={a.id} style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: a.color }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 12, color: 'var(--vtext)' }}>{a.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded" style={{ border: '1px solid var(--vborder)', background: 'var(--vsurface2)', fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 9, color: 'var(--vmuted)' }}>{a.model}</span>
                  <span className="px-1.5 py-0.5 rounded" style={{ border: '1px solid var(--vborder)', background: 'var(--vsurface2)', fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 9, color: 'var(--vmuted)' }}>REMOTE</span>
                </div>
              </div>
            ))}
            <div style={{ padding: '10px 16px', borderTop: '1px solid var(--vborder)', fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: 'var(--vmuted)' }}>
              5 agents · MacBook
            </div>
          </div>
        </div>
      </section>

      <div style={{ paddingBottom: 12 }} />

      {/* SECTION 04 — INTELLIGENCE */}
      <section className="space-y-4">
        <SectionHeader n="04" title="Intelligence" subtitle="Live activity · real-time" />
        <div className="grid grid-cols-2 gap-4">
          <AgentLog initial={agentRuns ?? []} limit={5} realtime />
          <HermesFeed initial={hermesLogs ?? []} limit={5} realtime />
        </div>
      </section>

      <div style={{ paddingBottom: 12 }} />

      {/* SECTION 05 — SYSTEM */}
      <section className="space-y-4">
        <SectionHeader n="05" title="System" subtitle="Token usage · API costs" />
        <TokenUsage initialRuns={(tokenRuns ?? []) as any} />
        <div className="flex items-center gap-6 flex-wrap" style={{ marginTop: 16, paddingLeft: 4 }}>
          {[
            'Ollama · qwen3:latest',
            'Claude API · claude-sonnet-4-20250514',
            'Supabase · connected',
            'Agent Server · port 8001',
          ].map((text) => (
            <div key={text} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#00E676' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: 'var(--vmuted)' }}>{text}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
