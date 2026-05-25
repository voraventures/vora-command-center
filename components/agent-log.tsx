'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { AgentRun } from '@/lib/types'

interface Props {
  initial: AgentRun[]
  limit?: number
  realtime?: boolean
}

export function AgentLog({ initial, limit = 5, realtime = false }: Props) {
  const [runs, setRuns] = useState<AgentRun[]>(initial)

  useEffect(() => {
    if (!realtime) return
    const channel = supabase
      .channel('agent_runs')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'agent_runs' },
        (payload) => {
          setRuns((prev) => [payload.new as AgentRun, ...prev].slice(0, 50))
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [realtime])

  const displayed = runs.slice(0, limit)

  return (
    <div className="border border-[#1E1E1E] bg-[#0F0F0F] rounded overflow-hidden">
      <div className="px-4 py-2 border-b border-[#1E1E1E]">
        <span className="font-mono text-[10px] text-zinc-500 tracking-widest uppercase">
          Agent Runs
        </span>
      </div>
      <div className="divide-y divide-[#1E1E1E]">
        {displayed.length === 0 && (
          <div className="px-4 py-6 text-center font-mono text-xs text-zinc-600">
            No runs yet
          </div>
        )}
        {displayed.map((run) => (
          <div key={run.id} className="px-4 py-2 flex items-center gap-3">
            <div
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                run.status === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <div className="flex-1 min-w-0">
              <div className="font-mono text-xs text-white truncate">
                {run.agent_label}
              </div>
              <div className="font-mono text-[10px] text-zinc-500">
                {run.machine} · {run.model}
                {run.duration_ms ? ` · ${run.duration_ms}ms` : ''}
              </div>
            </div>
            <div className="font-mono text-[10px] text-zinc-600 flex-shrink-0">
              {new Date(run.ran_at).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
