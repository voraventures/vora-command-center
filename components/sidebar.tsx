'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, TrendingUp, Bot, Activity, Landmark, Mic } from 'lucide-react'

const NAV = [
  { href: '/overview',  label: 'Overview', icon: LayoutDashboard, accent: '#0A0A08' },
  { href: '/revenue',   label: 'Revenue',  icon: TrendingUp,      accent: '#059669' },
  { href: '/agents',    label: 'Agents',   icon: Bot,             accent: '#7C3AED' },
  { href: '/hermes',    label: 'Hermes',   icon: Activity,        accent: '#7C3AED' },
  { href: '/finance',   label: 'Finance',  icon: Landmark,        accent: '#059669' },
  { href: '/speech',    label: 'Speech',   icon: Mic,             accent: '#D97706' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="w-60 flex-shrink-0 flex flex-col border-r"
      style={{ background: 'var(--vsurface)', borderColor: 'var(--vborder)' }}
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b" style={{ borderColor: 'var(--vborder)' }}>
        <div
          style={{
            fontFamily: 'var(--font-syne)',
            fontWeight: 800,
            fontSize: 28,
            color: 'var(--vtext)',
            lineHeight: 1,
          }}
        >
          VORA
        </div>
        <div
          className="mt-1"
          style={{
            fontFamily: 'var(--font-syne)',
            fontWeight: 400,
            fontSize: 10,
            color: 'var(--vmuted)',
            letterSpacing: '0.3em',
          }}
        >
          VENTURES
        </div>
        <div
          className="mt-0.5"
          style={{
            fontFamily: 'var(--font-syne)',
            fontWeight: 400,
            fontSize: 8,
            color: 'var(--vdim)',
            letterSpacing: '0.4em',
          }}
        >
          COMMAND CENTER
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon, accent }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-offset-1 transition-colors duration-100"
              style={{
                fontFamily: 'var(--font-syne)',
                fontWeight: active ? 700 : 400,
                fontSize: 13,
                padding: active ? '8px 12px 8px 9px' : '8px 12px',
                background: active ? 'var(--vtext)' : 'transparent',
                color: active ? '#FFFFFF' : 'var(--vtext2)',
                borderLeft: active ? `3px solid ${accent}` : '3px solid transparent',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'var(--vsurface)'
                  ;(e.currentTarget as HTMLElement).style.color = 'var(--vtext2)'
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent'
                  ;(e.currentTarget as HTMLElement).style.color = 'var(--vtext2)'
                }
              }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User block */}
      <div className="px-5 py-4 border-t" style={{ borderColor: 'var(--vborder)', background: 'var(--vsurface2)' }}>
        <div className="flex items-center gap-2.5">
          <span
            className="block w-2 h-2 rounded-full animate-pulse-dot flex-shrink-0"
            style={{ background: 'var(--vgreen)' }}
          />
          <div>
            <div
              style={{
                fontFamily: 'var(--font-syne)',
                fontWeight: 700,
                fontSize: 12,
                color: 'var(--vtext)',
                lineHeight: 1.2,
              }}
            >
              LUIS COOMER
            </div>
            <div
              className="mt-0.5"
              style={{
                fontFamily: 'var(--font-syne)',
                fontWeight: 400,
                fontSize: 9,
                color: 'var(--vmuted)',
                letterSpacing: '0.05em',
              }}
            >
              MAC STUDIO M4 MAX
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
