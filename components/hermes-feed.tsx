'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { HermesLog } from '@/lib/types'

const PRODUCT_COLOR: Record<string, string> = {
  sparkcheck: '#FF4D8D',
  twitter_growth_optimizer: '#1D9BF0',
}

const PRODUCT_LABEL: Record<string, string> = {
  sparkcheck: 'SparkCheck',
  twitter_growth_optimizer: 'Twitter',
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
      .channel('hermes_log_feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'hermes_log' },
        (payload) => {
          setLogs((prev) => [payload.new as HermesLog, ...prev].slice(0, 200))
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [realtime])

  const displayed = logs.slice(0, limit)

  return (
    <div className="rounded-lg border border-vborder overflow-hidden" style={{ background: 'oklch(0.14 0.02 255)' }}>
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-vborder"
        style={{ background: 'oklch(0.17 0.018 255)' }}
      >
        <span
          className="text-[10px] text-vmuted uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          Hermes Activity
        </span>
        {realtime && (
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--hermes)' }} />
            <span
              className="text-[10px] text-vdim uppercase tracking-wide"
              style={{ fontFamily: 'var(--font-dm-mono)' }}
            >
              Live
            </span>
          </span>
        )}
      </div>

      {displayed.length === 0 ? (
        <div className="px-4 py-10 text-center">
          <div
            className="text-vmuted text-[11px]"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            Hermes is quiet.
          </div>
          <div
            className="text-vdim text-[10px] mt-1"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            No activity logged yet.
          </div>
        </div>
      ) : (
        <div className="divide-y divide-vborder">
          {displayed.map((log) => {
            const color = log.product ? PRODUCT_COLOR[log.product] ?? '#8B5CF6' : '#8B5CF6'
            const productLabel = log.product ? PRODUCT_LABEL[log.product] ?? log.product : null

            return (
              <div
                key={log.id}
                className="px-4 py-3 flex items-start gap-3 hover:bg-vsurface transition-colors duration-100"
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                  style={{ background: color }}
                />
                <div className="flex-1 min-w-0">
                  <div
                    className="text-vtext text-xs"
                    style={{ fontFamily: 'var(--font-dm-mono)' }}
                  >
                    {log.action}
                  </div>
                  {log.detail && (
                    <div
                      className="text-vdim text-[10px] mt-0.5 truncate"
                      style={{ fontFamily: 'var(--font-dm-mono)' }}
                    >
                      {log.detail}
                    </div>
                  )}
                  {productLabel && (
                    <span
                      className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded"
                      style={{
                        fontFamily: 'var(--font-dm-mono)',
                        color,
                        background: `${color}18`,
                      }}
                    >
                      {productLabel}
                    </span>
                  )}
                </div>
                <span
                  className="text-vdim text-[10px] tabular-nums flex-shrink-0"
                  style={{ fontFamily: 'var(--font-dm-mono)' }}
                >
                  {new Date(log.logged_at).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
