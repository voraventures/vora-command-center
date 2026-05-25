import { Mic, Volume2, BookOpen, Activity } from 'lucide-react'

const MODULES = [
  {
    id: 'phoneme',
    label: 'Phoneme Analysis',
    icon: Mic,
    desc: 'Maps Spanish phoneme patterns to American English targets. Identifies substitution errors in real-time.',
  },
  {
    id: 'prosody',
    label: 'Prosody Training',
    icon: Activity,
    desc: 'Intonation, stress, and rhythm analysis. Compares against native American English speech patterns.',
  },
  {
    id: 'fluency',
    label: 'Fluency Coach',
    icon: Volume2,
    desc: 'Pacing, connected speech, and reduction patterns. Identifies hesitation and flow bottlenecks.',
  },
  {
    id: 'vocab',
    label: 'Vocab & Register',
    icon: BookOpen,
    desc: 'American idiom acquisition, register calibration for professional contexts.',
  },
]

export default function SpeechPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div
        className="rounded-lg border p-6"
        style={{
          background: 'oklch(0.14 0.022 255)',
          borderColor: 'color-mix(in oklch, #F59E0B 25%, oklch(0.27 0.035 255))',
        }}
      >
        <div
          className="text-[10px] uppercase tracking-widest mb-1"
          style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--speech)' }}
        >
          Speech Coach
        </div>
        <div
          className="text-vtext mt-1"
          style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 22 }}
        >
          Advanced Accent Refinement
        </div>
        <div
          className="text-vmuted text-[12px] mt-2"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          Spanish native &rarr; American English &middot; Phoneme + prosody + fluency pipeline
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {MODULES.map(({ id, label, icon: Icon, desc }) => (
          <div
            key={id}
            className="rounded-lg border border-vborder p-5"
            style={{ background: 'oklch(0.14 0.02 255)' }}
          >
            <div className="flex items-start gap-3 mb-3">
              <span
                className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                style={{ background: 'oklch(0.78 0.18 70 / 0.1)' }}
              >
                <Icon className="w-4 h-4" style={{ color: 'var(--speech)' }} />
              </span>
              <div
                className="text-vtext text-[13px]"
                style={{ fontFamily: 'var(--font-dm-mono)' }}
              >
                {label}
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
