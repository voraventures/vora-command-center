import { Landmark, TrendingUp, PiggyBank, Bitcoin } from 'lucide-react'

const AGENTS = [
  {
    id: 'market-intel',
    label: 'Market Intelligence',
    icon: TrendingUp,
    desc: 'Scans equities, indices, and macro signals. Builds daily briefings.',
    model: 'qwen3:14b',
  },
  {
    id: 'portfolio',
    label: 'Portfolio Strategist',
    icon: Landmark,
    desc: 'Analyzes allocation, rebalancing signals, and risk exposure.',
    model: 'qwen3:14b',
  },
  {
    id: 'savings',
    label: 'Savings Optimizer',
    icon: PiggyBank,
    desc: 'Tracks expenses, finds savings opportunities, models scenarios.',
    model: 'qwen3:14b',
  },
  {
    id: 'crypto',
    label: 'Crypto & Alt Assets',
    icon: Bitcoin,
    desc: 'On-chain data, DeFi yields, cross-asset correlation analysis.',
    model: 'qwen3:14b',
  },
]

export default function FinancePage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div
        className="rounded-lg border p-6"
        style={{
          background: 'oklch(0.14 0.022 255)',
          borderColor: 'color-mix(in oklch, #10B981 25%, oklch(0.27 0.035 255))',
        }}
      >
        <div
          className="text-[10px] uppercase tracking-widest mb-1"
          style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--finance)' }}
        >
          Finance Agent Suite
        </div>
        <div
          className="text-vtext mt-1"
          style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 22 }}
        >
          Local Intelligence Stack
        </div>
        <div
          className="text-vmuted text-[12px] mt-2"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          4 specialized agents running on Mac Studio M4 Max &middot; qwen3:14b via Ollama
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {AGENTS.map(({ id, label, icon: Icon, desc, model }) => (
          <div
            key={id}
            className="rounded-lg border border-vborder p-5"
            style={{ background: 'oklch(0.14 0.02 255)' }}
          >
            <div className="flex items-start gap-3 mb-3">
              <span
                className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                style={{ background: 'oklch(0.70 0.17 155 / 0.1)' }}
              >
                <Icon className="w-4 h-4" style={{ color: 'var(--finance)' }} />
              </span>
              <div>
                <div
                  className="text-vtext text-[13px]"
                  style={{ fontFamily: 'var(--font-dm-mono)' }}
                >
                  {label}
                </div>
                <div
                  className="text-vdim text-[10px] mt-0.5"
                  style={{ fontFamily: 'var(--font-dm-mono)' }}
                >
                  mac_studio &middot; {model}
                </div>
              </div>
            </div>
            <div
              className="text-vmuted text-[11px] leading-relaxed"
              style={{ fontFamily: 'var(--font-dm-mono)' }}
            >
              {desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
