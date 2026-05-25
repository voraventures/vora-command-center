'use client'

import { useEffect, useState } from 'react'
import { AgentLog } from '@/components/agent-log'
import { HermesFeed } from '@/components/hermes-feed'
import { StatStrip } from '@/components/stat-strip'
import { TokenUsage } from '@/components/token-usage'
import { GitBranch, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const VORA_AGENTS = [
  { id: 'finance-market',    label: 'Market Intelligence',  model: 'CLAUDE', color: '#00E676' },
  { id: 'finance-portfolio', label: 'Portfolio Strategist', model: 'CLAUDE', color: '#00B4D8' },
  { id: 'finance-savings',   label: 'Savings Optimizer',    model: 'QWEN3',  color: '#FFB800' },
  { id: 'finance-crypto',    label: 'Crypto & Alt Assets',  model: 'CLAUDE', color: '#FF6B35' },
  { id: 'speech-coach',      label: 'Speech Coach',         model: 'QWEN3',  color: '#FF4D8D' },
]
const ORALIVA_AGENTS = [
  { id: 'email',    label: 'Email Agent',             model: 'QWEN3',       color: '#9C6FFF' },
  { id: 'tasks',    label: 'Task & Assignment Agent',  model: 'QWEN3',      color: '#7B61FF' },
  { id: 'social',   label: 'OraLiva Social Agent',    model: 'QWEN3',       color: '#1D9BF0' },
  { id: 'cap',      label: 'CAP Inspection Agent',    model: 'CLAUDE CODE', color: '#FF4444' },
  { id: 'research', label: 'Research Agent',           model: 'CLAUDE CODE', color: '#00E5CC' },
]

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)    return `${diff}s ago`
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function activityLevel(lastRun: string | undefined): 'hot' | 'warm' | 'idle' {
  if (!lastRun) return 'idle'
  const age = Date.now() - new Date(lastRun).getTime()
  if (age < 3_600_000)  return 'hot'
  if (age < 86_400_000) return 'warm'
  return 'idle'
}

function PacmanAgent({ color, level }: { color: string; level: 'hot' | 'warm' | 'idle' }) {
  const isActive = level !== 'idle'
  const speed = level === 'hot' ? '0.3s' : '0.8s'
  return (
    <div style={{ position: 'relative', width: 22, height: 22, flexShrink: 0, opacity: level === 'idle' ? 0.22 : 1 }}>
      <div style={{
        position: 'absolute', width: 22, height: 11,
        background: color, borderRadius: '11px 11px 0 0', top: 0,
        transformOrigin: '50% 100%',
        transform: isActive ? undefined : 'rotate(20deg)',
        animation: isActive ? `pacChompTop ${speed} ease-in-out infinite` : 'none',
      }} />
      <div style={{
        position: 'absolute', width: 22, height: 11,
        background: color, borderRadius: '0 0 11px 11px', bottom: 0,
        transformOrigin: '50% 0%',
        transform: isActive ? undefined : 'rotate(-20deg)',
        animation: isActive ? `pacChompBottom ${speed} ease-in-out infinite` : 'none',
      }} />
      <div style={{
        position: 'absolute', width: 3, height: 3, borderRadius: '50%',
        background: 'rgba(0,0,0,0.65)', top: 4, left: 5, zIndex: 2,
      }} />
    </div>
  )
}

