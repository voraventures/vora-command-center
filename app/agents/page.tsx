'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { AgentRun } from '@/lib/types'

const VORA_AGENTS = [
  { id: 'finance-market',    label: 'Market Intelligence', tag: 'FINANCE', machine: 'mac_studio', model: 'claude-api',    color: '#00E676' },
  { id: 'finance-portfolio', label: 'Portfolio Strategist', tag: 'FINANCE', machine: 'mac_studio', model: 'claude-api',    color: '#00E676' },
  { id: 'finance-savings',   label: 'Savings Optimizer',   tag: 'FINANCE', machine: 'mac_studio', model: 'qwen3:latest',  color: '#00E676' },
  { id: 'finance-crypto',    label: 'Crypto & Alt Assets', tag: 'FINANCE', machine: 'mac_studio', model: 'claude-api',    color: '#00E676' },
  { id: 'speech-coach',      label: 'Speech Coach',        tag: 'PERSONAL', machine: 'mac_studio', model: 'qwen3:latest', color: '#FFB800' },
]
const ORALIVA_AGENTS = [
  { id: 'email',    label: 'Email Agent',            tag: 'COMMUNICATIONS', machine: 'macbook', model: 'qwen3:latest', color: '#9C6FFF' },
  { id: 'tasks',    label: 'Task & Assignment Agent', tag: 'OPERATIONS',    machine: 'macbook', model: 'qwen3:latest', color: '#9C6FFF' },
  { id: 'social',   label: 'OraLiva Social Agent',   tag: 'SOCIAL MEDIA',   machine: 'macbook', model: 'qwen3:latest', color: '#9C6FFF' },
  { id: 'cap',      label: 'CAP Inspection Agent',   tag: 'COMPLIANCE',     machine: 'macbook', model: 'claude_code',  color: '#9C6FFF' },
  { id: 'research', label: 'Research Agent',          tag: 'RESEARCH',       machine: 'macbook', model: 'claude_code',  color: '#9C6FFF' },
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

function AgentCard({
  agent,
  remote = false,
  delay = 0,
}: {
  agent: typeof VORA_AGENTS[0]
  remote?: boolean
  delay?: number
}) {
  return (
    <div
      className="card-hover rounded-lg border animate-fade-up flex items-start gap-3 p-4"
      style={{
        background: 'var(--vsurface)',
        borderColor: 'var(--vborder)',
        borderLeft: `3px solid ${agent.color}`,
        opacity: remote ? 0.65 : 1,
        animationDelay: `${delay}ms`,
        transition: 'background 0.15s ease-out, box-shadow 0.15s ease-out, transform 0.15s ease-out',
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--vsurface2)')}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--vsurface)')}
    >
      <span className="w-2 h-2 rounded-full mt-1 flex-shrink-0 animate-pulse-dot" style={{ background: agent.color }} />
      <div className="flex-1 min-w-0">
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--vtext)' }}>
          {agent.label}
        </div>
        <div className="mt-0.5" style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: 'var(--vmuted)' }}>
          {agent.machine} &middot; {agent.model}
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <span
            className="px-1.5 py-0.5 rounded"
            style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 9, background: `${agent.color}18`, color: agent.color, letterSpacing: '0.05em' }}
          >
            {agent.tag}
          </span>
          {remote && (
            <span
              className="px-1.5 py-0.5 rounded border"
              style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 9, color: 'var(--vmuted)', borderColor: 'var(--vborder)', background: 'var(--vsurface2)' }}
            >
              REMOTE
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function MachinePill({ machine }: { machine: string }) {
  return (
    <span
      className="inline-block px-2 py-0.5 rounded"
      style={{
        fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, letterSpacing: '0.05em',
        background: 'var(--vsurface2)',
        color: 'var(--vtext2)',
        border: '1px solid var(--vborder)',
      }}
    >
      {machine === 'mac_studio' ? 'MAC STUDIO' : 'MACBOOK'}
    </span>
  )
}

