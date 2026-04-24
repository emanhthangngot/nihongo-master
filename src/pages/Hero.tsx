import { Link } from 'react-router-dom'
import LiquidButton from '@/components/ui/LiquidButton'
import StreakBadge from '@/components/ui/StreakBadge'

export default function Hero() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% -20%, hsl(var(--accent-ember)/0.15) 0%, transparent 60%), hsl(var(--background))' }}>
      {/* Decorative JP */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="jp text-[32rem] text-white/[0.015] leading-none">日</span>
      </div>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 liquid-glass border-b border-border/30">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <span className="font-display text-xl">Nihongo<span className="text-muted-foreground">Master</span><sup className="text-[10px]">®</sup></span>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/learning-path" className="hover:text-foreground transition-colors">Features</Link>
            <Link to="/dictionary"    className="hover:text-foreground transition-colors">Dictionary</Link>
            <Link to="/ai-tutor"      className="hover:text-foreground transition-colors">AI Tutor</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign in</Link>
            <LiquidButton ember size="sm" as="a" href="/onboarding">Start Free</LiquidButton>
          </div>
        </div>
      </nav>

      {/* Hero content */}
      <div className="relative z-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 liquid-glass rounded-full px-4 py-2 text-sm text-muted-foreground border border-white/10 mb-8 animate-fade-rise">
          <span className="w-2 h-2 rounded-full bg-accent-jade animate-pulse-glow" style={{boxShadow:'0 0 6px hsl(var(--accent-jade))'}} />
          AI-powered · FSRS memory science · Cinematic UI
        </div>

        <h1 className="font-display text-6xl md:text-7xl leading-[1.05] animate-fade-rise-1">
          From first <span className="jp">ひらがな</span><br/>to JLPT N1 fluency
        </h1>
        <p className="text-muted-foreground text-lg mt-6 max-w-xl mx-auto leading-relaxed animate-fade-rise-2">
          NihongoMaster combines AI tutoring, spaced-repetition science, and a graded reading library — the complete Japanese learning ecosystem.
        </p>

        <div className="flex items-center justify-center gap-4 mt-10 flex-wrap animate-fade-rise-3">
          <LiquidButton ember size="lg" as="a" href="/onboarding">Begin Your Path →</LiquidButton>
          <LiquidButton size="md" as="a" href="/dashboard">Explore Demo</LiquidButton>
        </div>

        <div className="flex items-center justify-center gap-8 mt-12 animate-fade-rise-4 flex-wrap">
          {[['🔥','12-day streaks'],['🃏','FSRS flashcards'],['🤖','RAG AI Tutor'],['📚','Graded reading']].map(([icon,label]) => (
            <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{icon}</span><span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}