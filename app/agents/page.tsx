'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { AgentRun } from '@/lib/types'

const VORA_AGENTS = [
  { id: 'finance-intel',     label: 'Market Intelligence', tag: 'finance', machine: 'mac_studio', model: 'qwen3:14b', color: '#059669' },
  { id: 'finance-portfolio', label: 'Portfolio Strategist', tag: 'finance', machine: 'mac_studio', model: 'qwen3:14b', color: '#059669' },
  { id: 'finance-savings',   label: 'Savings Optimizer',   tag: 'finance', machine: 'mac_studio', model: 'qwen3:14b', color: '#059669' },
  { id: 'finance-crypto',    label: 'Crypto & Alt Assets', tag: 'finance', machine: 'mac_studio', model: 'qwen3:14b', color: '#059669' },
  { id: 'speech-coach',      label: 'Speech Coach',        tag: 'speech',  machine: 'mac_studio', model: 'qwen3:14b', color: '#D97706' },
]
const ORALIVA_AGENTS = [
  { id: 'oraliva-1', label: 'OraLiva Core',     tag: 'speech', machine: 'macbook', model: 'oraliva-v2', color: '#D97706' },
  { id: 'oraliva-2', label: 'OraLiva Phoneme',  tag: 'speech', machine: 'macbook', model: 'oraliva-v2', color: '#D97706' },
  { id: 'oraliva-3', label: 'OraLiva Prosody',  tag: 'speech', machine: 'macbook', model: 'oraliva-v2', color: '#D97706' },
  { id: 'oraliva-4', label: 'OraLiva Fluency',  tag: 'speech', machine: 'macbook', model: 'oraliva-v2', color: '#D97706' },
  { id: 'oraliva-5', label: 'OraLiva Coach',    tag: 'speech', machine: 'macbook', model: 'oraliva-v2', color: '#D97706' },
]

