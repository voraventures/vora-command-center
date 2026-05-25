'use client'

import { CountUp } from './count-up'

interface Props {
  totalMrr: number
  totalSubs: number
  agentCount: number
  hermesCount: number
  subsDelta: number
  pctToTarget: number
}

interface StatCellProps {
  value: number
  prefix?: string
  suffix?: string
  label: string
  sub?: React.ReactNode
  bordered?: boolean
}

function StatCell({ value, prefix = '', suffix = '', label, sub, bordered = true }: StatCellProps) {
  return (
    <div className={`flex-1 px-6 py-5 min-w-0 ${bordered ? 'border-r border-vborder' : ''}`}>
      <div
        className="text-vtext tabular-nums leading-none"
        style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 32 }}
      >
        <CountUp target={value} prefix={prefix} suffix={suffix} />
      </div>
      <div
        className="text-vmuted text-[11px] mt-2"
        style={{ fontFamily: 'var(--font-dm-mono)' }}
      >
        {label}
      </div>
      {sub && (
        <div
          className="text-[10px] mt-1"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          {sub}
        </div>
      )}
    </div>
  )
}

export function StatStrip({ totalMrr, totalSubs, agentCount, hermesCount, subsDelta, pctToTarget }: Props) {
  return (
    <div
      className="flex rounded-lg border border-vborder overflow-hidden"
      style={{ background: 'oklch(0.14 0.02 255)' }}
    >
      <StatCell
        value={totalMrr}
        prefix="$"
        label="Total MRR"
        sub={
          <span style={{ color: 'var(--vgreen)' }}>
            {pctToTarget.toFixed(0)}% to $5K FL trigger
          </span>
        }
      />
      <StatCell
        value={totalSubs}
        label="Subscribers"
        sub={
          subsDelta !== 0 ? (
            <span style={{ color: subsDelta > 0 ? 'var(--vgreen)' : 'var(--vred)' }}>
              {subsDelta > 0 ? '+' : ''}{subsDelta} vs prev snapshot
            </span>
          ) : (
            <span className="text-vdim">no change</span>
          )
        }
      />
      <StatCell
        value={agentCount}
        label="Agent Runs (24h)"
        sub={<span className="text-vdim">local Hermes/Ollama</span>}
      />
      <StatCell
        value={hermesCount}
        label="Hermes Actions (24h)"
        sub={<span className="text-vdim">across all products</span>}
        bordered={false}
      />
    </div>
  )
}
