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

interface CellProps {
  value: number
  prefix?: string
  suffix?: string
  label: string
  sub: React.ReactNode
  valueColor?: string
  bordered?: boolean
  delay?: number
}

function StatCell({ value, prefix = '', suffix = '', label, sub, valueColor = 'var(--vtext)', bordered = true, delay = 0 }: CellProps) {
  return (
    <div
      className="flex-1 px-6 py-6 min-w-0 group cursor-default animate-fade-up transition-colors duration-150 hover:bg-[#F7F7F5]"
      style={{
        borderRight: bordered ? '1px solid var(--vborder)' : undefined,
        animationDelay: `${delay}ms`,
      }}
    >
      <div
        className="tabular-nums leading-none"
        style={{
          fontFamily: 'var(--font-syne)',
          fontWeight: 800,
          fontSize: 48,
          color: valueColor,
          lineHeight: 1,
        }}
      >
        <CountUp target={value} prefix={prefix} suffix={suffix} />
      </div>
      <div
        className="mt-3"
        style={{
          fontFamily: 'var(--font-dm-mono)',
          fontWeight: 500,
          fontSize: 11,
          color: 'var(--vmuted)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      <div className="mt-1" style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 11 }}>
        {sub}
      </div>
    </div>
  )
}

export function StatStrip({ totalMrr, totalSubs, agentCount, hermesCount, subsDelta, pctToTarget }: Props) {
  return (
    <div
      className="flex rounded-lg border overflow-hidden"
      style={{ background: 'var(--vsurface)', borderColor: 'var(--vborder)' }}
    >
      <StatCell
        value={totalMrr}
        prefix="$"
        label="Total MRR"
        valueColor="var(--vgreen)"
        sub={
          <span style={{ color: 'var(--spark)' }}>
            {pctToTarget.toFixed(1)}% to $5K Florida trigger
          </span>
        }
        delay={0}
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
            <span style={{ color: 'var(--vdim)' }}>no change</span>
          )
        }
        delay={60}
      />
      <StatCell
        value={agentCount}
        label="Agent Runs (24h)"
        sub={<span style={{ color: 'var(--vdim)' }}>Hermes · Ollama stack</span>}
        delay={120}
      />
      <StatCell
        value={hermesCount}
        label="Hermes Actions (24h)"
        sub={<span style={{ color: 'var(--vdim)' }}>across all products</span>}
        bordered={false}
        delay={180}
      />
    </div>
  )
}
