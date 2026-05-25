'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface AgentRun {
  id: string
  agent_id: string
  agent_label: string
  model: string
  input_tokens: number
  output_tokens: number
  estimated_cost_usd: number
  ran_at: string
}

interface AgentStat {
  agent_id: string
  agent_label: string
  model: string
  runs: number
  input_tokens: number
  output_tokens: number
  estimated_cost_usd: number
}

function modelLabel(model: string): { text: string; color: string } {
  if (model === 'claude-api') return { text: 'CLAUDE API', color: '#FF4D8D' }
  if (model === 'claude_code') return { text: 'CLAUDE CODE', color: '#9C6FFF' }
  return { text: 'QWEN3', color: '#00E676' }
}

function fmtCost(cents: number): string {
  if (cents === -1) return '—'
  return `$${cents.toFixed(4)}`
}

function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function StatCell({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ flex: 1 }}>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: '#A78BFA',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 22,
          color: valueColor ?? '#F0F4FF',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  )
}

function Divider() {
  return <div style={{ width: 1, background: '#252D45', alignSelf: 'stretch', margin: '0 4px' }} />
}

export function TokenUsage({ initialRuns }: { initialRuns: AgentRun[] }) {
  const [runs, setRuns] = useState<AgentRun[]>(initialRuns)

  useEffect(() => {
    const channel = supabase
      .channel('token-usage-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'agent_runs' },
        (payload) => {
          setRuns((prev) => [payload.new as AgentRun, ...prev])
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const todayRuns  = runs.filter((r) => r.ran_at >= todayStart)
  const monthRuns  = runs.filter((r) => r.ran_at >= monthStart)

  const sum = (arr: AgentRun[], key: keyof AgentRun) =>
    arr.reduce((s, r) => {
      const v = r[key]
      // sentinel -1 means "unknown cost" — exclude from sum
      if (key === 'estimated_cost_usd' && (v as number) < 0) return s
      return s + (typeof v === 'number' ? v : 0)
    }, 0)

  const todayIn    = sum(todayRuns, 'input_tokens')
  const todayOut   = sum(todayRuns, 'output_tokens')
  const todayCost  = sum(todayRuns, 'estimated_cost_usd')
  const monthIn    = sum(monthRuns, 'input_tokens')
  const monthOut   = sum(monthRuns, 'output_tokens')
  const monthCost  = sum(monthRuns, 'estimated_cost_usd')

  // Per-agent aggregation
  const agentMap = new Map<string, AgentStat>()
  for (const r of runs) {
    const existing = agentMap.get(r.agent_id) ?? {
      agent_id: r.agent_id,
      agent_label: r.agent_label,
      model: r.model,
      runs: 0,
      input_tokens: 0,
      output_tokens: 0,
      estimated_cost_usd: 0,
    }
    existing.runs++
    existing.input_tokens  += r.input_tokens ?? 0
    existing.output_tokens += r.output_tokens ?? 0
    if ((r.estimated_cost_usd ?? 0) >= 0) {
      existing.estimated_cost_usd += r.estimated_cost_usd ?? 0
    }
    agentMap.set(r.agent_id, existing)
  }
  const agentStats = Array.from(agentMap.values()).sort(
    (a, b) => b.estimated_cost_usd - a.estimated_cost_usd
  )

  // Projection: daily rate → monthly
  const daysElapsed = Math.max(now.getDate(), 1)
  const projectedMonthly = (monthCost / daysElapsed) * 30

  const costColor = (v: number) => (v > 1 ? '#FF4D8D' : '#00E676')

  return (
    <div
      style={{
        background: '#161B2E',
        border: '1px solid #252D45',
        borderRadius: 12,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 24px 12px',
          borderBottom: '1px solid #252D45',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.25em',
            color: '#A78BFA',
            textTransform: 'uppercase',
          }}
        >
          Token Usage &amp; Cost
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: '#3D4F70',
          }}
        >
          Claude Sonnet: $0.003/1K in · $0.015/1K out · Qwen3: free
        </span>
      </div>

      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Section 1: Today */}
        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.2em',
              color: '#A78BFA',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            Today
          </div>
          <div style={{ display: 'flex', gap: 0 }}>
            <StatCell label="Input Tokens"  value={fmtTokens(todayIn)} />
            <Divider />
            <StatCell label="Output Tokens" value={fmtTokens(todayOut)} />
            <Divider />
            <StatCell
              label="Est. Cost Today"
              value={`$${todayCost.toFixed(2)}`}
              valueColor={costColor(todayCost)}
            />
          </div>
        </div>

        {/* Section 2: This month */}
        <div style={{ borderTop: '1px solid #1E2540', paddingTop: 16 }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.2em',
              color: '#A78BFA',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            This Month
          </div>
          <div style={{ display: 'flex', gap: 0 }}>
            <StatCell label="Input Tokens"   value={fmtTokens(monthIn)} />
            <Divider />
            <StatCell label="Output Tokens"  value={fmtTokens(monthOut)} />
            <Divider />
            <StatCell
              label="Est. Cost MTD"
              value={`$${monthCost.toFixed(2)}`}
              valueColor={costColor(monthCost)}
            />
          </div>
        </div>

        {/* Section 3: Per-agent breakdown */}
        {agentStats.length > 0 && (
          <div style={{ borderTop: '1px solid #1E2540', paddingTop: 16 }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                letterSpacing: '0.2em',
                color: '#3D4F70',
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              Per Agent
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Agent', 'Model', 'Runs', 'Input', 'Output', 'Est. Cost'].map((h) => (
                    <th
                      key={h}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 9,
                        letterSpacing: '0.15em',
                        color: '#3D4F70',
                        textTransform: 'uppercase',
                        textAlign: 'left',
                        paddingBottom: 8,
                        fontWeight: 400,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {agentStats.map((a, i) => {
                  const ml = modelLabel(a.model)
                  return (
                    <tr
                      key={a.agent_id}
                      style={{ borderTop: i === 0 ? 'none' : '1px solid #1A2035' }}
                    >
                      <td
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 12,
                          color: '#A8B4D0',
                          padding: '7px 0',
                          paddingRight: 16,
                        }}
                      >
                        {a.agent_label}
                      </td>
                      <td style={{ paddingRight: 16 }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 9,
                            letterSpacing: '0.1em',
                            color: ml.color,
                            background: `${ml.color}18`,
                            padding: '2px 5px',
                            borderRadius: 3,
                          }}
                        >
                          {ml.text}
                        </span>
                      </td>
                      <td
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 12,
                          color: '#5A6A8A',
                          paddingRight: 16,
                        }}
                      >
                        {a.runs}
                      </td>
                      <td
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 12,
                          color: '#A8B4D0',
                          paddingRight: 16,
                        }}
                      >
                        {fmtTokens(a.input_tokens)}
                      </td>
                      <td
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 12,
                          color: '#A8B4D0',
                          paddingRight: 16,
                        }}
                      >
                        {fmtTokens(a.output_tokens)}
                      </td>
                      <td
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 12,
                          color: costColor(a.estimated_cost_usd),
                        }}
                      >
                        {fmtCost(a.estimated_cost_usd)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Section 4: Projection */}
        <div
          style={{
            borderTop: '1px solid #1E2540',
            paddingTop: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: '#5A6A8A',
            }}
          >
            At current daily rate, projected monthly cost:{' '}
            <span style={{ color: costColor(projectedMonthly) }}>
              ${projectedMonthly.toFixed(2)}
            </span>
          </div>
          <a
            href="https://console.anthropic.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: '#3D4F70',
              textDecoration: 'none',
              borderBottom: '1px solid #252D45',
              paddingBottom: 1,
            }}
          >
            Anthropic balance &rarr;
          </a>
        </div>

      </div>
    </div>
  )
}
