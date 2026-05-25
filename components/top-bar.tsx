'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

const PAGE_TITLES: Record<string, string> = {
  '/overview': 'Overview',
  '/revenue':  'Revenue',
  '/agents':   'Agents',
  '/hermes':   'Hermes',
  '/finance':  'Finance',
  '/speech':   'Speech',
}

function LiveClock() {
  const [time, setTime] = useState<Date | null>(null)

  useEffect(() => {
    setTime(new Date())
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!time) return null

  const day  = time.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
  const date = time.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
  const clock = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })

  return (
    <span
      className="tabular-nums"
      style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 13, color: '#A78BFA' }}
    >
      {day} {date} &nbsp; {clock}
    </span>
  )
}

function StatusPill({ dotColor, textColor, label }: { dotColor: string; textColor: string; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        fontWeight: 400,
        color: textColor,
        borderColor: 'var(--vborder)',
        background: 'var(--vsurface)',
        letterSpacing: '0.05em',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full animate-pulse-dot"
        style={{ background: dotColor }}
      />
      {label}
    </span>
  )
}

export function TopBar() {
  const pathname = usePathname()
  const base  = '/' + pathname.split('/')[1]
  const title = PAGE_TITLES[base] ?? 'Vora'

  return (
    <header
      className="flex items-center justify-between px-6 lg:px-8 border-b flex-shrink-0"
      style={{
        height: 56,
        background: '#0D1120',
        borderColor: 'var(--vborder)',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 24,
          color: 'var(--vtext)',
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h1>

      <div className="flex items-center gap-3">
        <LiveClock />
        <div className="w-px h-4" style={{ background: 'var(--vborder)' }} />
        <StatusPill dotColor="var(--vgreen)"  textColor="var(--vgreen)"  label="SUPABASE LIVE" />
        <StatusPill dotColor="var(--purple)"  textColor="var(--purple)"  label="HERMES IDLE" />
      </div>
    </header>
  )
}
