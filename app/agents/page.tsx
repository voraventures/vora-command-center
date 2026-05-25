'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { AgentRun } from '@/lib/types'

const STATIC_AGENTS = [
  { id: 'oraliva-1', label: 'OraLiva Core', tag: 'speech', machine: 'macbook', model: 'oraliva-v2', color: '#F59E0B', remote: true },
  { id: 'oraliva-2', label: 'OraLiva Phoneme', tag: 'speech', machine: 'macbook', model: 'oraliva-v2', color: '#F59E0B', remote: true },
  { id: 'oraliva-3', label: 'OraLiva Prosody', tag: 'speech', machine: 'macbook', model: 'oraliva-v2', color: '#F59E0B', remote: true },
  { id: 'oraliva-4', label: 'OraLiva Fluency', tag: 'speech', machine: 'macbook', model: 'oraliva-v2', color: '#F59E0B', remote: true },
  { id: 'oraliva-5', label: 'OraLiva Coach', tag: 'speech', machine: 'macbook', model: 'oraliva-v2', color: '#F59E0B', remote: true },
  { id: 'finance-intel', label: 'Market Intelligence', tag: 'finance', machine: 'mac_studio', model: 'qwen3:14b', color: '#10B981', remote: false },
  { id: 'finance-portfolio', label: 'Portfolio Strategist', tag: 'finance', machine: 'mac_studio', model: 'qwen3:14b', color: '#10B981', remote: false },
  { id: 'finance-savings', label: 'Savings Optimizer', tag: 'finance', machine: 'mac_studio', model: 'qwen3:14b', color: '#10B981', remote: false },
  { id: 'finance-crypto', label: 'Crypto & Alt Assets', tag: 'finance', machine: 'mac_studio', model: 'qwen3:14b', color: '#10B981', remote: false },
  { id: 'speech-coach', label: 'Speech Coach', tag: 'speech', machine: 'mac_studio', model: 'qwen3:14b', color: '#F59E0B', remote: false },
]

type TagFilter = 'all' | 'finance' | 'speech'
type MachineFilter = 'all' | 'mac_studio' | 'macbook'

