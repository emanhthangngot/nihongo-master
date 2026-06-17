import { Link, useLocation } from 'react-router-dom'
import { useLearningStore } from '@/stores/learningStore'
import { useSettingsStore } from '@/stores/settingsStore'
import LiquidButton from '@/components/ui/LiquidButton'

const NAV_LINKS = [
  { label: 'Dashboard',  to: '/dashboard' },
  { label: 'Path',       to: '/learning-path' },
  { label: 'AI Tutor',   to: '/ai-tutor' },
  { label: 'Flashcards', to: '/flashcards' },
  { label: 'Dictionary', to: '/dictionary' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const streak   = useLearningStore((s) => s.streak)
  const { furigana, toggleFurigana } = useSettingsStore()

  return (
    <nav className="liquid-glass sticky top-0 z-50 w-full border-b border-border/30">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="font-display text-xl text-foreground whitespace-nowrap flex-shrink-0">
          Nihongo<span className="text-muted-foreground">Master</span>
          <sup className="text-[10px] align-super">®</sup>
        </Link>

        {/* Center nav */}
        <ul className="hidden md:flex items-center gap-1 list-none">
          {NAV_LINKS.map((l) => {
            const active = pathname.startsWith(l.to)
            return (
              <li key={l.to}>
                <Link to={l.to}
                  className={`text-sm px-3 py-1.5 rounded-full transition-colors ${
                    active ? 'text-foreground bg-white/8 font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}>
                  {l.label}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Right side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Search */}
          <button className="text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-white/5 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>

          {/* Furigana toggle */}
          <button
            onClick={toggleFurigana}
            title="Toggle furigana"
            className={`jp text-sm px-2 py-1 rounded-lg transition-colors ${furigana ? 'text-accent-ember bg-accent-ember/10' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}
          >あ</button>

          {/* Streak */}
          <div className="flex items-center gap-1.5 text-[13px] font-medium text-accent-ember px-3 py-1 rounded-full bg-accent-ember/10 border border-accent-ember/20">
            🔥 {streak.current}
          </div>

          {/* Quick Practice */}
          <LiquidButton size="sm" className="hidden md:inline-flex">
            Quick Practice
          </LiquidButton>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/20 flex items-center justify-center text-xs cursor-pointer">
            你
          </div>
        </div>
      </div>
    </nav>
  )
}