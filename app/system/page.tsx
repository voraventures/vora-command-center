'use client'

import { useState, useEffect } from 'react'
import { TokenUsage } from '@/components/token-usage'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

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

const SERVICES = [
  { label: 'Ollama',        detail: 'qwen3:latest · localhost:11434', status: 'running' },
  { label: 'Claude API',    detail: 'claude-sonnet-4-20250514',       status: 'running' },
  { label: 'Supabase',      detail: 'postgres · real-time',           status: 'running' },
  { label: 'Agent Server',  detail: 'FastAPI · localhost:8001',        status: 'running' },
  { label: 'Telegram Bot',  detail: 'Hermes interface',               status: 'running' },
]

export default function SystemPage() {
  const [agents, setAgents] = useState<any[]>([])
  const [agentsLoading, setAgentsLoading] = useState(true)
  const [agentsError, setAgentsError] = useState(false)

  useEffect(() => {
    fetch('http://localhost:8001/api/agents')
      .then(r => r.json())
      .then(data => { setAgents(Array.isArray(data) ? data : []); setAgentsLoading(false) })
      .catch(() => { setAgentsError(true); setAgentsLoading(false) })
  }, [])

  return (
    <div className="space-y-10 max-w-6xl">

      {/* Page title */}
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 32, color: 'var(--vtext)', lineHeight: 1 }}>
          System
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 12, color: 'var(--vmuted)', marginTop: 6 }}>
          Mac Studio M4 Max · local services · agent registry
        </div>
      </div>

      {/* SECTION 01 — TOKEN USAGE */}
      <section className="space-y-4">
        <SectionHeader n="01" title="Token Usage" subtitle="API costs · model breakdown" />
        <TokenUsage initialRuns={[]} />
      </section>

      {/* SECTION 02 — SERVICE STATUS */}
      <section className="space-y-4">
        <SectionHeader n="02" title="Service Status" subtitle="Mac Studio · local services" />
        <div style={{ background: 'var(--vsurface)', border: '1px solid var(--vborder)', borderRadius: 12, overflow: 'hidden' }}>
          {/* Table header */}
          <div
            className="grid"
            style={{ gridTemplateColumns: '1fr 2fr auto', padding: '12px 20px', background: 'var(--vsurface2)', borderBottom: '1px solid var(--vborder)' }}
          >
            {['SERVICE', 'DETAIL', 'STATUS'].map((h) => (
              <span key={h} style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: 'var(--vmuted)', letterSpacing: '0.1em' }}>
                {h}
              </span>
            ))}
          </div>

          {SERVICES.map((svc, i) => (
            <div
              key={svc.label}
              className="grid items-center"
              style={{
                gridTemplateColumns: '1fr 2fr auto',
                padding: '14px 20px',
                borderBottom: i < SERVICES.length - 1 ? '1px solid var(--vborder)' : undefined,
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: 13, color: 'var(--vtext)' }}>
                {svc.label}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 11, color: 'var(--vmuted)' }}>
                {svc.detail}
              </span>
              <span
                className="flex items-center gap-1.5 px-2 py-0.5 rounded"
                style={{ background: 'rgba(0,230,118,0.1)', fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: '#00E676' }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#00E676' }} />
                RUNNING
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 03 — SKILL REGISTRY */}
      <section className="space-y-4">
        <SectionHeader n="03" title="Skill Registry" subtitle="Mac Studio agent skills" />
        <div style={{ background: 'var(--vsurface)', border: '1px solid var(--vborder)', borderRadius: 12, overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ padding: '12px 20px', background: 'var(--vsurface2)', borderBottom: '1px solid var(--vborder)', display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 80px 120px', gap: 12 }}>
            {['ID', 'LABEL', 'CATEGORY', 'MODEL', 'RUNS', 'LAST RUN'].map((h) => (
              <span key={h} style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: 'var(--vmuted)', letterSpacing: '0.1em' }}>
                {h}
              </span>
            ))}
          </div>

          {agentsLoading && (
            <div>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid var(--vborder)', display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 80px 120px', gap: 12, alignItems: 'center' }}>
                  {[80, 140, 70, 70, 40, 90].map((w, j) => (
                    <div key={j} className="skeleton h-3 rounded" style={{ width: w }} />
                  ))}
                </div>
              ))}
            </div>
          )}

          {agentsError && (
            <div className="flex items-center justify-center gap-2 py-12">
              <AlertCircle className="w-4 h-4" style={{ color: 'var(--vmuted)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 12, color: 'var(--vmuted)' }}>
                Agent server offline · localhost:8001 unreachable
              </span>
            </div>
          )}

          {!agentsLoading && !agentsError && agents.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 12, color: 'var(--vmuted)' }}>
                No agents registered.
              </span>
            </div>
          )}

          {!agentsLoading && !agentsError && agents.map((agent, i) => (
            <div
              key={agent.id ?? i}
              style={{
                padding: '14px 20px',
                borderBottom: i < agents.length - 1 ? '1px solid var(--vborder)' : undefined,
                display: 'grid',
                gridTemplateColumns: '1fr 2fr 1fr 1fr 80px 120px',
                gap: 12,
                alignItems: 'center',
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--vsurface2)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 11, color: 'var(--vmuted)' }}>
                {agent.id}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: 13, color: 'var(--vtext)' }}>
                {agent.label}
              </span>
              <span className="px-1.5 py-0.5 rounded" style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 9, color: 'var(--vmuted)', border: '1px solid var(--vborder)', background: 'var(--vsurface2)', display: 'inline-block' }}>
                {agent.category}
              </span>
              <span className="px-1.5 py-0.5 rounded" style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 9, color: 'var(--vmuted)', border: '1px solid var(--vborder)', background: 'var(--vsurface2)', display: 'inline-block' }}>
                {agent.model}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 12, color: 'var(--vtext)' }}>
                {agent.run_count ?? '—'}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: 'var(--vmuted)' }}>
                {agent.last_run ? new Date(agent.last_run).toLocaleDateString() : '—'}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