function AgentTicker({ run }: { run: any }) {
  if (!run) return (
    <div style={{ height: 36, display: 'flex', alignItems: 'center', paddingLeft: 4, gap: 8 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--vdim)' }}>
        Waiting for agent activity...
      </span>
    </div>
  )
  const modelColor = (run.model ?? '').includes('claude') ? '#FF4D8D' : '#00E676'
  return (
    <div
      className="animate-slide-in-right"
      style={{
        height: 36, display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 4,
      }}
    >
      <span style={{ color: '#00E676', fontSize: 10 }}>●</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--vtext2)' }}>
        {run.agent_label}
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--vmuted)' }}>
        ran {timeAgo(run.ran_at)} via
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: modelColor }}>
        {run.model}
      </span>
    </div>
  )
}

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
      style={{ background: '#161B2E', border: '1px solid #252D45', borderRadius: 12, animationDelay: '300ms' }}
    >
      <div style={{ padding: '24px 28px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: '#A78BFA', letterSpacing: '0.25em' }}>
          FL MOVE PROGRESS
        </div>
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span className="tabular-nums" style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 48, color: '#00E676', lineHeight: 1 }}>
            ${current.toLocaleString()}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 14, color: '#A78BFA' }}>
            / $5,000 MRR
          </span>
        </div>
        <div style={{ marginTop: 20, position: 'relative' }}>
          <div style={{ height: 8, borderRadius: 4, background: '#252D45', position: 'relative', overflow: 'visible' }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, bottom: 0,
              width: `${pct}%`, borderRadius: 4,
              background: 'linear-gradient(90deg, #00E676, #9C6FFF)',
              animation: 'progressFill 1200ms cubic-bezier(0.4, 0, 0.2, 1) both',
            }} />
            {milestones.map((m, i) => (
              <div
                key={m.value}
                style={{
                  position: 'absolute', left: `${m.pct}%`, top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 12, height: 12, borderRadius: '50%',
                  background: current >= m.value ? '#00E676' : '#161B2E',
                  border: `2px solid ${current >= m.value ? '#00E676' : '#2F3A58'}`,
                  zIndex: 1,
                  animation: `milestoneIn 200ms ease-out ${800 + i * 60}ms both`,
                }}
              />
            ))}
          </div>
          <div style={{ position: 'relative', marginTop: 12, height: 16 }}>
            {milestones.map((m) => (
              <div key={m.value} style={{ position: 'absolute', left: `${m.pct}%`, transform: m.pct === 100 ? 'translateX(-100%)' : m.pct === 0 ? 'none' : 'translateX(-50%)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: current >= m.value ? '#00E676' : '#A78BFA' }}>
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 12, color: '#A78BFA', marginTop: 20 }}>
          {pct.toFixed(1)}% to Florida.{' '}
          <span style={{ color: '#A8B4D0' }}>${(target - current).toLocaleString()} remaining.</span>
          {estMonths ? ` Est. arrival: ~${estMonths}mo` : ''}
        </div>
      </div>
    </div>
  )
}

export default function OverviewPage() {
  const [snapshots,   setSnapshots]   = useState<any[]>([])
  const [agentRuns,   setAgentRuns]   = useState<any[]>([])
  const [hermesLogs,  setHermesLogs]  = useState<any[]>([])
  const [tokenRuns,   setTokenRuns]   = useState<any[]>([])
  const [agentCount,  setAgentCount]  = useState(0)
  const [hermesCount, setHermesCount] = useState(0)
  const [tickerRun,   setTickerRun]   = useState<any>(null)
  const [projectsExpanded, setProjectsExpanded] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const since24h = new Date(Date.now() - 86400000).toISOString()
      const [
        { data: _snaps },
        { data: _runs },
        { data: _hermes },
        { data: _tokens },
        { count: _agentCt },
        { count: _hermesCt },
      ] = await Promise.all([
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
      setSnapshots(_snaps ?? [])
      setAgentRuns(_runs ?? [])
      setHermesLogs(_hermes ?? [])
      setTokenRuns(_tokens ?? [])
      setAgentCount(_agentCt ?? 0)
      setHermesCount(_hermesCt ?? 0)
      if (_runs && _runs.length > 0) setTickerRun(_runs[0])
      setLoading(false)
    }
    load()

    const ch = supabase
      .channel('overview_ticker')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'agent_runs' }, (p) => {
        setTickerRun(p.new)
        setAgentRuns((prev) => [p.new as any, ...prev])
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  // Derived data
  const productIds = ['sparkcheck', 'twitter_growth_optimizer']
  const latestByProduct = productIds.map((id) => {
    const snaps = snapshots.filter((s) => s.product === id)
    return { id, latest: snaps[snaps.length - 1], prev: snaps[snaps.length - 2] }
  })
  const totalMrr  = latestByProduct.reduce((s, { latest }) => s + (latest?.mrr_usd ?? 0), 0)
  const totalSubs = latestByProduct.reduce((s, { latest }) => s + (latest?.subscriber_count ?? 0), 0)
  const prevSubs  = latestByProduct.reduce((s, { prev }) => s + (prev?.subscriber_count ?? 0), 0)
  const subsDelta = totalSubs - prevSubs
  const pctToTarget = Math.min((totalMrr / 5000) * 100, 100)

  const mrrByDate = new Map<string, { mrr: number; subs: number }>()
  for (const s of snapshots) {
    const d = new Date(s.recorded_at).toDateString()
    const curr = mrrByDate.get(d) ?? { mrr: 0, subs: 0 }
    mrrByDate.set(d, { mrr: curr.mrr + s.mrr_usd, subs: curr.subs + s.subscriber_count })
  }
  const sortedDates   = Array.from(mrrByDate.values())
  const mrrSparkline  = sortedDates.slice(-7).map((d) => d.mrr)
  const subsSparkline = sortedDates.slice(-7).map((d) => d.subs)

  const mrrGrowthThisPeriod = latestByProduct.reduce((s, { latest, prev }) =>
    s + ((latest?.mrr_usd ?? 0) - (prev?.mrr_usd ?? 0)), 0)
  const remaining = Math.max(0, 5000 - totalMrr)
  const estMonths = mrrGrowthThisPeriod > 0 ? Math.ceil(remaining / mrrGrowthThisPeriod) : null

  // Use 500 token runs for comprehensive last-run lookup
  const lastRunByAgent = tokenRuns.reduce<Record<string, string>>((acc, r) => {
    if (!acc[r.agent_id]) acc[r.agent_id] = r.ran_at
    return acc
  }, {})

  const sparkLatest   = latestByProduct.find(x => x.id === 'sparkcheck')?.latest
  const twitterLatest = latestByProduct.find(x => x.id === 'twitter_growth_optimizer')?.latest

  return (
    <div className="space-y-10 max-w-6xl">
      <style>{`
        .overview-project-row:hover { background: var(--vsurface2); }
        .overview-agent-row:hover   { background: var(--vsurface2); }
      `}</style>

      {/* SECTION 01 — REVENUE INTELLIGENCE */}
      <section className="space-y-4 animate-fade-up" style={{ animationDelay: '0ms' }}>
        <SectionHeader n="01" title="Revenue Intelligence" subtitle="Florida move progress · MRR tracking" />
        <StatStrip
          totalMrr={totalMrr}
          totalSubs={totalSubs}
          agentCount={agentCount}
          hermesCount={hermesCount}
          subsDelta={subsDelta}
          pctToTarget={pctToTarget}
          mrrSparkline={mrrSparkline}
          subsSparkline={subsSparkline}
        />
        <MrrProgressBar current={totalMrr} estMonths={estMonths} />
      </section>

      <div style={{ paddingBottom: 12 }} />

      {/* SECTION 02 — PROJECTS (collapsible, collapsed by default) */}
      <section className="space-y-4 animate-fade-up" style={{ animationDelay: '100ms' }}>

        {/* Collapsible header */}
        <div style={{ marginBottom: 20 }}>
          <div
            className="flex items-center justify-between"
            style={{ paddingBottom: 14, cursor: 'pointer', userSelect: 'none' }}
            onClick={() => setProjectsExpanded((e) => !e)}
          >
            <div className="flex items-center gap-3">
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: '#9C6FFF', letterSpacing: '0.15em' }}>02</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--vtext)', margin: 0, lineHeight: 1 }}>Projects</h2>
              <span style={{
                fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: 9,
                background: 'rgba(156,111,255,0.12)', color: '#9C6FFF',
                padding: '2px 6px', borderRadius: 4, letterSpacing: '0.1em',
              }}>3 TOTAL</span>
            </div>
            <div className="flex items-center gap-3">
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 11, color: 'var(--vmuted)' }}>
                Active products · {projectsExpanded ? 'click to collapse' : 'click to expand'}
              </span>
              {projectsExpanded
                ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--vmuted)' }} />
                : <ChevronDown className="w-4 h-4" style={{ color: 'var(--vmuted)' }} />
              }
            </div>
          </div>
          <div style={{ borderBottom: '1px solid var(--vborder)' }} />
        </div>

        {/* Collapsible content */}
        <div style={{
          overflow: 'hidden',
          maxHeight: projectsExpanded ? '600px' : 0,
          transition: 'max-height 300ms ease',
        }}>
          <div style={{ background: 'var(--vsurface)', border: '1px solid var(--vborder)', borderRadius: 12 }}>

            {/* SparkCheck row */}
            <div
              className="overview-project-row animate-slide-in-left"
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0 20px', minHeight: 52,
                borderBottom: '1px solid var(--vborder)', transition: 'background 0.15s',
                animationDelay: '120ms',
              }}
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full animate-pill-pulse" style={{ background: '#FF4D8D', flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--vtext)' }}>SparkCheck</span>
                <span className="px-1.5 py-0.5 rounded" style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 9, background: 'rgba(255,77,141,0.12)', color: '#FF4D8D', letterSpacing: '0.1em' }}>ACTIVE</span>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: 13, color: '#FF4D8D', width: 80, textAlign: 'right' }}>
                  ${(sparkLatest?.mrr_usd ?? 0).toLocaleString()}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 11, color: 'var(--vmuted)', width: 56, textAlign: 'right' }}>
                  {(sparkLatest?.subscriber_count ?? 0)} subs
                </span>
                <GitBranch className="w-3.5 h-3.5 overview-icon" />
                <ExternalLink className="w-3.5 h-3.5 overview-icon ext-link-icon" />
              </div>
            </div>

            {/* Twitter Growth row */}
            <div
              className="overview-project-row animate-slide-in-left"
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0 20px', minHeight: 52,
                borderBottom: '1px solid var(--vborder)', transition: 'background 0.15s',
                animationDelay: '170ms',
              }}
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full animate-pill-pulse" style={{ background: '#1D9BF0', flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--vtext)' }}>Twitter Growth Optimizer</span>
                <span className="px-1.5 py-0.5 rounded" style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 9, background: 'rgba(29,155,240,0.12)', color: '#1D9BF0', letterSpacing: '0.1em' }}>ACTIVE</span>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: 13, color: '#1D9BF0', width: 80, textAlign: 'right' }}>
                  ${(twitterLatest?.mrr_usd ?? 0).toLocaleString()}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 11, color: 'var(--vmuted)', width: 56, textAlign: 'right' }}>
                  {(twitterLatest?.subscriber_count ?? 0)} subs
                </span>
                <GitBranch className="w-3.5 h-3.5 overview-icon" />
                <ExternalLink className="w-3.5 h-3.5 overview-icon ext-link-icon" />
              </div>
            </div>

            {/* Aguacate AI row */}
            <div
              className="overview-project-row animate-slide-in-left"
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0 20px', minHeight: 52,
                borderBottom: '1px solid var(--vborder)', transition: 'background 0.15s', opacity: 0.6,
                animationDelay: '220ms',
              }}
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full" style={{ background: '#9C6FFF', flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--vtext)' }}>Aguacate AI</span>
                <span className="px-2 py-0.5 rounded" style={{
                  fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: 9,
                  background: 'rgba(156,111,255,0.15)', color: '#9C6FFF',
                  letterSpacing: '0.12em', border: '1px solid rgba(156,111,255,0.25)',
                }}>IN DEVELOPMENT</span>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: 13, color: 'var(--vmuted)', width: 80, textAlign: 'right' }}>—</span>
                <span style={{ width: 56 }} />
                <GitBranch className="w-3.5 h-3.5 overview-icon" />
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '12px 20px', display: 'flex', gap: 32 }}>
              {['Last deploy: —', 'Last deploy: —', 'Last deploy: —'].map((text, i) => (
                <span key={i} style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: 'var(--vmuted)' }}>{text}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div style={{ paddingBottom: 12 }} />

      {/* SECTION 03 — AGENTS */}
      <section className="space-y-4 animate-fade-up" style={{ animationDelay: '200ms' }}>
        <SectionHeader n="03" title="Agents" subtitle="Mac Studio · MacBook remote" />

        {/* Live ticker */}
        <div style={{ background: 'var(--vsurface)', border: '1px solid var(--vborder)', borderRadius: 8, paddingLeft: 16, paddingRight: 16, borderLeft: '2px solid #00E676', overflow: 'hidden' }}>
          <div className="flex items-center gap-3" style={{ borderBottom: '1px solid var(--vborder)', paddingBottom: 0 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 9, color: '#00E676', letterSpacing: '0.2em' }}>LATEST RUN</span>
            <div className="flex-1">
              <AgentTicker key={tickerRun?.id ?? 'init'} run={tickerRun} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">

          {/* Mac Studio card */}
          <div style={{ background: 'var(--vsurface)', border: '1px solid var(--vborder)', borderLeft: '3px solid #00E676', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--vborder)', fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: '#00E676', letterSpacing: '0.15em' }}>
              MAC STUDIO — PORT 8001
            </div>
            {VORA_AGENTS.map((a, i) => {
              const lastRun = lastRunByAgent[a.id]
              const level = activityLevel(lastRun)
              return (
                <div
                  key={a.id}
                  className="overview-agent-row animate-fade-up"
                  style={{
                    padding: '0 20px', minHeight: 52,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    borderBottom: '1px solid var(--vborder)', transition: 'background 0.15s',
                    animationDelay: `${220 + i * 40}ms`,
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <PacmanAgent color={a.color} level={level} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 12, color: 'var(--vtext)' }}>{a.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: 'var(--vmuted)', width: 52, textAlign: 'right' }}>
                      {lastRun ? timeAgo(lastRun) : '—'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded" style={{ border: '1px solid var(--vborder)', background: 'var(--vsurface2)', fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 9, color: 'var(--vmuted)' }}>
                      {a.model}
                    </span>
                  </div>
                </div>
              )
            })}
            <div style={{ padding: '10px 20px', fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: 'var(--vmuted)' }}>
              5 agents · Mac Studio M4 Max
            </div>
          </div>

          {/* MacBook / OraLiva card */}
          <div style={{ background: 'var(--vsurface)', border: '1px solid var(--vborder)', borderLeft: '3px solid #9C6FFF', borderRadius: 12, overflow: 'hidden', opacity: 0.75 }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--vborder)', fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: '#9C6FFF', letterSpacing: '0.15em' }}>
              ORALIVA — MACBOOK — REMOTE
            </div>
            {ORALIVA_AGENTS.map((a, i) => {
              const lastRun = lastRunByAgent[a.id]
              const level = activityLevel(lastRun)
              return (
                <div
                  key={a.id}
                  className="overview-agent-row animate-fade-up"
                  style={{
                    padding: '0 20px', minHeight: 52,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    borderBottom: '1px solid var(--vborder)', transition: 'background 0.15s',
                    animationDelay: `${220 + i * 40}ms`,
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <PacmanAgent color={a.color} level={level} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 12, color: 'var(--vtext)' }}>{a.label}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: 'var(--vmuted)', width: 52, textAlign: 'right' }}>
                      {lastRun ? timeAgo(lastRun) : '—'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded" style={{ border: '1px solid var(--vborder)', background: 'var(--vsurface2)', fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 9, color: 'var(--vmuted)' }}>
                      {a.model}
                    </span>
                    <span className="px-1.5 py-0.5 rounded" style={{ border: '1px solid var(--vborder2)', background: 'var(--vsurface2)', fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: 9, color: 'var(--vtext2)', letterSpacing: '0.05em' }}>
                      REMOTE
                    </span>
                  </div>
                </div>
              )
            })}
            <div style={{ padding: '10px 20px', fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: 'var(--vmuted)' }}>
              5 agents · MacBook
            </div>
          </div>
        </div>
      </section>

      <div style={{ paddingBottom: 12 }} />

      {/* SECTION 04 — INTELLIGENCE */}
      <section className="space-y-4 animate-fade-up" style={{ animationDelay: '300ms' }}>
        <SectionHeader n="04" title="Intelligence" subtitle="Live activity · real-time" />
        <div className="grid grid-cols-2 gap-4">
          {loading
            ? <>
                <div className="skeleton rounded-lg" style={{ height: 240 }} />
                <div className="skeleton rounded-lg" style={{ height: 240 }} />
              </>
            : <>
                <AgentLog key="loaded" initial={agentRuns.slice(0, 5)} limit={5} realtime />
                <HermesFeed key="loaded-h" initial={hermesLogs.slice(0, 5)} limit={5} realtime />
              </>
          }
        </div>
      </section>

      <div style={{ paddingBottom: 12 }} />

      {/* SECTION 05 — SYSTEM */}
      <section className="space-y-4 animate-fade-up" style={{ animationDelay: '400ms' }}>
        <SectionHeader n="05" title="System" subtitle="Token usage · API costs" />
        <TokenUsage key={loading ? 'loading' : 'loaded'} initialRuns={tokenRuns as any} />
        <div className="flex items-center gap-6 flex-wrap" style={{ marginTop: 16, paddingLeft: 4 }}>
          {[
            'Ollama · qwen3:latest',
            'Claude API · claude-sonnet-4-20250514',
            'Supabase · connected',
            'Agent Server · port 8001',
          ].map((text) => (
            <div key={text} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full animate-pulse-dot flex-shrink-0" style={{ background: '#00E676' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 11, color: 'var(--vtext2)' }}>{text}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
