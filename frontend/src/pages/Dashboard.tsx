import { useMemo } from 'react'
import Navbar from '@/components/layout/Navbar'
import MobileNav from '@/components/layout/MobileNav'
import XPBar from '@/components/ui/XPBar'
import StreakBadge from '@/components/ui/StreakBadge'
import HeatmapCalendar from '@/components/ui/HeatmapCalendar'
import LiquidButton from '@/components/ui/LiquidButton'
import { useLearningStore } from '@/stores/learningStore'

const WEAK = [
  { word: '食べる', romaji: 'taberu', ret: 68 },
  { word: '先生',   romaji: 'sensei', ret: 54 },
  { word: '学校',   romaji: 'gakkō',  ret: 72 },
  { word: '難しい', romaji: 'muzukashii', ret: 45 },
  { word: '勉強',   romaji: 'benkyō', ret: 61 },
]

const ACTIVITY = [
  { icon: '📚', text: 'Completed: N4 Lesson 6 — て-form',        time: '2h ago' },
  { icon: '🃏', text: 'SRS Review: 45 cards · 89% correct',     time: 'Yesterday' },
  { icon: '🏆', text: 'Achievement: 10-Day Streak Unlocked!',    time: '2 days ago' },
  { icon: '📖', text: 'Read: 桜の下で — Comprehension 4/5',       time: '3 days ago' },
  { icon: '🤖', text: 'AI Tutor: 18-min grammar session',        time: '4 days ago' },
]

function retColor(r: number) {
  return r < 60 ? '#ef4444' : r < 75 ? '#f59e0b' : 'hsl(var(--accent-jade))'
}

export default function Dashboard() {
  const { xp, streak } = useLearningStore()

  const heatmapData = useMemo(() => {
    const d: Record<string, number> = {}
    const today = new Date()
    for (let i = 0; i < 364; i++) {
      const dt = new Date(today)
      dt.setDate(dt.getDate() - i)
      d[dt.toISOString().slice(0, 10)] = Math.floor(Math.random() * 45)
    }
    return d
  }, [])

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-5">

        {/* Greeting */}
        <div className="animate-fade-rise">
          <span className="jp text-3xl">おはようございます</span>
          <span className="font-display text-3xl">, Scholar 🌸</span>
        </div>

        {/* Row 1 — Resume */}
        <div className="liquid-glass rounded-3xl p-8 relative overflow-hidden border border-white/8 animate-fade-rise-1"
          style={{ background: 'linear-gradient(120deg,rgba(0,30,60,.85),rgba(0,10,30,.9))' }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 80% 50%,hsl(var(--accent-ember)/0.12) 0%,transparent 60%)' }} />
          <div className="relative flex items-end justify-between gap-6 flex-wrap">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Continue where you left off</p>
              <h2 className="font-display text-3xl mt-1">N4 Grammar — Lesson 7: て-form</h2>
              <p className="text-sm text-muted-foreground mt-1">Last studied: 2 hours ago · Progress: 68%</p>
              <XPBar current={68} max={100} className="mt-3 w-64" />
            </div>
            <LiquidButton ember as="a" href="/flashcards">Resume →</LiquidButton>
          </div>
        </div>

        {/* Row 2 — 3 cols */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* SRS Queue */}
          <div className="liquid-glass rounded-2xl p-6 border border-white/6 animate-fade-rise-1">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Today's Reviews</p>
            <div className="font-display text-5xl mt-2">47</div>
            <p className="text-sm text-muted-foreground">cards due now</p>
            <p className="text-sm text-accent-ember mt-1">+ 15 new</p>
            <XPBar current={14} max={20} className="mt-4" />
            <p className="text-xs text-muted-foreground mt-1">70% of daily goal</p>
            <LiquidButton ember size="sm" className="w-full justify-center mt-4" as="a" href="/flashcards">
              Begin Review →
            </LiquidButton>
          </div>

          {/* Streak */}
          <div className="liquid-glass rounded-2xl p-6 border border-white/6 flex flex-col items-center text-center animate-fade-rise-2">
            <StreakBadge count={streak.current} size="lg" />
            <p className="text-sm text-muted-foreground mt-2">Day Streak</p>
            <div className="flex gap-2 mt-4">
              {['M','T','W','T','F','S','S'].map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className={`w-6 h-6 rounded-full ${streak.weekDays[i] ? 'bg-accent-ember' : 'border border-border'}`} />
                  <span className="text-[10px] text-muted-foreground">{d}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">🔥 3 days to record!</p>
          </div>

          {/* XP */}
          <div className="liquid-glass rounded-2xl p-6 border border-white/6 animate-fade-rise-3">
            <div className="font-display text-4xl">{xp.totalXP.toLocaleString()} <span className="text-2xl">XP</span></div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent-ember/15 text-accent-ember border border-accent-ember/30">
                Level {xp.level}
              </span>
              <span className="text-sm text-muted-foreground">{xp.levelTitle}</span>
            </div>
            <XPBar current={xp.currentXP} max={xp.nextLevelXP} className="mt-4" />
            <p className="text-xs text-muted-foreground mt-1">{xp.currentXP} / {xp.nextLevelXP} to Level {xp.level + 1}</p>
            <div className="mt-4 space-y-2">
              {[['Grammar','hsl(var(--accent-jade))',82],['Kanji','hsl(var(--accent-ember))',61],['Vocabulary','hsl(var(--accent-sakura))',74]].map(([label,color,pct]) => (
                <div key={label as string} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-16">{label}</span>
                  <div className="flex-1 h-1 rounded-full bg-border overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color as string }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-7 text-right">{pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3 — 2 cols */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Weak points */}
          <div className="liquid-glass rounded-2xl p-6 border border-white/6 animate-fade-rise-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg">Needs Attention</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent-ember/15 text-accent-ember border border-accent-ember/30">{WEAK.length}</span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {WEAK.map((w) => (
                <div key={w.word} className="liquid-glass rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                  <div>
                    <span className="jp text-lg">{w.word}</span>
                    <span className="text-xs text-muted-foreground ml-2">{w.romaji}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-1 rounded-full bg-border overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${w.ret}%`, background: retColor(w.ret) }} />
                    </div>
                    <span className="text-xs w-8" style={{ color: retColor(w.ret) }}>{w.ret}%</span>
                    <LiquidButton size="sm" as="a" href="/flashcards" className="text-xs">Study</LiquidButton>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="liquid-glass rounded-2xl p-6 border border-white/6 animate-fade-rise-2">
            <h3 className="font-display text-lg mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {ACTIVITY.map((a, i) => (
                <div key={i} className="flex gap-3 pb-3 border-b border-white/5 last:border-0 last:pb-0">
                  <span className="text-lg flex-shrink-0">{a.icon}</span>
                  <div>
                    <p className="text-sm leading-snug">{a.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 4 — Heatmap */}
        <div className="liquid-glass rounded-2xl p-6 border border-white/6 animate-fade-rise-3">
          <h3 className="font-display text-lg mb-4">Review Activity</h3>
          <HeatmapCalendar data={heatmapData} />
        </div>
      </main>
      <MobileNav />
    </div>
  )
}