import { Link, useLocation } from 'react-router-dom'

const LINKS = [
  { icon: '🏠', label: 'Home',   to: '/dashboard' },
  { icon: '📚', label: 'Path',   to: '/learning-path' },
  { icon: '🃏', label: 'Cards',  to: '/flashcards' },
  { icon: '🤖', label: 'Tutor',  to: '/ai-tutor' },
  { icon: '辞', label: 'Dict',   to: '/dictionary', jp: true },
]

export default function MobileNav() {
  const { pathname } = useLocation()
  return (
    <nav className="liquid-glass fixed bottom-0 left-0 right-0 z-50 h-16 flex items-center justify-around border-t border-border md:hidden">
      {LINKS.map((l) => {
        const active = pathname.startsWith(l.to)
        return (
          <Link key={l.to} to={l.to}
            className={`flex flex-col items-center gap-0.5 ${active ? 'text-accent-ember' : 'text-muted-foreground'}`}>
            <span className={`text-xl ${l.jp ? 'jp' : ''}`}>{l.icon}</span>
            <span className="text-[10px]">{l.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}