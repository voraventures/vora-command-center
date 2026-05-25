'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  TrendingUp,
  Bot,
  Activity,
  Landmark,
  Mic,
} from 'lucide-react'

const nav = [
  { href: '/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/revenue', label: 'Revenue', icon: TrendingUp },
  { href: '/agents', label: 'Agents', icon: Bot },
  { href: '/hermes', label: 'Hermes', icon: Activity },
  { href: '/finance', label: 'Finance', icon: Landmark },
  { href: '/speech', label: 'Speech', icon: Mic },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="w-60 flex-shrink-0 flex flex-col border-r border-vborder"
      style={{ background: 'oklch(0.14 0.02 255)' }}
    >
      {/* Logo block */}
      <div className="px-5 pt-6 pb-5 border-b border-vborder">
        <div
          className="text-2xl tracking-tight text-vtext"
          style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, letterSpacing: '-0.02em' }}
        >
          VORA
        </div>
        <div
          className="text-xs text-vmuted mt-0.5 tracking-widest"
          style={{ fontFamily: 'var(--font-syne)', fontWeight: 700 }}
        >
          VENTURES
        </div>
        <div
          className="text-[10px] text-vdim mt-1 tracking-[0.2em] uppercase"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          Command Center
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-150 outline-none',
                'focus-visible:ring-1 focus-visible:ring-vborder2',
                active
                  ? 'bg-vsurface2 text-vtext'
                  : 'text-vmuted hover:text-vtext hover:bg-vsurface',
              ].join(' ')}
              style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 13 }}
            >
              <Icon
                className="w-4 h-4 flex-shrink-0 transition-colors duration-150"
                style={{ color: active ? 'var(--hermes)' : undefined }}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User block */}
      <div className="px-5 py-4 border-t border-vborder">
        <div className="flex items-center gap-2.5">
          <span className="relative flex-shrink-0">
            <span className="block w-2 h-2 rounded-full bg-vgreen" />
            <span className="absolute inset-0 rounded-full bg-vgreen animate-ping opacity-40" />
          </span>
          <div>
            <div
              className="text-vtext text-xs font-medium leading-tight"
              style={{ fontFamily: 'var(--font-dm-mono)' }}
            >
              LUIS COOMER
            </div>
            <div
              className="text-vdim text-[10px] leading-tight mt-0.5 tracking-wide"
              style={{ fontFamily: 'var(--font-dm-mono)' }}
            >
              MAC STUDIO M4 MAX
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