export default function AgentsPage() {
  const [runs, setRuns] = useState<AgentRun[]>([])
  const [loading, setLoading] = useState(true)
  const [machineFilter, setMachineFilter] = useState<MachineFilter>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'error'>('all')
  const [tagFilter, setTagFilter] = useState<TagFilter>('all')

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
      .channel('agents_page_rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'agent_runs' }, (p) =>
        setRuns((prev) => [p.new as AgentRun, ...prev])
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const filteredAgents = STATIC_AGENTS.filter((a) => {
    if (tagFilter !== 'all' && a.tag !== tagFilter) return false
    if (machineFilter !== 'all' && a.machine !== machineFilter) return false
    return true
  })

  const filteredRuns = runs.filter((r) => {
    if (machineFilter !== 'all' && r.machine !== machineFilter) return false
    if (statusFilter !== 'all' && r.status !== statusFilter) return false
    return true
  })

  return (
    <div className="space-y-7 max-w-6xl">
      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'mac_studio', 'macbook'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setMachineFilter(v)}
            className="px-3 py-1.5 rounded text-[11px] transition-colors duration-100 outline-none focus-visible:ring-1 focus-visible:ring-vborder2"
            style={{
              fontFamily: 'var(--font-dm-mono)',
              background: machineFilter === v ? 'oklch(0.22 0.022 255)' : 'transparent',
              color: machineFilter === v ? 'var(--vtext)' : 'var(--vmuted)',
              border: '1px solid',
              borderColor: machineFilter === v ? 'oklch(0.35 0.05 255)' : 'oklch(0.27 0.035 255)',
            }}
          >
            {v === 'all' ? 'All Machines' : v}
          </button>
        ))}
        <div className="w-px h-4 bg-vborder mx-1" />
        {(['all', 'finance', 'speech'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setTagFilter(v)}
            className="px-3 py-1.5 rounded text-[11px] transition-colors duration-100 outline-none focus-visible:ring-1 focus-visible:ring-vborder2"
            style={{
              fontFamily: 'var(--font-dm-mono)',
              background: tagFilter === v ? 'oklch(0.22 0.022 255)' : 'transparent',
              color: tagFilter === v ? 'var(--vtext)' : 'var(--vmuted)',
              border: '1px solid',
              borderColor: tagFilter === v ? 'oklch(0.35 0.05 255)' : 'oklch(0.27 0.035 255)',
            }}
          >
            {v === 'all' ? 'All Tags' : v}
          </button>
        ))}
      </div>

      {/* Agent registry */}
      <div>
        <div
          className="text-[10px] text-vmuted uppercase tracking-widest mb-3"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          Agent Registry &mdash; {filteredAgents.length} configured
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className="rounded-lg border border-vborder p-4 flex items-start gap-3"
              style={{
                background: 'oklch(0.14 0.02 255)',
                opacity: agent.remote ? 0.55 : 1,
              }}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                style={{ background: agent.color }}
              />
              <div className="min-w-0">
                <div
                  className="text-vtext text-[12px] truncate"
                  style={{ fontFamily: 'var(--font-dm-mono)' }}
                >
                  {agent.label}
                </div>
                <div
                  className="text-vdim text-[10px] mt-0.5"
                  style={{ fontFamily: 'var(--font-dm-mono)' }}
                >
                  {agent.machine} &middot; {agent.model}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span
                    className="px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider"
                    style={{
                      fontFamily: 'var(--font-dm-mono)',
                      background: `${agent.color}18`,
                      color: agent.color,
                    }}
                  >
                    {agent.tag}
                  </span>
                  {agent.remote && (
                    <span
                      className="text-[9px] text-vdim uppercase tracking-wider"
                      style={{ fontFamily: 'var(--font-dm-mono)' }}
                    >
                      remote
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Run log */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div
            className="text-[10px] text-vmuted uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            Run Log &mdash; real-time
          </div>
          <div className="flex items-center gap-2">
            {(['all', 'success', 'error'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setStatusFilter(v)}
                className="px-2.5 py-1 rounded text-[11px] transition-colors duration-100 outline-none"
                style={{
                  fontFamily: 'var(--font-dm-mono)',
                  background: statusFilter === v ? 'oklch(0.22 0.022 255)' : 'transparent',
                  color: statusFilter === v ? 'var(--vtext)' : 'var(--vmuted)',
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div
          className="rounded-lg border border-vborder overflow-hidden"
          style={{ background: 'oklch(0.14 0.02 255)' }}
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-vborder" style={{ background: 'oklch(0.17 0.018 255)' }}>
                {['Status', 'Agent', 'Machine', 'Model', 'Duration', 'Time'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-[10px] text-vdim uppercase tracking-wider"
                    style={{ fontFamily: 'var(--font-dm-mono)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-vborder">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center">
                    <div className="flex items-center justify-center gap-3">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="h-1.5 rounded-full animate-pulse"
                          style={{ width: 32 + i * 16, background: 'oklch(0.27 0.035 255)' }}
                        />
                      ))}
                    </div>
                  </td>
                </tr>
              )}
              {!loading && filteredRuns.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center"
                  >
                    <div
                      className="text-vmuted text-[11px]"
                      style={{ fontFamily: 'var(--font-dm-mono)' }}
                    >
                      No runs match the current filters.
                    </div>
                  </td>
                </tr>
              )}
              {filteredRuns.map((run) => (
                <tr
                  key={run.id}
                  className="hover:bg-vsurface transition-colors duration-100"
                >
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] uppercase"
                      style={{
                        fontFamily: 'var(--font-dm-mono)',
                        background: run.status === 'success' ? 'oklch(0.70 0.17 155 / 0.1)' : 'oklch(0.63 0.22 25 / 0.1)',
                        color: run.status === 'success' ? 'var(--vgreen)' : 'var(--vred)',
                      }}
                    >
                      {run.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div
                      className="text-vtext text-[12px]"
                      style={{ fontFamily: 'var(--font-dm-mono)' }}
                    >
                      {run.agent_label}
                    </div>
                    <div
                      className="text-vdim text-[10px] mt-0.5"
                      style={{ fontFamily: 'var(--font-dm-mono)' }}
                    >
                      {run.agent_id}
                    </div>
                  </td>
                  <td
                    className="px-4 py-3 text-vmuted text-[12px]"
                    style={{ fontFamily: 'var(--font-dm-mono)' }}
                  >
                    {run.machine}
                  </td>
                  <td
                    className="px-4 py-3 text-vmuted text-[12px]"
                    style={{ fontFamily: 'var(--font-dm-mono)' }}
                  >
                    {run.model}
                  </td>
                  <td
                    className="px-4 py-3 text-vdim text-[12px] tabular-nums"
                    style={{ fontFamily: 'var(--font-dm-mono)' }}
                  >
                    {run.duration_ms != null ? `${run.duration_ms}ms` : '—'}
                  </td>
                  <td
                    className="px-4 py-3 text-vdim text-[10px] tabular-nums"
                    style={{ fontFamily: 'var(--font-dm-mono)' }}
                  >
                    {new Date(run.ran_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
