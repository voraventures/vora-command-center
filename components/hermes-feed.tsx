'use client'

import { useEffect, useState } from 'react'
import { Activity } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { HermesLog } from '@/lib/types'

const PRODUCT_LABEL: Record<string, string> = {
  sparkcheck:               'SparkCheck',
  twitter_growth_optimizer: 'Twitter',
}

interface Props {
  initial: HermesLog[]
  limit?: number
  realtime?: boolean
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)    return `${diff}s ago`
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function FeedItem({ log, isNew, delay }: { log: HermesLog; isNew?: boolean; delay?: number }) {
  const productLabel = log.product ? (PRODUCT_LABEL[log.product] ?? log.product) : null

  return (
    <div
      className={`flex gap-4 py-4 px-5 ${isNew ? 'animate-slide-down' : 'animate-fade-up'}`}
      style={{
        borderBottom: '1px solid var(--vborder)',
        animationDelay: delay != null ? `${delay}ms` : undefined,
        transition: 'background 0.1s',
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--vsurface2)')}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
    >
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center flex-shrink-0 mt-1" style={{ width: 16 }}>
        <span
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ background: '#9C6FFF', boxShadow: '0 0 0 3px rgba(156,111,255,0.2)' }}
        />
        <div className="flex-1 w-px mt-1" style={{ background: 'var(--vborder)', minHeight: 8 }} />
      </div>

      {/* Content */}
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
          <div
            className="mt-0.5"
            style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 11, color: 'var(--vmuted)' }}
          >
            {log.detail}
          </div>
        )}

        {productLabel && (
          <span
            className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px]"
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 400,
              color: '#9C6FFF',
              background: 'rgba(156,111,255,0.15)',
              letterSpacing: '0.05em',
            }}
          >
            {productLabel}
          </span>
        )}
      </div>
    </div>
  )
}

export function HermesFeed({ initial, limit = 5, realtime = false }: Props) {
  const [logs, setLogs] = useState<(HermesLog & { _isNew?: boolean })[]>(initial)

  useEffect(() => {
    if (!realtime) return
    const channel = supabase
      .channel('hermes_log_feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'hermes_log' }, (payload) => {
        setLogs((prev) => [{ ...(payload.new as HermesLog), _isNew: true }, ...prev].slice(0, 200))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [realtime])

  const displayed = logs.slice(0, limit)

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ background: 'var(--vsurface)', borderColor: 'var(--vborder)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--vborder)', background: 'var(--vsurface2)' }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 500,
            fontSize: 10,
            color: 'var(--vmuted)',
            letterSpacing: '0.3em',
          }}
        >
          HERMES ACTIVITY
        </span>
        {realtime && (
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: '#9C6FFF' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: '#9C6FFF', letterSpacing: '0.05em' }}>
              LIVE
            </span>
          </span>
        )}
      </div>

      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Activity className="w-8 h-8 mb-3" style={{ color: 'var(--vdim)' }} />
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--vtext2)' }}>
            Hermes is quiet
          </div>
          <div className="mt-1" style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 11, color: 'var(--vmuted)' }}>
            No activity logged yet
          </div>
        </div>
      ) : (
        <div>
          {displayed.map((log, i) => (
            <FeedItem
              key={log.id}
              log={log}
              isNew={log._isNew}
              delay={log._isNew ? undefined : i * 40}
            />
          ))}
        </div>
      )}
    </div>
  )
}
