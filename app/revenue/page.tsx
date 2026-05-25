import { createServerClient } from '@/lib/supabase'
import { MrrCard } from '@/components/mrr-card'
import { RevenueChart } from '@/components/revenue-chart'

export const revalidate = 30

export default async function RevenuePage() {
  const supabase = createServerClient()

  const { data: snapshots } = await supabase
    .from('mrr_snapshots')
    .select('*')
    .order('recorded_at', { ascending: true })

  const { data: recent } = await supabase
    .from('mrr_snapshots')
    .select('*')
    .order('recorded_at', { ascending: false })
    .limit(20)

  const productIds = ['sparkcheck', 'twitter_growth_optimizer']
  const snapshotsByProduct = (product: string) =>
    (snapshots ?? []).filter((s) => s.product === product)

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-mono text-sm font-bold tracking-widest text-white uppercase">
          Revenue
        </h1>
        <p className="font-mono text-[11px] text-zinc-500 mt-1">
          MRR tracking · $5K FI trigger
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {productIds.map((id) => (
          <MrrCard key={id} product={id} snapshots={snapshotsByProduct(id)} />
        ))}
      </div>

      <RevenueChart snapshots={snapshots ?? []} />

      <div className="border border-[#1E1E1E] bg-[#0F0F0F] rounded overflow-hidden">
        <div className="px-4 py-2 border-b border-[#1E1E1E]">
          <span className="font-mono text-[10px] text-zinc-500 tracking-widest uppercase">
            Snapshot History
          </span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1E1E1E]">
              {['Product', 'MRR', 'Subs', 'Recorded'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2 text-left font-mono text-[10px] text-zinc-600 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E1E1E]">
            {(recent ?? []).map((s) => (
              <tr key={s.id} className="hover:bg-[#0A0A0A]">
                <td className="px-4 py-2 font-mono text-xs text-zinc-300">{s.product}</td>
                <td className="px-4 py-2 font-mono text-xs text-white">${s.mrr_usd}</td>
                <td className="px-4 py-2 font-mono text-xs text-zinc-400">{s.subscriber_count}</td>
                <td className="px-4 py-2 font-mono text-[10px] text-zinc-600">
                  {new Date(s.recorded_at).toLocaleString()}
                </td>
              </tr>
            ))}
            {(recent ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center font-mono text-xs text-zinc-600">
                  No data yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
