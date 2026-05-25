import { createServerClient } from '@/lib/supabase'
import { MrrCard } from '@/components/mrr-card'
import { RevenueChart } from '@/components/revenue-chart'

export const revalidate = 30

const PRODUCT_LABEL: Record<string, string> = {
  sparkcheck:               'SparkCheck',
  twitter_growth_optimizer: 'Twitter Growth Opt.',
}
const PRODUCT_COLOR: Record<string, string> = {
  sparkcheck:               '#FF4D8D',
  twitter_growth_optimizer: '#1D9BF0',
}

export default async function RevenuePage() {
  const supabase = createServerClient()

  const [{ data: snapshots }, { data: recent }] = await Promise.all([
    supabase.from('mrr_snapshots').select('*').order('recorded_at', { ascending: true }),
    supabase.from('mrr_snapshots').select('*').order('recorded_at', { ascending: false }).limit(40),
  ])

  const productIds = ['sparkcheck', 'twitter_growth_optimizer']
  const byProduct  = (id: string) => (snapshots ?? []).filter((s) => s.product === id)

  const totals = productIds.map((id) => {
    const snaps  = byProduct(id)
    const latest = snaps[snaps.length - 1]
    const prev   = snaps[snaps.length - 2]
    return { id, latest, prev, delta: latest && prev ? latest.mrr_usd - prev.mrr_usd : 0 }
  })

  const totalMrr  = totals.reduce((s, t) => s + (t.latest?.mrr_usd ?? 0), 0)
  const totalSubs = totals.reduce((s, t) => s + (t.latest?.subscriber_count ?? 0), 0)
  const pct = Math.min((totalMrr / 5000) * 100, 100)

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Summary banner */}
      <div
        className="rounded-lg border px-6 py-5 flex items-center justify-between animate-fade-up"
        style={{ background: 'var(--vsurface)', borderColor: 'var(--vborder)', borderLeft: '3px solid var(--vgreen)' }}
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 400,
              fontSize: 10,
              color: 'var(--vmuted)',
              letterSpacing: '0.2em',
              marginBottom: 8,
            }}
          >
            COMBINED MRR
          </div>
          <div className="flex items-baseline gap-3">
            <span
              className="tabular-nums"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: 40,
                color: 'var(--vgreen)',
                lineHeight: 1,
              }}
            >
              ${totalMrr.toLocaleString()}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 13, color: 'var(--vmuted)' }}>
              {totalSubs.toLocaleString()} subscribers
            </span>
          </div>
        </div>

        <div className="text-right">
          <div
            className="tabular-nums"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: 28,
              color: pct >= 100 ? 'var(--vgreen)' : 'var(--spark)',
              lineHeight: 1,
            }}
          >
            {pct.toFixed(1)}%
          </div>
          <div
            className="mt-1"
            style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 11, color: 'var(--vmuted)' }}
          >
            to $5K Florida trigger
          </div>
          <div
            className="mt-3 h-1.5 rounded-full overflow-hidden"
            style={{ width: 160, background: 'var(--dim)' }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${pct}%`,
                background: 'linear-gradient(90deg, var(--vgreen), var(--purple))',
                animation: 'progressFill 800ms ease-out both',
              }}
            />
          </div>
        </div>
      </div>

      {/* MRR cards */}
      <div className="grid grid-cols-2 gap-4">
        {productIds.map((id, i) => (
          <MrrCard key={id} product={id} snapshots={byProduct(id)} animDelay={i * 60} />
        ))}
      </div>

      {/* Chart */}
      <RevenueChart snapshots={snapshots ?? []} />

      {/* Snapshot history */}
      <div
        className="rounded-lg border overflow-hidden animate-fade-up"
        style={{ background: 'var(--vsurface)', borderColor: 'var(--vborder)', animationDelay: '200ms' }}
      >
        <div
          className="px-5 py-3 border-b"
          style={{ borderColor: 'var(--vborder)', background: 'var(--vsurface2)' }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 400,
              fontSize: 10,
              color: 'var(--vmuted)',
              letterSpacing: '0.2em',
            }}
          >
            SNAPSHOT HISTORY
          </span>
        </div>

        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--vborder)', background: 'var(--vsurface2)' }}>
              {['Product', 'MRR', 'Subscribers', 'Delta', 'Recorded'].map((h) => (
                <th
                  key={h}
                  className="px-5 py-2.5 text-left"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 400,
                    fontSize: 10,
                    color: 'var(--vmuted)',
                    letterSpacing: '0.1em',
                  }}
                >
                  {h.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(recent ?? []).length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-10 text-center"
                  style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 12, color: 'var(--vmuted)' }}
                >
                  No MRR snapshots yet. POST to /api/mrr to add one.
                </td>
              </tr>
            )}
            {(recent ?? []).map((s, i) => {
              const prev  = (recent ?? []).find((r, j) => j > i && r.product === s.product)
              const delta = prev ? s.mrr_usd - prev.mrr_usd : null
              return (
                <tr
                  key={s.id}
                  style={{ borderBottom: '1px solid var(--vborder)', transition: 'background 0.1s' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--vsurface2)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                >
                  <td className="px-5 py-3">
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 500,
                        fontSize: 12,
                        color: PRODUCT_COLOR[s.product] ?? 'var(--vtext)',
                      }}
                    >
                      {PRODUCT_LABEL[s.product] ?? s.product}
                    </span>
                  </td>
                  <td
                    className="px-5 py-3 tabular-nums"
                    style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: 13, color: 'var(--vtext)' }}
                  >
                    ${s.mrr_usd.toLocaleString()}
                  </td>
                  <td
                    className="px-5 py-3 tabular-nums"
                    style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 12, color: 'var(--vmuted)' }}
                  >
                    {s.subscriber_count.toLocaleString()}
                  </td>
                  <td
                    className="px-5 py-3 tabular-nums"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 400,
                      fontSize: 12,
                      color: delta === null ? 'var(--vmuted)' : delta > 0 ? 'var(--vgreen)' : delta < 0 ? 'var(--vred)' : 'var(--vmuted)',
                    }}
                  >
                    {delta === null ? '—' : `${delta > 0 ? '+' : ''}$${delta}`}
                  </td>
                  <td
                    className="px-5 py-3"
                    style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 11, color: 'var(--vdim)' }}
                  >
                    {new Date(s.recorded_at).toLocaleString()}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
