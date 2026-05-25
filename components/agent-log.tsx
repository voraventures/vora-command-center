'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { AgentRun } from '@/lib/types'

interface Props {
  initial: AgentRun[]
  limit?: number
  realtime?: boolean
}

function StatusPill({ status }: { status: string }) {
  const ok = status === 'success'
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider"
      style={{
        fontFamily: 'var(--font-dm-mono)',
        background: ok ? 'oklch(0.70 0.17 155 / 0.1)' : 'oklch(0.63 0.22 25 / 0.1)',
        color: ok ? 'var(--vgreen)' : 'var(--vred)',
      }}
    >
      {status}
    </span>
  )
}

export function AgentLog({ initial, limit = 5, realtime = false }: Props) {
  const [runs, setRuns] = useState<AgentRun[]>(initial)

  useEffect(() => {
    if (!realtime) return
    const channel = supabase
      .channel('agent_runs_feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'agent_runs' },
        (payload) => {
          setRuns((prev) => [payload.new as AgentRun, ...prev].slice(0, 100))
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [realtime])

  const displayed = runs.slice(0, limit)

  return (
    <div className="rounded-lg border border-vborder overflow-hidden" style={{ background: 'oklch(0.14 0.02 255)' }}>
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-vborder"
        style={{ background: 'oklch(0.17 0.018 255)' }}
      >
        <span
          className="text-[10px] text-vmuted uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          Agent Runs
        </span>
        {realtime && (
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-vgreen animate-pulse" />
            <span
              className="text-[10px] text-vdim uppercase tracking-wide"
              style={{ fontFamily: 'var(--font-dm-mono)' }}
            >
              Live
            </span>
          </span>
        )}
      </div>

      {displayed.length === 0 ? (
        <div className="px-4 py-10 text-center">
          <div
            className="text-vmuted text-[11px]"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            No agent runs yet.
          </div>
          <div
            className="text-vdim text-[10px] mt-1"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            Start your local agent server to begin.
          </div>
        </div>
      ) : (
        <div className="divide-y divide-vborder">
          {displayed.map((run) => (
            <div
              key={run.id}
              className="px-4 py-3 flex items-center gap-3 hover:bg-vsurface transition-colors duration-100"
            >
              <div className="flex-1 min-w-0">
                <div
                  className="text-vtext text-xs truncate"
                  style={{ fontFamily: 'var(--font-dm-mono)' }}
                >
                  {run.agent_label}
                </div>
                <div
                  className="text-vdim text-[10px] mt-0.5"
                  style={{ fontFamily: 'var(--font-dm-mono)' }}
                >
                  {run.machine} &middot; {run.model}
                  {run.duration_ms ? ` &middot; ${run.duration_ms}ms` : ''}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <StatusPill status={run.status} />
                <span
                  className="text-vdim text-[10px] tabular-nums"
                  style={{ fontFamily: 'var(--font-dm-mono)' }}
                >
                  {new Date(run.ran_at).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
