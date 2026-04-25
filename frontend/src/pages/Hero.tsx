import { Link } from 'react-router-dom'
import LiquidButton from '@/components/ui/LiquidButton'

const FEATURE_PILLS = [
  'AI Conversation Tutor',
  'SRS Flashcards',
  'Kanji Breakdown',
  'JLPT Skill Tree',
  'Graded Reading',
]

const STATS = [
  { value: '2,000+', label: 'Kanji N1' },
  { value: 'FSRS', label: 'Memory science' },
  { value: 'RAG AI', label: 'Tutor engine' },
  { value: 'N5→N1', label: 'Full path' },
]

export default function Hero() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% -10%, hsl(var(--accent-ember) / 0.12) 0%, transparent 55%), hsl(var(--background))' }}>

      {/* Large decorative character */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="jp leading-none" style={{ fontSize: '36rem', color: 'rgba(255,255,255,0.012)' }}>日</span>
      </div>

      {/* Navbar */}
      <nav className="liquid-glass relative z-50 border-b border-white/8">
        <div className="max-w-[90rem] mx-auto px-8 py-[1.1rem] flex items-center justify-between gap-6">
          <span className="font-display text-xl whitespace-nowrap flex-shrink-0">
            Nihongo<span className="text-muted-foreground">Master</span><sup className="text-[10px] align-super">®</sup>
          </span>

          <ul className="hidden md:flex items-center gap-1 list-none">
            {[
              { label: 'Dashboard',  to: '/dashboard' },
              { label: 'AI Tutor',   to: '/ai-tutor' },
              { label: 'Flashcards', to: '/flashcards' },
              { label: 'Dictionary', to: '/dictionary' },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to}
                  className="text-sm text-muted-foreground hover:text-foreground hover:bg-white/6 px-3 py-1.5 rounded-full transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign in</Link>
            <LiquidButton ember size="sm" as="a" href="/onboarding">Begin Journey</LiquidButton>
          </div>
        </div>
      </nav>

      {/* Hero content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 relative z-10">
        <h1 className="font-display leading-[0.97] tracking-tight text-foreground animate-fade-rise"
          style={{ fontSize: 'clamp(2.4rem, 6.5vw, 5.5rem)', letterSpacing: '-2px', maxWidth: '72rem' }}>
          Master Japanese <span className="text-muted-foreground">the way a</span>{' '}
          student <span className="text-muted-foreground">becomes a scholar.</span>
        </h1>

        <p className="text-muted-foreground mt-6 max-w-[34rem] leading-relaxed animate-fade-rise-1"
          style={{ fontSize: 'clamp(0.875rem, 1.4vw, 1rem)' }}>
          Nihongo Master pairs spaced repetition, AI conversation, and graded reading
          into one seamless practice — from your first hiragana to JLPT N1 fluency.
        </p>

        <div className="flex items-center justify-center gap-4 mt-7 flex-wrap animate-fade-rise-2">
          <LiquidButton ember size="lg" as="a" href="/onboarding">Begin Your Path →</LiquidButton>
          <LiquidButton size="md" as="a" href="/dashboard">Explore Demo</LiquidButton>
        </div>

        {/* Feature pills — liquid glass */}
        <div className="flex gap-3 mt-5 flex-wrap justify-center animate-fade-rise-3">
          {FEATURE_PILLS.map((pill) => (
            <span key={pill}
              className="liquid-glass rounded-full px-5 py-2 text-sm text-muted-foreground border border-white/8">
              {pill}
            </span>
          ))}
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-center gap-8 mt-12 animate-fade-rise-4 flex-wrap">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="font-display text-2xl text-foreground">{value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