export default function AgentsPage() {
  const [runs, setRuns] = useState<(AgentRun & { _isNew?: boolean })[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'error'>('all')

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('agent_runs').select('*').order('ran_at', { ascending: false }).limit(100)
      setRuns(data ?? [])
      setLoading(false)
    }
    load()
    const ch = supabase
      .channel('agents_page_rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'agent_runs' }, (p) =>
        setRuns((prev) => [{ ...(p.new as AgentRun), _isNew: true }, ...prev])
      )
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  const filteredRuns = runs.filter(r => statusFilter === 'all' || r.status === statusFilter)

  return (
    <div className="space-y-10 max-w-6xl">

      {/* SECTION 01 — MAC STUDIO AGENTS */}
      <section className="space-y-4 animate-fade-up" style={{ animationDelay: '0ms' }}>
        <SectionHeader n="01" title="Mac Studio Agents" subtitle="Vora Ventures · 5 agents · port 8001" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {VORA_AGENTS.map((a, i) => <AgentCard key={a.id} agent={a} delay={i * 40} />)}
        </div>
      </section>

      {/* SECTION 02 — ORALIVA AGENTS */}
      <section className="space-y-4 animate-fade-up" style={{ animationDelay: '100ms' }}>
        <SectionHeader n="02" title="OraLiva Agents" subtitle="Remote · MacBook · 5 agents" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {ORALIVA_AGENTS.map((a, i) => <AgentCard key={a.id} agent={a} remote delay={i * 40} />)}
        </div>
      </section>

      {/* SECTION 03 — RUN LOG */}
      <section className="space-y-4 animate-fade-up" style={{ animationDelay: '200ms' }}>
        <SectionHeader n="03" title="Run Log" subtitle="Real-time · all machines" />
        <div className="flex items-center justify-between mb-3">
          <div
            style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: 'var(--vmuted)', letterSpacing: '0.2em' }}
          >
            RUN LOG — REAL-TIME
          </div>
          <div className="flex items-center gap-1.5">
            {(['all', 'success', 'error'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setStatusFilter(v)}
                className="px-2.5 py-1 rounded-full transition-all duration-100"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 400,
                  fontSize: 11,
                  background: statusFilter === v ? 'var(--vgreen)' : 'transparent',
                  color: statusFilter === v ? 'var(--vbg)' : 'var(--vmuted)',
                  border: `1px solid ${statusFilter === v ? 'var(--vgreen)' : 'var(--vborder)'}`,
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border overflow-hidden" style={{ background: 'var(--vsurface)', borderColor: 'var(--vborder)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--vborder)', background: 'var(--vsurface2)' }}>
                {['Status', 'Agent', 'Machine', 'Model', 'Duration', 'Time'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left"
                    style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: 'var(--vmuted)', letterSpacing: '0.1em' }}
                  >
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-10">
                    <div className="flex items-center justify-center gap-3">
                      {[40, 56, 48].map((w, i) => (
                        <div key={i} className="skeleton h-2 rounded" style={{ width: w }} />
                      ))}
                    </div>
                  </td>
                </tr>
              )}
              {!loading && filteredRuns.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center"
                    style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 12, color: 'var(--vmuted)' }}
                  >
                    No runs match the current filters.
                  </td>
                </tr>
              )}
              {filteredRuns.map((run, i) => (
                <tr
                  key={run.id}
                  className={run._isNew ? 'animate-slide-in-left' : 'animate-fade-up'}
                  style={{
                    borderBottom: '1px solid var(--vborder)',
                    transition: 'background 0.1s',
                    animationDelay: run._isNew ? undefined : `${i * 30}ms`,
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--vsurface2)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                >
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 rounded"
                      style={{
                        fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, letterSpacing: '0.08em',
                        background: run.status === 'success' ? 'rgba(0,230,118,0.12)' : 'rgba(255,68,68,0.12)',
                        color: run.status === 'success' ? '#00E676' : '#FF4444',
                      }}
                    >
                      {run.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: 13, color: 'var(--vtext)' }}>{run.agent_label}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 11, color: 'var(--vmuted)' }}>{run.agent_id}</div>
                  </td>
                  <td className="px-4 py-3"><MachinePill machine={run.machine} /></td>
                  <td className="px-4 py-3">
                    <span className="px-1.5 py-0.5 rounded border"
                      style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: 'var(--vmuted)', borderColor: 'var(--vborder)', background: 'var(--vsurface2)' }}
                    >
                      {run.model}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 11, color: 'var(--vmuted)' }}>
                    {run.duration_ms != null && run.duration_ms > 0 ? `${run.duration_ms}ms` : '—'}
                  </td>
                  <td className="px-4 py-3" style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 11, color: 'var(--vdim)' }}>
                    {new Date(run.ran_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
