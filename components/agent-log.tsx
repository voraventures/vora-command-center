'use client'

import { useEffect, useRef, useState } from 'react'
import { Bot } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AgentRun } from '@/lib/types'

interface Props {
  initial: AgentRun[]
  limit?: number
  realtime?: boolean
}

function MachinePill({ machine }: { machine: string }) {
  const isStudio = machine === 'mac_studio'
  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-[10px]"
      style={{
        fontFamily: 'var(--font-mono)',
        fontWeight: 400,
        letterSpacing: '0.05em',
        background: 'var(--vsurface2)',
        color: 'var(--vtext2)',
        border: '1px solid var(--vborder)',
      }}
    >
      {isStudio ? 'MAC STUDIO' : 'MACBOOK'}
    </span>
  )
}

function StatusPill({ status }: { status: string }) {
  const ok = status === 'success'
  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-[10px]"
      style={{
        fontFamily: 'var(--font-mono)',
        fontWeight: 400,
        letterSpacing: '0.08em',
        background: ok ? 'rgba(0,230,118,0.12)' : 'rgba(255,68,68,0.12)',
        color: ok ? '#00E676' : '#FF4444',
      }}
    >
      {status.toUpperCase()}
    </span>
  )
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function Row({ run, isNew, delay }: { run: AgentRun; isNew?: boolean; delay?: number }) {
  return (
    <tr
      className={isNew ? 'animate-slide-in-left' : 'animate-fade-up'}
      style={{
        borderBottom: '1px solid var(--vborder)',
        animationDelay: delay != null ? `${delay}ms` : undefined,
        transition: 'background 0.1s',
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--vsurface2)')}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: run.status === 'success' ? '#00E676' : '#FF4444' }}
          />
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: 13, color: 'var(--vtext)' }}>
              {run.agent_label}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 11, color: '#A78BFA' }}>
              {run.agent_id}
            </div>
          </div>
        </div>
      </td>
      <td className="px-3 py-3"><MachinePill machine={run.machine} /></td>
      <td className="px-3 py-3">
        <span
          className="px-1.5 py-0.5 rounded border text-[10px]"
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 400,
            color: '#A78BFA',
            borderColor: 'var(--vborder)',
            background: 'var(--vsurface2)',
          }}
        >
          {run.model}
        </span>
      </td>
      <td className="px-3 py-3" style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 11, color: '#A78BFA' }}>
        {run.duration_ms != null ? `${run.duration_ms}ms` : '—'}
      </td>
      <td className="px-3 py-3"><StatusPill status={run.status} /></td>
      <td className="px-3 py-3" style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 11, color: '#A78BFA' }}>
        {timeAgo(run.ran_at)}
      </td>
    </tr>
  )
}

export function AgentLog({ initial, limit = 5, realtime = false }: Props) {
  const [runs, setRuns] = useState<(AgentRun & { _isNew?: boolean })[]>(initial)
  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true
    if (!realtime) return
    const channel = supabase
      .channel('agent_runs_feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'agent_runs' }, (payload) => {
        setRuns((prev) => [{ ...(payload.new as AgentRun), _isNew: true }, ...prev].slice(0, 200))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [realtime])

  const displayed = runs.slice(0, limit)

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ background: 'var(--vsurface)', borderColor: 'var(--vborder)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--vborder)', background: 'var(--vsurface2)' }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 500,
            fontSize: 10,
            color: '#A78BFA',
            letterSpacing: '0.3em',
          }}
        >
          AGENT RUNS
        </span>
        {realtime && (
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: '#00E676' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: '#00E676', letterSpacing: '0.05em' }}>
              LIVE
            </span>
          </span>
        )}
      </div>

      {displayed.length === 0 ? (
        <div
          className="mx-4 my-6 flex flex-col items-center justify-center py-10 rounded-lg border border-dashed"
          style={{ borderColor: 'var(--vborder2)' }}
        >
          <Bot className="w-8 h-8 mb-3" style={{ color: 'var(--vdim)' }} />
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--vtext2)' }}>
            No agent runs yet
          </div>
          <div className="mt-1" style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 11, color: '#A78BFA' }}>
            Start your local Hermes server to begin
          </div>
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--vborder)', background: 'var(--vsurface2)' }}>
              {['Agent', 'Machine', 'Model', 'Duration', 'Status', 'Time'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2 text-left"
                  style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: '#A78BFA', letterSpacing: '0.1em' }}
                >
                  {h.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.map((run, i) => (
              <Row
                key={run.id}
                run={run}
                isNew={run._isNew}
                delay={run._isNew ? undefined : i * 50}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
