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
  twitter_growth_optimizer: 'Twitter Growth',
}

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString()
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
        .limit(300)
      setLogs(data ?? [])
      setLoading(false)
    }
    load()

    const channel = supabase
      .channel('hermes_full_page')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'hermes_log' }, (p) =>
        setLogs((prev) => [p.new as HermesLog, ...prev])
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const today = new Date()
  const todayLogs = logs.filter((l) => isSameDay(new Date(l.logged_at), today))
  const todayCount = todayLogs.length

  const productCounts = logs.reduce<Record<string, number>>((acc, l) => {
    if (l.product) acc[l.product] = (acc[l.product] ?? 0) + 1
    return acc
  }, {})
  const topProduct = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0]?.[0]

  const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const perHour = logs.filter((l) => new Date(l.logged_at) > hourAgo).length

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Stats row */}
      <div
        className="grid grid-cols-3 rounded-lg border border-vborder overflow-hidden"
        style={{ background: 'oklch(0.14 0.02 255)' }}
      >
        {[
          { value: todayCount, label: 'Actions Today', sub: 'since midnight' },
          {
            value: topProduct ? (PRODUCT_LABEL[topProduct] ?? topProduct) : '—',
            label: 'Most Active',
            sub: topProduct ? `${productCounts[topProduct]} total` : 'no activity',
            isText: true,
          },
          { value: perHour, label: 'Per Hour', sub: 'rolling 1h window' },
        ].map(({ value, label, sub, isText }, i) => (
          <div
            key={label}
            className={`px-6 py-5 ${i < 2 ? 'border-r border-vborder' : ''}`}
          >
            <div
              className="text-vtext leading-none"
              style={{
                fontFamily: 'var(--font-syne)',
                fontWeight: 800,
                fontSize: isText ? 18 : 32,
              }}
            >
              {value}
            </div>
            <div
              className="text-vmuted text-[11px] mt-2"
              style={{ fontFamily: 'var(--font-dm-mono)' }}
            >
              {label}
            </div>
            <div
              className="text-vdim text-[10px] mt-0.5"
              style={{ fontFamily: 'var(--font-dm-mono)' }}
            >
              {sub}
            </div>
          </div>
        ))}
      </div>

      {/* Activity feed */}
      <div
        className="rounded-lg border border-vborder overflow-hidden"
        style={{ background: 'oklch(0.14 0.02 255)' }}
      >
        <div
          className="flex items-center justify-between px-5 py-3 border-b border-vborder"
          style={{ background: 'oklch(0.17 0.018 255)' }}
        >
          <span
            className="text-[10px] text-vmuted uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            Activity Feed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--hermes)' }} />
            <span
              className="text-[10px] text-vdim uppercase tracking-wide"
              style={{ fontFamily: 'var(--font-dm-mono)' }}
            >
              Live
            </span>
          </span>
        </div>

        {loading && (
          <div className="p-6 space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-vsurface2 mt-1 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 rounded bg-vsurface2" style={{ width: `${55 + (i % 3) * 15}%` }} />
                  <div className="h-2 rounded bg-vsurface2" style={{ width: `${30 + (i % 2) * 20}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && logs.length === 0 && (
          <div className="px-5 py-16 text-center">
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
              POST to /api/hermes-log to log activity.
            </div>
          </div>
        )}

        <div className="divide-y divide-vborder">
          {logs.map((log) => {
            const color = log.product ? PRODUCT_COLOR[log.product] ?? '#8B5CF6' : '#8B5CF6'
            const productLabel = log.product ? PRODUCT_LABEL[log.product] ?? log.product : null

            return (
              <div
                key={log.id}
                className="px-5 py-3.5 flex items-start gap-3 hover:bg-vsurface transition-colors duration-100"
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                  style={{ background: color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className="text-vtext text-[12px]"
                      style={{ fontFamily: 'var(--font-dm-mono)' }}
                    >
                      {log.action}
                    </div>
                    <span
                      className="text-vdim text-[10px] tabular-nums flex-shrink-0"
                      style={{ fontFamily: 'var(--font-dm-mono)' }}
                    >
                      {new Date(log.logged_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {log.detail && (
                    <div
                      className="text-vdim text-[11px] mt-1"
                      style={{ fontFamily: 'var(--font-dm-mono)' }}
                    >
                      {log.detail}
                    </div>
                  )}
                  {productLabel && (
                    <span
                      className="inline-block mt-1.5 text-[10px] px-1.5 py-0.5 rounded"
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
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
