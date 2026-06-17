import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import MobileNav from '@/components/layout/MobileNav'
import LiquidButton from '@/components/ui/LiquidButton'
import AudioButton from '@/components/ui/AudioButton'
import JapaneseText from '@/components/ui/JapaneseText'
import PitchAccentGraph from '@/components/ui/PitchAccentGraph'
import { useToast } from '@/components/global/ToastProvider'
import { dictionaryService } from '@/services/dictionary.service'
import type { DictionaryEntry } from '@/services/dictionary.service'

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

function JLPTBadge({ level }: { level: string | null }) {
  if (!level) return null
  return <span className={`text-xs px-2 py-0.5 rounded-full border ${JLPT_COLORS[level] ?? ''}`}>{level}</span>
}

function WordEntry({ entry, onClose }: { entry: DictionaryEntry; onClose: () => void }) {
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
            <div className="mt-2"><JLPTBadge level={entry.jlpt_level} /></div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <LiquidButton size="sm" onClick={() => toast('Added to SRS ✓','success')}>+ SRS</LiquidButton>
            <LiquidButton size="sm" onClick={() => toast('Saved to notebook ✓','success')}>📓 Notes</LiquidButton>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Pitch Accent</p>
          <PitchAccentGraph morae={entry.pitch_morae} pattern={entry.pitch_pattern} patternName="Pattern" />
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Meanings</p>
          {entry.meanings.map((m, i) => (
            <div key={i} className="font-display text-xl mb-1">
              <span className="text-sm text-muted-foreground mr-2 font-body">{i+1}.</span>{m}
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-8 opacity-40">Example sentences and deep breakdown available in detailed view.</p>
      </div>
    </div>
  )
}

export default function Dictionary() {
  const [query, setQuery]         = useState('')
  const [selected, setSelected]   = useState<DictionaryEntry | null>(null)
  const [showDrop, setShowDrop]   = useState(false)
  const [filter, setFilter]       = useState<string|null>(null)
  const [suggestions, setSuggestions] = useState<DictionaryEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }
    const timer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const results = await dictionaryService.search(query, filter ?? undefined)
        setSuggestions(results)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query, filter])

  const selectFeatured = async (f: typeof FEATURED[0]) => {
    setIsLoading(true)
    try {
      const entry = await dictionaryService.getWord(f.word)
      setSelected(entry)
    } catch {
      // Fallback to minimal entry if not found
      setSelected({
        id: f.word, word: f.word, reading: f.reading, romaji: f.romaji,
        pos: 'noun', jlpt_level: f.jlpt, pitch_morae: [...f.reading], pitch_pattern: [...f.reading].map((_,i)=>i>0?1:0),
        meanings: [f.meaning], tags: []
      })
    } finally {
      setIsLoading(false)
    }
  }

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
                <svg className={`text-muted-foreground flex-shrink-0 ${isLoading ? 'animate-spin' : ''}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {isLoading ? <circle cx="12" cy="12" r="10" strokeDasharray="16" /> : <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>}
                </svg>
                <input value={query} onChange={(e) => { setQuery(e.target.value); setShowDrop(true) }}
                  onFocus={() => setShowDrop(true)} onBlur={() => setTimeout(() => setShowDrop(false), 200)}
                  placeholder="食べる, taberu, to eat…"
                  className="flex-1 bg-transparent border-none outline-none text-foreground text-lg jp placeholder:text-muted-foreground" />
                {query && <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground">✕</button>}
              </div>
              {showDrop && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-border overflow-hidden z-20 shadow-2xl"
                  style={{ background: 'hsl(var(--surface-raised))' }}>
                  {suggestions.map(w => (
                    <div key={w.id} className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-white/5 transition-colors"
                      onClick={() => { setSelected(w); setShowDrop(false) }}>
                      <span className="jp text-xl w-12">{w.word}</span>
                      <div className="flex-1 text-left">
                        <p className="text-sm text-muted-foreground">{w.romaji} · {w.reading}</p>
                        <p className="text-sm truncate">{w.meanings[0]}</p>
                      </div>
                      <JLPTBadge level={w.jlpt_level} />
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
                  onClick={() => selectFeatured(f)}>
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
