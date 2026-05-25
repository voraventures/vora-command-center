'use client'

import { useEffect, useState } from 'react'
import { Activity } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { HermesLog } from '@/lib/types'

const PRODUCT_LABEL: Record<string, string> = {
  sparkcheck:               'SparkCheck',
  twitter_growth_optimizer: 'Twitter Growth',
}

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString()
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)    return `${diff}s ago`
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function SectionHeader({ n, title, subtitle }: { n: string; title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div className="flex items-center justify-between" style={{ paddingBottom: 14 }}>
        <div className="flex items-center gap-3">
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: '#9C6FFF', letterSpacing: '0.15em' }}>{n}</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--vtext)', margin: 0, lineHeight: 1 }}>{title}</h2>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 11, color: 'var(--vmuted)' }}>{subtitle}</span>
      </div>
      <div style={{ borderBottom: '1px solid var(--vborder)' }} />
    </div>
  )
}

export default function HermesPage() {
  const [logs, setLogs] = useState<(HermesLog & { _isNew?: boolean })[]>([])
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
    const ch = supabase
      .channel('hermes_full_page')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'hermes_log' }, (p) =>
        setLogs((prev) => [{ ...(p.new as HermesLog), _isNew: true }, ...prev])
      )
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  const today = new Date()
  const todayCount = logs.filter((l) => isSameDay(new Date(l.logged_at), today)).length
  const productCounts = logs.reduce<Record<string, number>>((acc, l) => {
    if (l.product) acc[l.product] = (acc[l.product] ?? 0) + 1
    return acc
  }, {})
  const topProduct = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
  const perHour = logs.filter((l) => new Date(l.logged_at) > new Date(Date.now() - 3600000)).length

  const STATS = [
    { value: todayCount,  label: 'Actions Today',  sub: 'since midnight',      isNum: true,  accent: '#00E676' },
    { value: topProduct ? (PRODUCT_LABEL[topProduct] ?? topProduct) : '—', label: 'Most Active', sub: topProduct ? `${productCounts[topProduct]} total` : 'no data', isNum: false, accent: '#9C6FFF' },
    { value: perHour,     label: 'Per Hour',        sub: 'rolling 1h window',   isNum: true,  accent: '#00E676' },
  ]

  return (
    <div className="space-y-10 max-w-4xl">

      {/* SECTION 01 — ACTIVITY STATS */}
      <section className="space-y-4 animate-fade-up" style={{ animationDelay: '0ms' }}>
        <SectionHeader n="01" title="Activity Stats" subtitle="Live · rolling windows" />
        <div
          className="grid grid-cols-3 rounded-lg border overflow-hidden animate-fade-up"
          style={{ background: 'var(--vsurface)', borderColor: 'var(--vborder)' }}
        >
          {STATS.map(({ value, label, sub, isNum, accent }, i) => (
            <div
              key={label}
              className="px-6 py-5"
              style={{ borderRight: i < 2 ? '1px solid var(--vborder)' : undefined }}
            >
              <div
                className="tabular-nums leading-none"
                style={{
                  fontFamily: isNum ? 'var(--font-display)' : 'var(--font-mono)',
                  fontWeight: isNum ? 900 : 500,
                  fontSize: isNum ? 40 : 20,
                  color: accent,
                  lineHeight: 1,
                }}
              >
                {value}
              </div>
              <div
                className="mt-2"
                style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 11, color: 'var(--vmuted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                {label}
              </div>
              <div className="mt-0.5" style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 11, color: 'var(--vdim)' }}>
                {sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 02 — ACTIVITY FEED */}
      <section className="space-y-4 animate-fade-up" style={{ animationDelay: '100ms' }}>
        <SectionHeader n="02" title="Activity Feed" subtitle="All products · real-time" />
        <div
          className="rounded-lg border overflow-hidden"
          style={{ background: 'var(--vsurface)', borderColor: 'var(--vborder)' }}
        >
          <div
            className="flex items-center justify-between px-5 py-3 border-b"
            style={{ borderColor: 'var(--vborder)', background: 'var(--vsurface2)' }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: 'var(--vmuted)', letterSpacing: '0.2em' }}>
              ACTIVITY FEED
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: '#9C6FFF' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: '#9C6FFF', letterSpacing: '0.05em' }}>LIVE</span>
            </span>
          </div>

          {loading && (
            <div className="p-6 space-y-5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="skeleton w-3 h-3 rounded-full mt-0.5 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3 rounded" style={{ width: `${50 + (i % 3) * 15}%` }} />
                    <div className="skeleton h-2.5 rounded" style={{ width: `${30 + (i % 2) * 20}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && logs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <Activity className="w-10 h-10 mb-4" style={{ color: 'var(--vdim)' }} />
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--vtext2)' }}>
                Hermes is quiet
              </div>
              <div className="mt-1" style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 12, color: 'var(--vmuted)' }}>
                POST to /api/hermes-log to log activity
              </div>
            </div>
          )}

          <div>
            {logs.map((log, i) => {
              const productLabel = log.product ? (PRODUCT_LABEL[log.product] ?? log.product) : null

              return (
                <div
                  key={log.id}
                  className={`flex gap-4 px-5 py-4 ${log._isNew ? 'animate-slide-down' : 'animate-fade-up'}`}
                  style={{
                    borderBottom: '1px solid var(--vborder)',
                    animationDelay: log._isNew ? undefined : `${i * 30}ms`,
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--vsurface2)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                >
                  <div className="flex flex-col items-center flex-shrink-0 mt-1" style={{ width: 16 }}>
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ background: '#9C6FFF', boxShadow: '0 0 0 3px rgba(156,111,255,0.2)' }}
                    />
                    <div className="flex-1 w-px mt-1.5" style={{ background: 'var(--vborder)', minHeight: 8 }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: 13, color: 'var(--vtext2)' }}>
                        {log.action}
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 11, color: 'var(--vdim)', flexShrink: 0 }}>
                        {timeAgo(log.logged_at)}
                      </span>
                    </div>
                    {log.detail && (
                      <div className="mt-0.5" style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 11, color: 'var(--vmuted)' }}>
                        {log.detail}
                      </div>
                    )}
                    {productLabel && (
                      <span
                        className="inline-block mt-1.5 px-2 py-0.5 rounded"
                        style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: '#9C6FFF', background: 'rgba(156,111,255,0.15)', letterSpacing: '0.05em' }}
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
      </section>
    </div>
  )
}
