'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { HermesLog } from '@/lib/types'

const PRODUCT_COLOR: Record<string, string> = {
  sparkcheck: '#FF5C8D',
  twitter_growth_optimizer: '#1DA1F2',
}

export default function HermesPage() {
  const [logs, setLogs] = useState<HermesLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('hermes_log')
        .select('*')
        .order('logged_at', { ascending: false })
        .limit(200)
      setLogs(data ?? [])
      setLoading(false)
    }
    load()

    const channel = supabase
      .channel('hermes_page')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'hermes_log' },
        (payload) => setLogs((prev) => [payload.new as HermesLog, ...prev])
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-mono text-sm font-bold tracking-widest text-white uppercase">
          Hermes
        </h1>
        <p className="font-mono text-[11px] text-zinc-500 mt-1">
          Real-time activity feed
        </p>
      </div>

      <div className="border border-[#1E1E1E] bg-[#0F0F0F] rounded overflow-hidden">
        {loading && (
          <div className="px-4 py-6 text-center font-mono text-xs text-zinc-600">Loading…</div>
        )}
        {!loading && logs.length === 0 && (
          <div className="px-4 py-6 text-center font-mono text-xs text-zinc-600">
            No activity yet
          </div>
        )}
        <div className="divide-y divide-[#1E1E1E]">
          {logs.map((log) => {
            const color = log.product
              ? PRODUCT_COLOR[log.product] ?? '#9B5CFF'
              : '#9B5CFF'
            return (
              <div key={log.id} className="px-4 py-3 flex items-start gap-4">
                <div
                  className="w-0.5 self-stretch rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-mono text-xs text-white">{log.action}</div>
                    <div className="font-mono text-[10px] text-zinc-600 flex-shrink-0">
                      {new Date(log.logged_at).toLocaleString()}
                    </div>
                  </div>
                  {log.detail && (
                    <div className="font-mono text-[11px] text-zinc-500 mt-1">{log.detail}</div>
                  )}
                  {log.product && (
                    <div
                      className="font-mono text-[10px] mt-1 uppercase tracking-wider"
                      style={{ color }}
                    >
                      {log.product}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
