'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const PAGE_TITLES: Record<string, string> = {
  '/overview': 'Overview',
  '/revenue': 'Revenue',
  '/agents': 'Agents',
  '/hermes': 'Hermes',
  '/finance': 'Finance',
  '/speech': 'Speech',
}

function LiveClock() {
  const [time, setTime] = useState<Date | null>(null)

  useEffect(() => {
    setTime(new Date())
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!time) return null

  const day = time.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
  const date = time.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
  const clock = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })

  return (
    <div
      className="text-vmuted tabular-nums"
      style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 12 }}
    >
      <span className="text-vdim">{day} {date}</span>
      <span className="ml-3 text-vmuted">{clock}</span>
    </div>
  )
}

export function TopBar() {
  const pathname = usePathname()

  const base = '/' + pathname.split('/')[1]
  const title = PAGE_TITLES[base] ?? 'Vora'

  return (
    <header className="flex items-center justify-between px-6 lg:px-8 h-12 border-b border-vborder flex-shrink-0 bg-vbg">
      <h1
        className="text-vtext tracking-tight"
        style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 15 }}
      >
        {title}
      </h1>
      <LiveClock />
    </header>
  )
}
