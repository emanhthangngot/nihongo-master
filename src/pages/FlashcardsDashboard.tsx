import Navbar from '@/components/layout/Navbar'
import MobileNav from '@/components/layout/MobileNav'
import ProgressRing from '@/components/ui/ProgressRing'
import HeatmapCalendar from '@/components/ui/HeatmapCalendar'
import LiquidButton from '@/components/ui/LiquidButton'
import { useMemo } from 'react'

const WEAK = [
  {word:'食べる',reading:'たべる',ret:68},{word:'先生',reading:'せんせい',ret:54},
  {word:'難しい',reading:'むずかしい',ret:45},{word:'分かる',reading:'わかる',ret:71},
  {word:'勉強',reading:'べんきょう',ret:61},{word:'大きい',reading:'おおきい',ret:78},
]

export default function FlashcardsDashboard() {
  const heatmap = useMemo(() => {
    const d: Record<string,number> = {}
    const today = new Date()
    for (let i=0;i<84;i++) {
      const dt = new Date(today); dt.setDate(dt.getDate()-i)
      d[dt.toISOString().slice(0,10)] = Math.floor(Math.random()*40)
    }
    return d
  },[])

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <h1 className="font-display text-3xl animate-fade-rise">Flashcard Dashboard</h1>

        {/* 3-col grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-rise-1">
          {/* Queue */}
          <div className="liquid-glass rounded-2xl p-6 border border-white/6">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Today's Queue</p>
            <div className="font-display text-5xl">47</div>
            <p className="text-sm text-muted-foreground">due now</p>
            <p className="text-sm text-accent-ember mt-1">+ 15 new</p>
            <LiquidButton ember className="w-full justify-center mt-5" as="a" href="/flashcards">Begin Review →</LiquidButton>
          </div>

          {/* Progress rings */}
          <div className="liquid-glass rounded-2xl p-6 border border-white/6">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Mastery by Category</p>
            <div className="flex justify-around">
              <ProgressRing value={82} size={72} label="Grammar" />
              <ProgressRing value={61} size={72} label="Kanji" color="hsl(var(--accent-jade))" />
              <ProgressRing value={74} size={72} label="Vocab" color="hsl(var(--accent-sakura))" />
            </div>
          </div>

          {/* Stats */}
          <div className="liquid-glass rounded-2xl p-6 border border-white/6 space-y-4">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Stats</p>
            {[
              ['Total Reviews','2,847'],['This Week','189'],
              ['Accuracy','84%'],['Avg. per Day','42'],
            ].map(([k,v]) => (
              <div key={k} className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{k}</span>
                <span className="font-display text-lg">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weak cards */}
        <div className="liquid-glass rounded-2xl p-6 border border-white/6 animate-fade-rise-2">
          <h3 className="font-display text-lg mb-4">Weak Cards — Needs Review</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {WEAK.map(w => (
              <div key={w.word} className="liquid-glass rounded-xl p-4 border border-white/8 flex-shrink-0 min-w-[140px]">
                <div className="jp text-2xl">{w.word}</div>
                <div className="mono text-xs text-muted-foreground mt-1">{w.reading}</div>
                <div className="mt-2 h-1 rounded-full bg-border overflow-hidden">
                  <div className="h-full rounded-full" style={{ width:`${w.ret}%`, background: w.ret<60?'#ef4444':w.ret<75?'#f59e0b':'hsl(var(--accent-jade))' }} />
                </div>
                <div className="text-xs text-muted-foreground mt-1">{w.ret}%</div>
                <LiquidButton size="sm" className="mt-2 w-full justify-center text-xs" as="a" href="/flashcards">Study</LiquidButton>
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap */}
        <div className="liquid-glass rounded-2xl p-6 border border-white/6 animate-fade-rise-3">
          <h3 className="font-display text-lg mb-4">Review History — Last 12 Weeks</h3>
          <HeatmapCalendar data={heatmap} />
        </div>
      </main>
      <MobileNav />
    </div>
  )
}