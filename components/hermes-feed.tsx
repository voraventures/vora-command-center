'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { HermesLog } from '@/lib/types'

const PRODUCT_COLOR: Record<string, string> = {
  sparkcheck: '#FF5C8D',
  twitter_growth_optimizer: '#1DA1F2',
}

interface Props {
  initial: HermesLog[]
  limit?: number
  realtime?: boolean
}

export function HermesFeed({ initial, limit = 5, realtime = false }: Props) {
  const [logs, setLogs] = useState<HermesLog[]>(initial)

  useEffect(() => {
    if (!realtime) return
    const channel = supabase
      .channel('hermes_log')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'hermes_log' },
        (payload) => {
          setLogs((prev) => [payload.new as HermesLog, ...prev].slice(0, 100))
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [realtime])

  const displayed = logs.slice(0, limit)

  return (
    <div className="border border-[#1E1E1E] bg-[#0F0F0F] rounded overflow-hidden">
      <div className="px-4 py-2 border-b border-[#1E1E1E]">
        <span className="font-mono text-[10px] text-zinc-500 tracking-widest uppercase">
          Hermes Activity
        </span>
      </div>
      <div className="divide-y divide-[#1E1E1E]">
        {displayed.length === 0 && (
          <div className="px-4 py-6 text-center font-mono text-xs text-zinc-600">
            No activity yet
          </div>
        )}
        {displayed.map((log) => {
          const color = log.product ? PRODUCT_COLOR[log.product] ?? '#9B5CFF' : '#9B5CFF'
          return (
            <div key={log.id} className="px-4 py-2.5 flex items-start gap-3">
              <div
                className="w-1 h-full min-h-[1.5rem] rounded-full flex-shrink-0 mt-0.5"
                style={{ backgroundColor: color, width: 2 }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-mono text-xs text-white">{log.action}</div>
                {log.detail && (
                  <div className="font-mono text-[10px] text-zinc-500 mt-0.5 truncate">
                    {log.detail}
                  </div>
                )}
              </div>
              <div className="font-mono text-[10px] text-zinc-600 flex-shrink-0">
                {new Date(log.logged_at).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
