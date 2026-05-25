import { createServerClient } from '@/lib/supabase'
import { MrrCard } from '@/components/mrr-card'
import { RevenueChart } from '@/components/revenue-chart'

export const revalidate = 30

const PRODUCT_LABEL: Record<string, string> = {
  sparkcheck: 'SparkCheck',
  twitter_growth_optimizer: 'Twitter Growth Opt.',
}

const PRODUCT_COLOR: Record<string, string> = {
  sparkcheck: '#FF4D8D',
  twitter_growth_optimizer: '#1D9BF0',
}

export default async function RevenuePage() {
  const supabase = createServerClient()

  const [{ data: snapshots }, { data: recent }] = await Promise.all([
    supabase.from('mrr_snapshots').select('*').order('recorded_at', { ascending: true }),
    supabase.from('mrr_snapshots').select('*').order('recorded_at', { ascending: false }).limit(40),
  ])

  const productIds = ['sparkcheck', 'twitter_growth_optimizer']
  const snapshotsByProduct = (id: string) => (snapshots ?? []).filter((s) => s.product === id)

  const totals = productIds.map((id) => {
    const snaps = snapshotsByProduct(id)
    const latest = snaps[snaps.length - 1]
    const prev = snaps[snaps.length - 2]
    return { id, latest, prev, delta: latest && prev ? latest.mrr_usd - prev.mrr_usd : 0 }
  })

  const totalMrr = totals.reduce((s, t) => s + (t.latest?.mrr_usd ?? 0), 0)
  const totalSubs = totals.reduce((s, t) => s + (t.latest?.subscriber_count ?? 0), 0)
  const pct = Math.min((totalMrr / 5000) * 100, 100)

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Summary banner */}
      <div
        className="rounded-lg border border-vborder px-6 py-5 flex items-center justify-between"
        style={{ background: 'oklch(0.14 0.02 255)' }}
      >
        <div>
          <div
            className="text-vtext tabular-nums leading-none"
            style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 36 }}
          >
            ${totalMrr.toLocaleString()}
          </div>
          <div
            className="text-vmuted text-[11px] mt-2"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            Combined MRR &middot; {totalSubs} subscribers
          </div>
        </div>
        <div className="text-right">
          <div
            className="text-vgreen tabular-nums"
            style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 24 }}
          >
            {pct.toFixed(1)}%
          </div>
          <div
            className="text-vdim text-[10px] mt-1"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            to $5K Florida move trigger
          </div>
          <div className="mt-2 h-1 w-40 rounded-full bg-vsurface2">
            <div
              className="h-full rounded-full bg-vgreen"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Per-product MRR cards */}
      <div className="grid grid-cols-2 gap-4">
        {productIds.map((id) => (
          <MrrCard key={id} product={id} snapshots={snapshotsByProduct(id)} />
        ))}
      </div>

      {/* Chart */}
      <RevenueChart snapshots={snapshots ?? []} />

      {/* Snapshot history table */}
      <div
        className="rounded-lg border border-vborder overflow-hidden"
        style={{ background: 'oklch(0.14 0.02 255)' }}
      >
        <div
          className="px-5 py-3 border-b border-vborder flex items-center"
          style={{ background: 'oklch(0.17 0.018 255)' }}
        >
          <span
            className="text-[10px] text-vmuted uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            Snapshot History
          </span>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-vborder">
              {['Product', 'MRR', 'Subscribers', 'Delta', 'Recorded'].map((h) => (
                <th
                  key={h}
                  className="px-5 py-2.5 text-left text-[10px] text-vdim uppercase tracking-wider"
                  style={{ fontFamily: 'var(--font-dm-mono)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-vborder">
            {(recent ?? []).length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-10 text-center text-[11px] text-vdim"
                  style={{ fontFamily: 'var(--font-dm-mono)' }}
                >
                  No MRR snapshots yet. POST to /api/mrr to add one.
                </td>
              </tr>
            )}
            {(recent ?? []).map((s, i) => {
              const prev = (recent ?? []).find(
                (r, j) => j > i && r.product === s.product
              )
              const delta = prev ? s.mrr_usd - prev.mrr_usd : null
              return (
                <tr
                  key={s.id}
                  className="hover:bg-vsurface transition-colors duration-100"
                >
                  <td className="px-5 py-2.5">
                    <span
                      className="text-[12px]"
                      style={{
                        fontFamily: 'var(--font-dm-mono)',
                        color: PRODUCT_COLOR[s.product] ?? 'var(--vtext)',
                      }}
                    >
                      {PRODUCT_LABEL[s.product] ?? s.product}
                    </span>
                  </td>
                  <td
                    className="px-5 py-2.5 text-vtext tabular-nums text-[12px]"
                    style={{ fontFamily: 'var(--font-dm-mono)' }}
                  >
                    ${s.mrr_usd.toLocaleString()}
                  </td>
                  <td
                    className="px-5 py-2.5 text-vmuted tabular-nums text-[12px]"
                    style={{ fontFamily: 'var(--font-dm-mono)' }}
                  >
                    {s.subscriber_count}
                  </td>
                  <td
                    className="px-5 py-2.5 tabular-nums text-[12px]"
                    style={{
                      fontFamily: 'var(--font-dm-mono)',
                      color:
                        delta === null
                          ? 'var(--vdim)'
                          : delta > 0
                          ? 'var(--vgreen)'
                          : delta < 0
                          ? 'var(--vred)'
                          : 'var(--vdim)',
                    }}
                  >
                    {delta === null ? '—' : `${delta > 0 ? '+' : ''}$${delta}`}
                  </td>
                  <td
                    className="px-5 py-2.5 text-vdim text-[10px] tabular-nums"
                    style={{ fontFamily: 'var(--font-dm-mono)' }}
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
