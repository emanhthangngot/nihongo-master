import { useMemo, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import MobileNav from '@/components/layout/MobileNav'
import XPBar from '@/components/ui/XPBar'
import StreakBadge from '@/components/ui/StreakBadge'
import HeatmapCalendar from '@/components/ui/HeatmapCalendar'
import LiquidButton from '@/components/ui/LiquidButton'
import { useLearningStore } from '@/stores/learningStore'
import { BookOpen, Trophy, Target, Zap, ArrowRight, AlertCircle } from 'lucide-react'

function retColor(r: number) {
  return r < 60 ? '#ef4444' : r < 75 ? '#f59e0b' : 'hsl(var(--accent-jade))'
}

export default function Dashboard() {
  const { xp, streak, srsQueue, fetchStats, fetchSRSQueue, isLoading, dailyQuests } = useLearningStore()

  useEffect(() => {
    fetchStats()
    fetchSRSQueue()
  }, [fetchStats, fetchSRSQueue])

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

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10" />
        <div className="space-y-2">
          <div className="w-32 h-2 bg-white/5 rounded-full" />
          <div className="w-24 h-2 bg-white/5 rounded-full mx-auto" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-[100dvh] pb-24 bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">

        {/* Greeting Section */}
        <header className="animate-fade-rise flex flex-col gap-1">
          <div className="flex items-center gap-3">
             <span className="jp text-4xl font-medium tracking-tight">おはようございます</span>
             <span className="text-4xl opacity-20">/</span>
             <span className="font-display text-4xl italic">Scholar</span>
          </div>
          <p className="text-muted-foreground text-sm uppercase tracking-[0.2em] font-medium mt-2">Current path: JLPT N4 Master</p>
        </header>

        {/* Hero Action — Resume */}
        <section className="liquid-glass rounded-[2.5rem] p-10 relative overflow-hidden border border-white/10 animate-fade-rise-1 group"
          style={{ background: 'linear-gradient(145deg, rgba(15,23,42,0.6), rgba(2,6,23,0.8))' }}>
          
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-ember/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-accent-ember/10 transition-colors duration-700" />
          
          <div className="relative flex items-center justify-between gap-10 flex-wrap">
            <div className="space-y-4 max-w-xl">
              <div className="flex items-center gap-2 text-accent-ember">
                <Zap size={16} fill="currentColor" />
                <span className="text-[11px] uppercase tracking-[0.3em] font-bold">Recommended Next Step</span>
              </div>
              <h2 className="font-display text-5xl leading-[1.1]">N4 Grammar — Lesson 7: <span className="jp italic text-white/90">て-form</span></h2>
              <p className="text-muted-foreground leading-relaxed">You're making great progress. Finish this lesson to unlock the N4 Reading module.</p>
              
              <div className="flex items-center gap-4 pt-2">
                <XPBar current={68} max={100} className="w-64 h-2" />
                <span className="text-xs font-mono text-muted-foreground">68% COMPLETE</span>
              </div>
            </div>
            
            <LiquidButton ember size="lg" as="a" href="/flashcards" className="px-10 h-16 text-lg font-medium shadow-2xl">
              Resume Path <ArrowRight size={20} />
            </LiquidButton>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* SRS Card */}
          <div className="md:col-span-4 liquid-glass rounded-[2rem] p-8 border border-white/10 animate-fade-rise-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Memory Queue</p>
                <Target size={16} className="text-muted-foreground/30" />
              </div>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="font-display text-7xl">{srsQueue.length}</span>
                <span className="text-muted-foreground uppercase tracking-widest text-[10px]">Cards</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Scheduled for review today</p>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
               <div className="flex items-center justify-between text-xs">
                 <span className="text-muted-foreground">Daily Progress</span>
                 <span className="text-accent-ember font-medium">14/20</span>
               </div>
               <XPBar current={14} max={20} className="h-1" />
               <LiquidButton ember size="sm" className="w-full justify-center mt-2" as="a" href="/flashcards">
                Start Session
              </LiquidButton>
            </div>
          </div>

          {/* Streak Card */}
          <div className="md:col-span-4 liquid-glass rounded-[2rem] p-8 border border-white/10 flex flex-col items-center justify-center text-center animate-fade-rise-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-accent-ember/5 to-transparent pointer-events-none" />
            <StreakBadge count={streak.current} size="lg" className="mb-4" />
            <h3 className="font-display text-3xl">Active Streak</h3>
            
            <div className="flex gap-2.5 mt-8">
              {['M','T','W','T','F','S','S'].map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold transition-all ${streak.weekDays[i] ? 'bg-accent-ember text-white shadow-lg shadow-accent-ember/20' : 'bg-white/5 text-muted-foreground/40 border border-white/5'}`}>
                    {d}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-6 uppercase tracking-[0.2em] font-medium">{streak.current > 0 ? `Don't break the momentum!` : 'Begin your journey'}</p>
          </div>

          {/* XP & Leveling */}
          <div className="md:col-span-4 liquid-glass rounded-[2rem] p-8 border border-white/10 animate-fade-rise-3 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                 <div className="flex flex-col">
                    <span className="font-display text-4xl">{xp.totalXP.toLocaleString()} <span className="text-xl opacity-40">XP</span></span>
                    <span className="text-[10px] text-accent-ember uppercase tracking-[0.2em] font-bold mt-1">Level {xp.level} · {xp.levelTitle}</span>
                 </div>
                 <Trophy size={20} className="text-accent-ember/40" />
              </div>
              <XPBar current={xp.currentXP} max={xp.nextLevelXP} className="h-1.5" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{xp.currentXP} / {xp.nextLevelXP} to next level</p>
            </div>

            <div className="mt-8 space-y-3">
              {[
                ['Grammar','hsl(var(--accent-jade))',82],
                ['Kanji','hsl(var(--accent-ember))',61],
                ['Vocab','hsl(var(--accent-sakura))',74]
              ].map(([label,color,pct]) => (
                <div key={label as string} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] uppercase tracking-widest">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground/80">{pct}%</span>
                  </div>
                  <div className="h-[2px] rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: color as string }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Secondary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Daily Quests */}
          <div className="md:col-span-5 liquid-glass rounded-[2rem] p-8 border border-white/10 animate-fade-rise-1">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-display text-2xl tracking-tight">Active Quests</h3>
              <span className="text-[10px] font-mono px-2 py-1 rounded-md bg-white/5 border border-white/10 text-muted-foreground">RESET IN 14H</span>
            </div>
            
            <div className="space-y-4">
              {dailyQuests.length > 0 ? dailyQuests.map((q) => (
                <div key={q.id} className={`p-4 rounded-2xl border transition-all ${q.completed ? 'bg-accent-jade/5 border-accent-jade/20 opacity-60' : 'bg-white/2 border-white/5 hover:border-white/10'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className={`text-sm font-medium ${q.completed ? 'line-through text-accent-jade' : ''}`}>{q.title}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">+{q.xpReward} XP REWARD</p>
                    </div>
                    {q.completed ? <div className="w-5 h-5 rounded-full bg-accent-jade flex items-center justify-center text-[10px]">✓</div> : <span className="text-[10px] font-mono opacity-40">{q.current}/{q.target}</span>}
                  </div>
                </div>
              )) : (
                <div className="text-center py-10 opacity-30 italic text-sm">Loading quests...</div>
              )}
            </div>
          </div>

          {/* Needs Attention / Recent Activity - Swapping for a single dense info tile */}
          <div className="md:col-span-7 liquid-glass rounded-[2rem] p-8 border border-white/10 animate-fade-rise-2 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-display text-2xl tracking-tight">Memory Weak Points</h3>
              <div className="flex items-center gap-1.5 text-[10px] text-red-400 font-bold uppercase tracking-[0.2em]">
                <AlertCircle size={12} /> Priority Review
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              {[
                { word: '食べる', reading: 'たべる', ret: 68 },
                { word: '先生',   reading: 'せんせい', ret: 54 },
                { word: '難しい', reading: 'むずかしい', ret: 45 },
                { word: '勉強',   reading: 'べんきょう', ret: 61 },
              ].map((w) => (
                <div key={w.word} className="liquid-glass rounded-2xl p-5 border border-white/5 hover:border-white/15 transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex flex-col">
                      <span className="jp text-2xl group-hover:text-accent-ember transition-colors">{w.word}</span>
                      <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{w.reading}</span>
                    </div>
                    <div className="text-right">
                       <span className="text-xs font-mono" style={{ color: retColor(w.ret) }}>{w.ret}%</span>
                    </div>
                  </div>
                  <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${w.ret}%`, background: retColor(w.ret) }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
               <button className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold hover:text-white transition-colors flex items-center gap-2">View full analysis <ArrowRight size={12} /></button>
            </div>
          </div>
        </div>

        {/* Heatmap Activity */}
        <section className="liquid-glass rounded-[2rem] p-8 border border-white/10 animate-fade-rise-3">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
               <BookOpen size={20} className="text-accent-jade/40" />
               <h3 className="font-display text-2xl tracking-tight">Review Activity</h3>
             </div>
             <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">LAST 365 DAYS</p>
          </div>
          <div className="overflow-x-auto pb-2">
            <HeatmapCalendar data={heatmapData} />
          </div>
        </section>

      </main>
      <MobileNav />
    </div>
  )
}
