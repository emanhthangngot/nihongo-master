import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import MobileNav from '@/components/layout/MobileNav'
import SkillTreeNode from '@/components/ui/SkillTreeNode'
import XPBar from '@/components/ui/XPBar'
import LiquidButton from '@/components/ui/LiquidButton'

const LEVELS = ['N5','N4','N3','N2','N1'] as const
type Level = typeof LEVELS[number]

const LEVEL_DATA: Record<Level, { progress: number; grammar:[number,number]; kanji:[number,number]; vocab:[number,number] }> = {
  N5: { progress:100, grammar:[12,12], kanji:[100,100], vocab:[500,500] },
  N4: { progress:62,  grammar:[8,12],  kanji:[45,100],  vocab:[320,500] },
  N3: { progress:0,   grammar:[0,22],  kanji:[0,200],   vocab:[0,750] },
  N2: { progress:0,   grammar:[0,30],  kanji:[0,300],   vocab:[0,1200] },
  N1: { progress:0,   grammar:[0,40],  kanji:[0,400],   vocab:[0,2000] },
}

type NodeStatus = 'completed'|'active'|'locked'
interface TreeNode { title:string; status:NodeStatus; progress:[number,number]; time:string; topics:string[] }
type TreeData = { grammar:TreeNode[]; kanji:TreeNode[]; vocab:TreeNode[] }

const TREE: Record<Level, TreeData> = {
  N4: {
    grammar:[
      {title:'て-form Basics',     status:'completed',progress:[5,5], time:'~20 min',topics:['Conjugation rules','Connecting actions','〜てください']},
      {title:'〜ている',           status:'completed',progress:[5,5], time:'~15 min',topics:['Ongoing actions','Resultant state','Habitual actions']},
      {title:'〜たことがある',     status:'active',   progress:[2,5], time:'~20 min',topics:['Experience expression','Negative form','Questions']},
      {title:'〜てもいい',         status:'locked',   progress:[0,5], time:'~15 min',topics:['Asking permission','Granting permission']},
      {title:'Conditional〜たら',  status:'locked',   progress:[0,5], time:'~25 min',topics:['Hypothetical','Past conditional']},
    ],
    kanji:[
      {title:'People & Society',   status:'completed',progress:[20,20],time:'~40 min',topics:['人 民 者 員 生','社 会 国 家 世']},
      {title:'Nature & Time',      status:'completed',progress:[20,20],time:'~35 min',topics:['日 月 年 週 時','春 夏 秋 冬 朝']},
      {title:'Actions & Movement', status:'active',   progress:[8,20], time:'~45 min',topics:['行 来 帰 走 歩','飛 乗 降 動 止']},
      {title:'Mind & Emotion',     status:'locked',   progress:[0,20], time:'~40 min',topics:['思 考 感 知 覚']},
      {title:'Advanced N4 Set',    status:'locked',   progress:[0,20], time:'~50 min',topics:['Complex compounds']},
    ],
    vocab:[
      {title:'Daily Life',         status:'completed',progress:[80,80],time:'~60 min',topics:['食事 買い物 交通']},
      {title:'Work & Study',       status:'completed',progress:[80,80],time:'~55 min',topics:['勉強 仕事 会議']},
      {title:'Health & Body',      status:'active',   progress:[35,80],time:'~60 min',topics:['体 病気 薬 病院']},
      {title:'Travel & Places',    status:'locked',   progress:[0,80], time:'~65 min',topics:['旅行 交通 地図']},
      {title:'Emotions & Abstract',status:'locked',   progress:[0,80], time:'~70 min',topics:['感情 性格 関係']},
    ],
  },
  N5: { grammar:[], kanji:[], vocab:[] },
  N3: { grammar:[], kanji:[], vocab:[] },
  N2: { grammar:[], kanji:[], vocab:[] },
  N1: { grammar:[], kanji:[], vocab:[] },
}

export default function LearningPath() {
  const [level, setLevel] = useState<Level>('N4')
  const [selected, setSelected] = useState<TreeNode | null>(null)
  const ld = LEVEL_DATA[level]
  const tree = TREE[level] ?? TREE.N4

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
              {LEVEL_DATA[l].progress > 0 && (
                <span className="text-xs opacity-60">{LEVEL_DATA[l].progress}%</span>
              )}
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
              <span className="font-display text-2xl" style={{ color: ld.progress === 100 ? 'hsl(var(--accent-jade))' : 'hsl(var(--accent-ember))' }}>
                {ld.progress}%
              </span>
            </div>
            <XPBar current={ld.progress} max={100} className="h-1.5 mb-3"
              color={ld.progress === 100 ? 'hsl(var(--accent-jade))' : undefined} />
            <div className="flex gap-6 text-sm text-muted-foreground flex-wrap">
              <span>Grammar <strong className="text-foreground">{ld.grammar[0]}/{ld.grammar[1]}</strong></span>
              <span>Kanji <strong className="text-foreground">{ld.kanji[0]}/{ld.kanji[1]}</strong></span>
              <span>Vocabulary <strong className="text-foreground">{ld.vocab[0]}/{ld.vocab[1]}</strong></span>
            </div>
          </div>

          {/* Skill tree */}
          {(tree.grammar.length > 0) ? (
            <div className="grid grid-cols-3 gap-6">
              {(['grammar','kanji','vocab'] as const).map((col) => (
                <div key={col}>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest text-center mb-4 pb-3 border-b border-border">
                    {col.charAt(0).toUpperCase() + col.slice(1)}
                  </p>
                  {tree[col].map((node, i) => (
                    <div key={i}>
                      <SkillTreeNode
                        status={node.status}
                        title={node.title}
                        progress={node.progress}
                        time={node.time}
                        onClick={() => setSelected(node)}
                      />
                      {i < tree[col].length - 1 && (
                        <div className="w-0.5 h-8 mx-auto"
                          style={{ background: node.status === 'completed' ? 'hsl(var(--accent-ember))' : 'hsl(var(--border))' }} />
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="jp text-8xl text-muted-foreground/10">準備中</div>
              <p className="font-display text-2xl text-muted-foreground mt-4">Complete {level === 'N5' ? 'Onboarding' : 'previous level'} first</p>
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
              <span className="text-xs text-muted-foreground">{selected.time}</span>
            </div>
            <h3 className="font-display text-2xl mb-3">{selected.title}</h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Master this topic to advance your {level} knowledge and unlock the next lessons.
            </p>
            <p className="text-sm font-display mb-2">Topics covered</p>
            <div className="space-y-1 mb-5">
              {selected.topics.map((t, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/4 text-sm">
                  <span className="text-accent-ember text-xs">◆</span>
                  <span className={/[　-鿿]/.test(t) ? 'jp' : ''}>{t}</span>
                </div>
              ))}
            </div>
            {selected.status === 'active' && (
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-1">Progress: {selected.progress[0]}/{selected.progress[1]}</p>
                <XPBar current={selected.progress[0]} max={selected.progress[1]} />
              </div>
            )}
            <LiquidButton ember className="w-full justify-center" as="a" href="/flashcards">
              {selected.status === 'active' ? 'Resume Lesson →' : 'Begin Lesson →'}
            </LiquidButton>
          </div>
        </>
      )}
      <MobileNav />
    </div>
  )
}