type Filter = 'all' | 'vora' | 'oraliva' | 'mac_studio' | 'macbook'

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
        borderTop: `3px solid ${agent.color}`,
        opacity: remote ? 0.65 : 1,
        animationDelay: `${delay}ms`,
      }}
    >
      <span className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: agent.color }} />
      <div className="flex-1 min-w-0">
        <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 500, fontSize: 12, color: 'var(--vtext)' }}>
          {agent.label}
        </div>
        <div className="mt-0.5" style={{ fontFamily: 'var(--font-syne)', fontWeight: 400, fontSize: 10, color: 'var(--vmuted)' }}>
          {agent.machine} &middot; {agent.model}
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <span
            className="px-1.5 py-0.5 rounded text-[9px]"
            style={{ fontFamily: 'var(--font-syne)', fontWeight: 400, background: `${agent.color}18`, color: agent.color, letterSpacing: '0.05em' }}
          >
            {agent.tag}
          </span>
          {remote && (
            <span
              className="px-1.5 py-0.5 rounded border text-[9px]"
              style={{ fontFamily: 'var(--font-syne)', fontWeight: 400, color: 'var(--vdim)', borderColor: 'var(--vborder)' }}
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
  const isStudio = machine === 'mac_studio'
  return (
    <span className="inline-block px-2 py-0.5 rounded text-[10px]"
      style={{
        fontFamily: 'var(--font-syne)', fontWeight: 400, letterSpacing: '0.05em',
        background: isStudio ? 'var(--vtext)' : 'transparent',
        color: isStudio ? '#0D1117' : 'var(--vtext2)',
        border: isStudio ? 'none' : '1px solid var(--vborder2)',
      }}
    >
      {isStudio ? 'MAC STUDIO' : 'MACBOOK'}
    </span>
  )
}

export default function AgentsPage() {
  const [runs, setRuns] = useState<(AgentRun & { _isNew?: boolean })[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
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

  const showVora     = filter === 'all' || filter === 'vora'     || filter === 'mac_studio'
  const showOraLiva  = filter === 'all' || filter === 'oraliva'  || filter === 'macbook'

  const filteredRuns = runs.filter((r) => {
    if (filter === 'mac_studio' && r.machine !== 'mac_studio') return false
    if (filter === 'macbook'    && r.machine !== 'macbook')    return false
    if (statusFilter !== 'all'  && r.status  !== statusFilter) return false
    return true
  })

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all',        label: 'All' },
    { key: 'vora',       label: 'Vora Ventures' },
    { key: 'oraliva',    label: 'OraLiva' },
    { key: 'mac_studio', label: 'Mac Studio' },
    { key: 'macbook',    label: 'MacBook' },
  ]

  return (
    <div className="space-y-7 max-w-6xl">
      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="px-3 py-1.5 rounded-full text-[11px] transition-all duration-100 outline-none"
            style={{
              fontFamily: 'var(--font-syne)',
              fontWeight: 400,
              background: filter === key ? 'var(--vsurface2)' : 'transparent',
              color: filter === key ? 'var(--vtext)' : 'var(--vmuted)',
              border: `1px solid ${filter === key ? 'var(--vborder2)' : 'var(--vborder)'}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Vora Ventures agents */}
      {showVora && (
        <section>
          <div
            className="flex items-center gap-2 mb-3"
            style={{ fontFamily: 'var(--font-syne)', fontWeight: 400, fontSize: 10, color: 'var(--vmuted)', letterSpacing: '0.2em' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#059669' }} />
            VORA VENTURES &mdash; MAC STUDIO M4 MAX &mdash; {VORA_AGENTS.length} AGENTS
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {VORA_AGENTS.map((a, i) => <AgentCard key={a.id} agent={a} delay={i * 40} />)}
          </div>
        </section>
      )}

      {/* OraLiva agents */}
      {showOraLiva && (
        <section>
          <div
            className="flex items-center gap-2 mb-3"
            style={{ fontFamily: 'var(--font-syne)', fontWeight: 400, fontSize: 10, color: 'var(--vmuted)', letterSpacing: '0.2em' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#D97706' }} />
            ORALIVA &mdash; MACBOOK &mdash; REMOTE &mdash; {ORALIVA_AGENTS.length} AGENTS
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {ORALIVA_AGENTS.map((a, i) => <AgentCard key={a.id} agent={a} remote delay={i * 40} />)}
          </div>
        </section>
      )}

      {/* Run log */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div
            style={{ fontFamily: 'var(--font-syne)', fontWeight: 400, fontSize: 10, color: 'var(--vmuted)', letterSpacing: '0.2em' }}
          >
            RUN LOG &mdash; REAL-TIME
          </div>
          <div className="flex items-center gap-1.5">
            {(['all', 'success', 'error'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setStatusFilter(v)}
                className="px-2.5 py-1 rounded-full text-[11px] transition-all duration-100"
                style={{
                  fontFamily: 'var(--font-syne)',
                  fontWeight: 400,
                  background: statusFilter === v ? 'var(--vsurface2)' : 'transparent',
                  color: statusFilter === v ? 'var(--vtext)' : 'var(--vmuted)',
                  border: `1px solid ${statusFilter === v ? 'var(--vborder2)' : 'var(--vborder)'}`,
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
              <tr style={{ borderBottom: '1px solid var(--vborder)', background: 'var(--vbg)' }}>
                {['Status', 'Agent', 'Machine', 'Model', 'Duration', 'Time'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left"
                    style={{ fontFamily: 'var(--font-syne)', fontWeight: 400, fontSize: 10, color: 'var(--vdim)', letterSpacing: '0.1em' }}
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
                    style={{ fontFamily: 'var(--font-syne)', fontWeight: 400, fontSize: 12, color: 'var(--vdim)' }}
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
                    <span className="inline-block px-2 py-0.5 rounded text-[10px]"
                      style={{
                        fontFamily: 'var(--font-syne)', fontWeight: 400, letterSpacing: '0.08em',
                        background: run.status === 'success' ? 'rgba(5,150,105,0.15)' : 'rgba(220,38,38,0.15)',
                        color: run.status === 'success' ? '#059669' : '#DC2626',
                      }}
                    >
                      {run.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div style={{ fontFamily: 'var(--font-syne)', fontSize: 12, fontWeight: 500, color: 'var(--vtext)' }}>{run.agent_label}</div>
                    <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 400, fontSize: 10, color: 'var(--vmuted)' }}>{run.agent_id}</div>
                  </td>
                  <td className="px-4 py-3"><MachinePill machine={run.machine} /></td>
                  <td className="px-4 py-3">
                    <span className="px-1.5 py-0.5 rounded border text-[10px]"
                      style={{ fontFamily: 'var(--font-syne)', fontWeight: 400, color: 'var(--vmuted)', borderColor: 'var(--vborder)', background: 'var(--vbg)' }}
                    >
                      {run.model}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ fontFamily: 'var(--font-syne)', fontWeight: 400, fontSize: 11, color: 'var(--vmuted)' }}>
                    {run.duration_ms != null ? `${run.duration_ms}ms` : '—'}
                  </td>
                  <td className="px-4 py-3" style={{ fontFamily: 'var(--font-syne)', fontWeight: 400, fontSize: 11, color: 'var(--vdim)' }}>
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
