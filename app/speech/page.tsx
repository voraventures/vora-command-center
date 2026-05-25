import { Mic, Volume2, BookOpen, Activity } from 'lucide-react'

const MODULES = [
  {
    id: 'phoneme',
    label: 'Phoneme Analysis',
    icon: Mic,
    desc: 'Maps Spanish phoneme patterns to American English targets. Identifies and corrects substitution errors in real-time.',
  },
  {
    id: 'prosody',
    label: 'Prosody Training',
    icon: Activity,
    desc: 'Intonation, stress patterns, and rhythm analysis. Compares against native American English speech data.',
  },
  {
    id: 'fluency',
    label: 'Fluency Coach',
    icon: Volume2,
    desc: 'Pacing, connected speech, and reduction patterns. Identifies hesitation markers and flow bottlenecks.',
  },
  {
    id: 'vocab',
    label: 'Vocab & Register',
    icon: BookOpen,
    desc: 'American idiom acquisition, register calibration for professional and technical contexts.',
  },
]

export default function SpeechPage() {
  return (
    <div className="space-y-5 max-w-4xl">
      {/* Banner */}
      <div
        className="rounded-lg border animate-fade-up"
        style={{ background: 'var(--vsurface)', borderColor: 'var(--vborder)', borderLeft: '4px solid #D97706' }}
      >
        <div className="px-6 py-5">
          <div
            style={{
              fontFamily: 'var(--font-dm-mono)',
              fontWeight: 500,
              fontSize: 10,
              color: '#D97706',
              letterSpacing: '0.2em',
              marginBottom: 8,
            }}
          >
            SPEECH COACH
          </div>
          <div
            style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 24, color: 'var(--vtext)', lineHeight: 1, letterSpacing: '-0.02em' }}
          >
            Advanced Accent Refinement
          </div>
          <div
            className="mt-2"
            style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: 'var(--vmuted)' }}
          >
            Spanish native &rarr; American English &middot; Phoneme, prosody &amp; fluency pipeline &middot; Mac Studio M4 Max
          </div>
        </div>
      </div>

      {/* Module cards */}
      <div className="grid grid-cols-2 gap-4">
        {MODULES.map(({ id, label, icon: Icon, desc }, i) => (
          <div
            key={id}
            className="card-hover rounded-lg border animate-fade-up"
            style={{
              background: 'var(--vsurface)',
              borderColor: 'var(--vborder)',
              borderLeft: '4px solid #D97706',
              animationDelay: `${i * 60}ms`,
            }}
          >
            <div className="px-5 pt-5 pb-4">
              <div className="flex items-start gap-3 mb-3">
                <span
                  className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                  style={{ background: '#FFFBEB' }}
                >
                  <Icon className="w-4 h-4" style={{ color: '#D97706' }} />
                </span>
                <div
                  style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 14, color: 'var(--vtext)' }}
                >
                  {label}
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: 'var(--vmuted)', lineHeight: 1.6 }}>
                {desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
