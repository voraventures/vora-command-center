'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpRight } from 'lucide-react'
import { CountUp } from './count-up'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'

interface Props {
  totalMrr: number
  totalSubs: number
  agentCount: number
  hermesCount: number
  subsDelta: number
  pctToTarget: number
  mrrSparkline?: number[]
  subsSparkline?: number[]
  agentSparkline?: number[]
  hermesSparkline?: number[]
}

const SHAPE = [2, 5, 3, 8, 6, 12, 10]

function MiniSparkline({ data, accent, gradId }: { data: number[]; accent: string; gradId: string }) {
  const active = data.some((v) => v > 0) ? data : SHAPE
  const chartData = active.map((v, i) => ({ v, i }))
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity={0.3} />
            <stop offset="100%" stopColor={accent} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={accent}
          strokeWidth={2}
          fill={`url(#${gradId})`}
          dot={false}
          isAnimationActive
          animationDuration={800}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function StatCard({
  label, value, prefix = '', suffix = '', sublabel, sublabelColor,
  accent, sparkline, gradId, delay = 0, href,
}: {
  label: string; value: number; prefix?: string; suffix?: string
  sublabel: string; sublabelColor: string; accent: string
  sparkline: number[]; gradId: string; delay?: number; href?: string
}) {
  const router = useRouter()
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className={`animate-fade-up stat-card-hover${href ? ' btn-press' : ''}`}
      style={{
        background: '#161B2E',
        border: '1px solid #252D45',
        borderRadius: 12,
        padding: 20,
        position: 'relative',
        minHeight: 116,
        animationDelay: `${delay}ms`,
        cursor: href ? 'pointer' : 'default',
      }}
      onClick={href ? () => router.push(href) : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Navigate arrow — visible on hover */}
      {href && (
        <ArrowUpRight
          className="w-3.5 h-3.5"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            color: '#A78BFA',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 150ms ease-out',
            zIndex: 2,
          }}
        />
      )}

      {/* Label */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 400,
          fontSize: 10,
          color: '#A78BFA',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>

      {/* Sparkline */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          right: 14,
          width: '44%',
          height: 56,
          pointerEvents: 'none',
        }}
      >
        <MiniSparkline data={sparkline} accent={accent} gradId={gradId} />
      </div>

      {/* Big number */}
      <div
        className="tabular-nums"
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: 48,
          color: '#F0F4FF',
          lineHeight: 1,
          marginTop: 18,
        }}
      >
        {prefix}<CountUp target={value} />{suffix}
      </div>

      {/* Sublabel */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 400,
          fontSize: 11,
          color: sublabelColor,
          marginTop: 6,
        }}
      >
        {sublabel}
      </div>
    </div>
  )
}

const EMPTY: number[] = []

export function StatStrip({
  totalMrr, totalSubs, agentCount, hermesCount, subsDelta, pctToTarget,
  mrrSparkline = EMPTY,
  subsSparkline = EMPTY,
  agentSparkline = EMPTY,
  hermesSparkline = EMPTY,
}: Props) {
  const subLabel = subsDelta !== 0
    ? `${subsDelta > 0 ? '+' : ''}${subsDelta} vs prev snapshot`
    : 'no change'

  return (
    <div className="grid grid-cols-4 gap-3">
      <StatCard
        label="Total MRR"
        value={totalMrr}
        prefix="$"
        accent="#00E676"
        sparkline={mrrSparkline}
        gradId="sg-mrr"
        sublabelColor="#00E676"
        sublabel={`${pctToTarget.toFixed(1)}% to $5K FL trigger`}
        delay={0}
        href="/revenue"
      />
      <StatCard
        label="Subscribers"
        value={totalSubs}
        accent="#9C6FFF"
        sparkline={subsSparkline}
        gradId="sg-subs"
        sublabelColor="#9C6FFF"
        sublabel={subLabel}
        delay={60}
        href="/revenue"
      />
      <StatCard
        label="Agent Runs (24h)"
        value={agentCount}
        accent="#00E676"
        sparkline={agentSparkline}
        gradId="sg-agents"
        sublabelColor="#A78BFA"
        sublabel="Hermes · Ollama stack"
        delay={120}
        href="/agents"
      />
      <StatCard
        label="Hermes Actions (24h)"
        value={hermesCount}
        accent="#9C6FFF"
        sparkline={hermesSparkline}
        gradId="sg-hermes"
        sublabelColor="#A78BFA"
        sublabel="across all products"
        delay={180}
        href="/hermes"
      />
    </div>
  )
}
