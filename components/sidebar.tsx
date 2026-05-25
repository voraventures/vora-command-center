'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, TrendingUp, Bot, Activity, Zap } from 'lucide-react'

const nav = [
  { href: '/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/revenue', label: 'Revenue', icon: TrendingUp },
  { href: '/agents', label: 'Agents', icon: Bot },
  { href: '/hermes', label: 'Hermes', icon: Activity },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 flex-shrink-0 border-r border-[#1E1E1E] bg-[#0F0F0F] flex flex-col">
      <div className="p-4 border-b border-[#1E1E1E]">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#9B5CFF]" />
          <span className="font-mono text-sm font-bold tracking-widest text-white uppercase">
            Vora
          </span>
        </div>
        <p className="font-mono text-[10px] text-zinc-500 mt-1 tracking-wider">
          VENTURES COMMAND CENTER
        </p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded text-sm font-mono transition-colors ${
                active
                  ? 'bg-[#1E1E1E] text-white'
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-[#1A1A1A]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[#1E1E1E]">
        <div className="font-mono text-[10px] text-zinc-600 tracking-wider">
          MAC STUDIO M4 MAX
        </div>
        <div className="font-mono text-[10px] text-zinc-700 mt-0.5">
          LUIS COOMER
        </div>
      </div>
    </aside>
  )
}
