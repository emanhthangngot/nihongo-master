import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import MobileNav from '@/components/layout/MobileNav'
import LiquidButton from '@/components/ui/LiquidButton'
import AudioButton from '@/components/ui/AudioButton'
import JapaneseText from '@/components/ui/JapaneseText'
import PitchAccentGraph from '@/components/ui/PitchAccentGraph'
import { useToast } from '@/components/global/ToastProvider'
import type { Word } from '@/types/japanese'

const WORDS: Word[] = [
  { id:'1', word:'食べる', reading:'たべる', romaji:'taberu', pos:'verb (godan)', jlptLevel:'N5',
    pitchAccent:{ morae:['た','べ','る'], pattern:[0,1,0] }, patternName:'Nakadaka',
    meanings:['(transitive) to eat','(figurative) to consume, to live on'],
    examples:[
      {jp:'毎日野菜を食べる。', en:'I eat vegetables every day.'},
      {jp:'もっと食べたい。',  en:'I want to eat more.'},
      {jp:'何を食べましたか？',en:'What did you eat?'},
    ]},
  { id:'2', word:'勉強', reading:'べんきょう', romaji:'benkyō', pos:'noun / suru-verb', jlptLevel:'N5',
    pitchAccent:{ morae:['べ','ん','き','ょ','う'], pattern:[0,1,1,1,0] }, patternName:'Heiban',
    meanings:['study','to study (with する)'],
    examples:[
      {jp:'日本語を勉強しています。',en:'I am studying Japanese.'},
      {jp:'勉強は楽しい。',          en:'Studying is fun.'},
    ]},
  { id:'3', word:'難しい', reading:'むずかしい', romaji:'muzukashii', pos:'i-adjective', jlptLevel:'N5',
    pitchAccent:{ morae:['む','ず','か','し','い'], pattern:[0,1,1,1,1] }, patternName:'Heiban',
    meanings:['difficult; hard','complicated; complex'],
    examples:[
      {jp:'この問題は難しい。', en:'This problem is difficult.'},
      {jp:'日本語は難しくない。',en:'Japanese is not difficult.'},
    ]},
]

const FEATURED = [
  {word:'桜',   reading:'さくら', romaji:'sakura',    meaning:'cherry blossom', jlpt:'N4'},
  {word:'侍',   reading:'さむらい',romaji:'samurai',   meaning:'samurai warrior', jlpt:'N3'},
  {word:'静寂', reading:'せいじゃく',romaji:'seijaku', meaning:'silence; stillness', jlpt:'N1'},
  {word:'間',   reading:'ま',     romaji:'ma',         meaning:'space; pause; room', jlpt:'N3'},
  {word:'物語', reading:'ものがたり',romaji:'monogatari',meaning:'tale; story', jlpt:'N4'},
  {word:'風情', reading:'ふぜい', romaji:'fuzei',       meaning:'elegance; charm', jlpt:'N1'},
]

const JLPT_COLORS: Record<string, string> = {
  N5:'text-green-300 border-green-300/40 bg-green-300/8',
  N4:'text-emerald-300 border-emerald-300/40 bg-emerald-300/8',
  N3:'text-cyan-300 border-cyan-300/40 bg-cyan-300/8',
  N2:'text-violet-300 border-violet-300/40 bg-violet-300/8',
  N1:'text-pink-300 border-pink-300/40 bg-pink-300/8',
}

function JLPTBadge({ level }: { level: string }) {
  return <span className={`text-xs px-2 py-0.5 rounded-full border ${JLPT_COLORS[level] ?? ''}`}>{level}</span>
}

