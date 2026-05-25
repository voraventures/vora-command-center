'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { AgentRun } from '@/lib/types'

export default function AgentsPage() {
  const [runs, setRuns] = useState<AgentRun[]>([])
  const [machineFilter, setMachineFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('agent_runs')
        .select('*')
        .order('ran_at', { ascending: false })
        .limit(100)
      setRuns(data ?? [])
      setLoading(false)
    }
    load()

    const channel = supabase
      .channel('agents_page')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'agent_runs' },
        (payload) => setRuns((prev) => [payload.new as AgentRun, ...prev])
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const filtered = runs.filter((r) => {
    if (machineFilter && r.machine !== machineFilter) return false
    if (statusFilter && r.status !== statusFilter) return false
    return true
  })

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="font-mono text-sm font-bold tracking-widest text-white uppercase">
          Agents
        </h1>
        <p className="font-mono text-[11px] text-zinc-500 mt-1">
          Real-time agent run log
        </p>
      </div>

      <div className="flex items-center gap-3">
        {[
          { label: 'All Machines', value: '' },
          { label: 'mac_studio', value: 'mac_studio' },
          { label: 'macbook', value: 'macbook' },
        ].map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setMachineFilter(value)}
            className={`font-mono text-[11px] px-3 py-1 rounded border transition-colors ${
              machineFilter === value
                ? 'border-zinc-400 text-white'
                : 'border-[#1E1E1E] text-zinc-500 hover:border-zinc-600'
            }`}
          >
            {label}
          </button>
        ))}
        <div className="w-px h-4 bg-[#1E1E1E]" />
        {[
          { label: 'All Status', value: '' },
          { label: 'success', value: 'success' },
          { label: 'error', value: 'error' },
        ].map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={`font-mono text-[11px] px-3 py-1 rounded border transition-colors ${
              statusFilter === value
                ? 'border-zinc-400 text-white'
                : 'border-[#1E1E1E] text-zinc-500 hover:border-zinc-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="border border-[#1E1E1E] bg-[#0F0F0F] rounded overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1E1E1E]">
              {['Status', 'Agent', 'Machine', 'Model', 'Duration', 'Ran At'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2 text-left font-mono text-[10px] text-zinc-600 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E1E1E]">
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center font-mono text-xs text-zinc-600">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center font-mono text-xs text-zinc-600">
                  No runs
                </td>
              </tr>
            )}
            {filtered.map((run) => (
              <tr key={run.id} className="hover:bg-[#0A0A0A]">
                <td className="px-4 py-2">
                  <span
                    className={`font-mono text-[10px] uppercase tracking-wide ${
                      run.status === 'success' ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {run.status}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <div className="font-mono text-xs text-white">{run.agent_label}</div>
                  <div className="font-mono text-[10px] text-zinc-600">{run.agent_id}</div>
                </td>
                <td className="px-4 py-2 font-mono text-xs text-zinc-400">{run.machine}</td>
                <td className="px-4 py-2 font-mono text-xs text-zinc-400">{run.model}</td>
                <td className="px-4 py-2 font-mono text-xs text-zinc-500">
                  {run.duration_ms ? `${run.duration_ms}ms` : '—'}
                </td>
                <td className="px-4 py-2 font-mono text-[10px] text-zinc-600">
                  {new Date(run.ran_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
