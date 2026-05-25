import { createServerClient } from '@/lib/supabase'
import { RevenueChart } from '@/components/revenue-chart'
import { SubscriberDonut } from '@/components/subscriber-donut'

export const revalidate = 30

const PRODUCT_LABEL: Record<string, string> = {
  sparkcheck:               'SparkCheck',
  twitter_growth_optimizer: 'Twitter Growth Opt.',
}
const PRODUCT_COLOR: Record<string, string> = {
  sparkcheck:               '#FF4D8D',
  twitter_growth_optimizer: '#1D9BF0',
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

  const sparkMrr   = totals.find(t => t.id === 'sparkcheck')?.latest?.mrr_usd ?? 0
  const twitterMrr = totals.find(t => t.id === 'twitter_growth_optimizer')?.latest?.mrr_usd ?? 0
  const sparkSubs   = totals.find(t => t.id === 'sparkcheck')?.latest?.subscriber_count ?? 0
  const twitterSubs = totals.find(t => t.id === 'twitter_growth_optimizer')?.latest?.subscriber_count ?? 0
  const pctToTarget = Math.min((totalMrr / 5000) * 100, 100)

  return (
    <div className="space-y-10 max-w-5xl">

      {/* SECTION 01 — MRR OVERVIEW */}
      <section className="space-y-4">
        <SectionHeader n="01" title="MRR Overview" subtitle="Stripe · live revenue" />
        <div className="grid grid-cols-3 gap-4">
          {/* Total MRR */}
          <div style={{ background: 'var(--vsurface)', border: '1px solid var(--vborder)', borderRadius: 12, padding: '20px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: '#9C6FFF', letterSpacing: '0.15em', marginBottom: 8 }}>TOTAL MRR</div>
            <div className="tabular-nums" style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 40, color: '#00E676', lineHeight: 1 }}>
              ${totalMrr.toLocaleString()}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 11, color: 'var(--vmuted)', marginTop: 6 }}>
              {totalSubs} subscribers
            </div>
          </div>

          {/* SparkCheck */}
          <div style={{ background: 'var(--vsurface)', border: '1px solid var(--vborder)', borderRadius: 12, padding: '20px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: '#FF4D8D', letterSpacing: '0.15em', marginBottom: 8 }}>SPARKCHECK</div>
            <div className="tabular-nums" style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 32, color: '#FF4D8D', lineHeight: 1 }}>
              ${sparkMrr.toLocaleString()}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 11, color: 'var(--vmuted)', marginTop: 6 }}>
              {sparkSubs} subscribers
            </div>
          </div>

          {/* Twitter Growth */}
          <div style={{ background: 'var(--vsurface)', border: '1px solid var(--vborder)', borderRadius: 12, padding: '20px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: '#1D9BF0', letterSpacing: '0.15em', marginBottom: 8 }}>TWITTER GROWTH</div>
            <div className="tabular-nums" style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 32, color: '#1D9BF0', lineHeight: 1 }}>
              ${twitterMrr.toLocaleString()}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 11, color: 'var(--vmuted)', marginTop: 6 }}>
              {twitterSubs} subscribers
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 02 — REVENUE GROWTH */}
      <section className="space-y-4">
        <SectionHeader n="02" title="Revenue Growth" subtitle="Historical MRR snapshots" />
        <div style={{ background: 'var(--vsurface)', border: '1px solid var(--vborder)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--vsurface2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: 'var(--vmuted)', letterSpacing: '0.15em' }}>REVENUE GROWTH</span>
            <span className="px-2 py-0.5 rounded" style={{ border: '1px solid var(--vborder)', fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 9, color: 'var(--vmuted)' }}>ALL TIME</span>
          </div>
          <RevenueChart snapshots={snapshots ?? []} />
        </div>
      </section>

      {/* SECTION 03 — SUBSCRIBER DISTRIBUTION */}
      <section className="space-y-4">
        <SectionHeader n="03" title="Subscriber Distribution" subtitle="Across all products" />
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <SubscriberDonut sparkSubs={sparkSubs} twitterSubs={twitterSubs} />
          </div>
          <div
            className="col-span-2 rounded-lg border overflow-hidden animate-fade-up"
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
      </section>

      {/* SECTION 04 — FL MOVE TARGET */}
      <section className="space-y-4">
        <SectionHeader n="04" title="FL Move Target" subtitle="$5,000 MRR Florida trigger" />
        <div style={{ background: 'var(--vsurface)', border: '1px solid var(--vborder)', borderLeft: '3px solid #00E676', borderRadius: 12, padding: '24px 28px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: '#9C6FFF', letterSpacing: '0.15em', marginBottom: 12 }}>FL MOVE PROGRESS</div>
          <div className="flex items-baseline gap-3" style={{ marginBottom: 20 }}>
            <span className="tabular-nums" style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 48, color: '#00E676', lineHeight: 1 }}>
              ${totalMrr.toLocaleString()}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 14, color: 'var(--vmuted)' }}>/ $5,000 MRR</span>
          </div>

          {/* Progress track */}
          <div style={{ height: 8, borderRadius: 4, background: '#252D45', position: 'relative', overflow: 'hidden' }}>
            <div style={{ width: `${pctToTarget}%`, height: '100%', borderRadius: 4, background: 'linear-gradient(90deg, #00E676, #9C6FFF)' }} />
          </div>

          {/* Milestone labels */}
          <div style={{ position: 'relative', marginTop: 12, height: 18 }}>
            {[
              { value: 1000,  label: '$1K',   pct: 20 },
              { value: 2500,  label: '$2.5K', pct: 50 },
              { value: 5000,  label: '$5K',   pct: 100 },
            ].map((m) => (
              <div
                key={m.value}
                style={{
                  position: 'absolute',
                  left: `${m.pct}%`,
                  transform: m.pct === 100 ? 'translateX(-100%)' : m.pct === 0 ? 'none' : 'translateX(-50%)',
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: totalMrr >= m.value ? '#00E676' : 'var(--vmuted)' }}>
                  {m.label}
                </span>
              </div>
            ))}
          </div>

          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 12, color: 'var(--vmuted)', marginTop: 16 }}>
            {pctToTarget.toFixed(1)}% to Florida. ${(5000 - totalMrr).toLocaleString()} remaining.
          </div>
        </div>
      </section>
    </div>
  )
}