function WordEntry({ entry, onClose }: { entry: Word; onClose: () => void }) {
  const { toast } = useToast()
  return (
    <div className="animate-fade-rise">
      <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1">
        ← Back to search
      </button>
      <div className="liquid-glass rounded-2xl p-8 border border-white/8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3">
              <JapaneseText className="text-5xl">{entry.word}</JapaneseText>
              <AudioButton text={entry.word} size={22} />
            </div>
            <p className="mono text-sm text-muted-foreground mt-1">{entry.romaji} · {entry.pos}</p>
            <div className="mt-2"><JLPTBadge level={entry.jlptLevel} /></div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <LiquidButton size="sm" onClick={() => toast('Added to SRS ✓','success')}>+ SRS</LiquidButton>
            <LiquidButton size="sm" onClick={() => toast('Saved to notebook ✓','success')}>📓 Notes</LiquidButton>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Pitch Accent</p>
          <PitchAccentGraph morae={entry.pitchAccent.morae} pattern={entry.pitchAccent.pattern} patternName={entry.patternName} />
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Meanings</p>
          {entry.meanings.map((m, i) => (
            <div key={i} className="font-display text-xl mb-1">
              <span className="text-sm text-muted-foreground mr-2 font-body">{i+1}.</span>{m}
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Example Sentences</p>
          {entry.examples.map((ex, i) => (
            <div key={i} className="liquid-glass rounded-xl p-4 mb-3 border border-white/6">
              <div className="flex items-center gap-2">
                <JapaneseText className="text-base">{ex.jp}</JapaneseText>
                <AudioButton text={ex.jp} />
              </div>
              <p className="text-sm text-muted-foreground mt-1">{ex.en}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Dictionary() {
  const [query, setQuery]         = useState('')
  const [selected, setSelected]   = useState<Word | null>(null)
  const [showDrop, setShowDrop]   = useState(false)
  const [filter, setFilter]       = useState<string|null>(null)

  const suggestions = query
    ? WORDS.filter(w =>
        w.word.includes(query) || w.romaji.toLowerCase().includes(query.toLowerCase()) ||
        w.meanings.some(m => m.toLowerCase().includes(query.toLowerCase())))
    : []

  return (
    <div className="min-h-screen pb-20">
      <Navbar />

      {!selected ? (
        <>
          <div className="relative pt-20 pb-12 text-center px-6">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 jp text-[10rem] text-white/3 pointer-events-none leading-none select-none">辞</div>
            <h1 className="relative font-display text-5xl animate-fade-rise">Dictionary</h1>
            <p className="relative text-muted-foreground mt-2 animate-fade-rise-1">Search kanji, vocabulary, or grammar</p>

            <div className="relative max-w-2xl mx-auto mt-6 animate-fade-rise-2">
              <div className="flex items-center gap-3 liquid-glass rounded-2xl px-6 py-4 border border-white/10">
                <svg className="text-muted-foreground flex-shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input value={query} onChange={(e) => { setQuery(e.target.value); setShowDrop(true) }}
                  onFocus={() => setShowDrop(true)} onBlur={() => setTimeout(() => setShowDrop(false), 150)}
                  placeholder="食べる, taberu, to eat…"
                  className="flex-1 bg-transparent border-none outline-none text-foreground text-lg jp placeholder:text-muted-foreground" />
                {query && <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground">✕</button>}
              </div>
              {showDrop && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-border overflow-hidden z-20"
                  style={{ background: 'hsl(var(--surface-raised))' }}>
                  {suggestions.map(w => (
                    <div key={w.id} className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-white/5 transition-colors"
                      onClick={() => { setSelected(w); setShowDrop(false) }}>
                      <span className="jp text-xl w-12">{w.word}</span>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">{w.romaji}</p>
                        <p className="text-sm">{w.meanings[0]}</p>
                      </div>
                      <JLPTBadge level={w.jlptLevel} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-center flex-wrap mt-5 animate-fade-rise-3">
              {['N5','N4','N3','N2','N1','Verbs','Adjectives','Particles'].map(f => (
                <button key={f} onClick={() => setFilter(f === filter ? null : f)}
                  className={`text-sm px-4 py-1.5 rounded-full border transition-all ${
                    filter === f
                      ? 'border-accent-ember text-accent-ember bg-accent-ember/10'
                      : 'border-border text-muted-foreground hover:border-white/25 hover:text-foreground'
                  }`}>{f}</button>
              ))}
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-6 pb-8">
            <p className="font-display text-muted-foreground mb-4 animate-fade-rise-3">Featured Entries</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 animate-fade-rise-3">
              {FEATURED.map(f => (
                <div key={f.word} className="liquid-glass rounded-2xl p-4 cursor-pointer border border-white/6 hover:border-accent-ember/30 hover:scale-[1.02] transition-all"
                  onClick={() => {
                    const found = WORDS.find(w => w.word === f.word)
                    setSelected(found ?? {
                      id: f.word, word: f.word, reading: f.reading, romaji: f.romaji,
                      pos: 'noun', jlptLevel: f.jlpt as Word['jlptLevel'], patternName: 'Heiban',
                      pitchAccent: { morae: [...f.reading], pattern: [...f.reading].map((_,i)=>i>0?1:0) },
                      meanings: [f.meaning], examples: [], tags: [],
                    })
                  }}>
                  <div className="jp text-3xl mb-1">{f.word}</div>
                  <div className="mono text-xs text-muted-foreground">{f.romaji}</div>
                  <div className="text-sm mt-1">{f.meaning}</div>
                  <div className="mt-2"><JLPTBadge level={f.jlpt} /></div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="max-w-3xl mx-auto px-6 py-8">
          <WordEntry entry={selected} onClose={() => setSelected(null)} />
        </div>
      )}
      <MobileNav />
    </div>
  )
}