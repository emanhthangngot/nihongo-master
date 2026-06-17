import { useState, useEffect, useMemo } from 'react'
import Navbar from '@/components/layout/Navbar'
import MobileNav from '@/components/layout/MobileNav'
import SkillTreeNode from '@/components/ui/SkillTreeNode'
import XPBar from '@/components/ui/XPBar'
import LiquidButton from '@/components/ui/LiquidButton'
import { learningService } from '@/services/learning.service'
import type { LearningNode } from '@/services/learning.service'

const LEVELS = ['N5','N4','N3','N2','N1'] as const
type Level = typeof LEVELS[number]

export default function LearningPath() {
  const [level, setLevel] = useState<Level>('N4')
  const [nodes, setNodes] = useState<LearningNode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selected, setSelected] = useState<LearningNode | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const { nodes: fetchedNodes } = await learningService.getPath(level)
        setNodes(fetchedNodes)
      } catch (err) {
        console.error('Failed to fetch learning path:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [level])

  const stats = useMemo(() => {
    const counts = { grammar: [0, 0], kanji: [0, 0], vocab: [0, 0] }
    nodes.forEach(n => {
      const type = n.type as keyof typeof counts
      if (counts[type]) {
        counts[type][1]++
        if (n.userProgress?.status === 'completed') counts[type][0]++
      }
    })
    const total = nodes.length
    const completed = nodes.filter(n => n.userProgress?.status === 'completed').length
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0
    return { progress, ...counts }
  }, [nodes])

  const categorizedNodes = useMemo(() => {
    return {
      grammar: nodes.filter(n => n.type === 'grammar'),
      kanji: nodes.filter(n => n.type === 'kanji'),
      vocab: nodes.filter(n => n.type === 'vocab')
    }
  }, [nodes])

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-white/10" />
        <div className="w-32 h-4 bg-white/10 rounded" />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col pb-20">
      <Navbar />
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-48 flex-shrink-0 border-r border-border p-4 gap-1">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">JLPT Level</p>
          {LEVELS.map((l) => (
            <button key={l} onClick={() => { setLevel(l); setSelected(null) }}
              className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-sm transition-all border ${
                level === l
                  ? 'text-accent-ember bg-accent-ember/10 border-accent-ember/30 font-medium'
                  : 'text-muted-foreground border-transparent hover:bg-white/5 hover:text-foreground'
              }`}>
              <span>{l}</span>
            </button>
          ))}
        </aside>

        <main className="flex-1 p-6 overflow-y-auto">
          {/* Progress summary */}
          <div className="liquid-glass rounded-2xl p-5 mb-6 border border-white/6 animate-fade-rise">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full border text-cyan-300 border-cyan-300/40 bg-cyan-300/8">{level}</span>
                <h2 className="font-display text-xl">Progress</h2>
              </div>
              <span className="font-display text-2xl" style={{ color: stats.progress === 100 ? 'hsl(var(--accent-jade))' : 'hsl(var(--accent-ember))' }}>
                {stats.progress}%
              </span>
            </div>
            <XPBar current={stats.progress} max={100} className="h-1.5 mb-3"
              color={stats.progress === 100 ? 'hsl(var(--accent-jade))' : undefined} />
            <div className="flex gap-6 text-sm text-muted-foreground flex-wrap">
              <span>Grammar <strong className="text-foreground">{stats.grammar[0]}/{stats.grammar[1]}</strong></span>
              <span>Kanji <strong className="text-foreground">{stats.kanji[0]}/{stats.kanji[1]}</strong></span>
              <span>Vocabulary <strong className="text-foreground">{stats.vocab[0]}/{stats.vocab[1]}</strong></span>
            </div>
          </div>

          {/* Skill tree */}
          {(nodes.length > 0) ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(['grammar','kanji','vocab'] as const).map((col) => (
                <div key={col}>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest text-center mb-4 pb-3 border-b border-border">
                    {col.charAt(0).toUpperCase() + col.slice(1)}
                  </p>
                  {categorizedNodes[col].map((node, i) => (
                    <div key={node.id}>
                      <SkillTreeNode
                        status={node.userProgress?.status || 'locked'}
                        title={node.title}
                        progress={[node.userProgress?.progress_current || 0, node.userProgress?.progress_total || 10]}
                        time="~20 min"
                        onClick={() => setSelected(node)}
                      />
                      {i < categorizedNodes[col].length - 1 && (
                        <div className="w-0.5 h-8 mx-auto"
                          style={{ background: node.userProgress?.status === 'completed' ? 'hsl(var(--accent-ember))' : 'hsl(var(--border))' }} />
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="jp text-8xl text-muted-foreground/10">準備中</div>
              <p className="font-display text-2xl text-muted-foreground mt-4">No content available for {level} yet.</p>
            </div>
          )}
        </main>
      </div>

      {/* Lesson panel slide-in */}
      {selected && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setSelected(null)} />
          <div className="fixed right-0 top-16 bottom-0 w-80 border-l border-border p-6 overflow-y-auto z-50 animate-slide-in-right"
            style={{ background: 'hsl(var(--surface))', backdropFilter: 'blur(16px)' }}>
            <button onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-lg w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/6">✕</button>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs px-2 py-0.5 rounded-full border text-cyan-300 border-cyan-300/40">{level}</span>
              <span className="text-xs text-muted-foreground">~20 min</span>
            </div>
            <h3 className="font-display text-2xl mb-3">{selected.title}</h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {selected.description || 'Master this topic to advance your knowledge and unlock new lessons.'}
            </p>
            
            {selected.userProgress?.status === 'locked' ? (
              <div className="rounded-xl p-4 bg-white/5 border border-white/10">
                <p className="text-xs text-muted-foreground text-center">Complete prerequisites to unlock this lesson.</p>
              </div>
            ) : (
              <LiquidButton ember className="w-full justify-center" as="a" href="/flashcards">
                {selected.userProgress?.status === 'active' ? 'Resume Lesson →' : 'Begin Lesson →'}
              </LiquidButton>
            )}
          </div>
        </>
      )}
      <MobileNav />
    </div>
  )
}
