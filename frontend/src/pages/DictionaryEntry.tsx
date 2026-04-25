import { useParams, Link } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import MobileNav from '@/components/layout/MobileNav'
import JapaneseText from '@/components/ui/JapaneseText'
import AudioButton from '@/components/ui/AudioButton'
import PitchAccentGraph from '@/components/ui/PitchAccentGraph'
import LiquidButton from '@/components/ui/LiquidButton'
import { useToast } from '@/components/global/ToastProvider'

// In production, fetch from API
const STUB = {
  word:'食べる', reading:'たべる', romaji:'taberu', pos:'verb (godan)', jlptLevel:'N5',
  pitchAccent:{ morae:['た','べ','る'], pattern:[0,1,0] }, patternName:'Nakadaka',
  meanings:['(transitive) to eat','(figurative) to consume, to live on'],
  examples:[
    {jp:'毎日野菜を食べる。',en:'I eat vegetables every day.'},
    {jp:'もっと食べたい。',en:'I want to eat more.'},
    {jp:'何を食べましたか？',en:'What did you eat?'},
  ],
  related:['食','食堂','食事','朝食','夕食'],
}

export default function DictionaryEntry() {
  const { word: _word } = useParams()
  const { toast } = useToast()
  const entry = STUB   // TODO: useQuery to fetch by word param

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Link to="/dictionary" className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1">← Dictionary</Link>
        <div className="liquid-glass rounded-2xl p-8 border border-white/8 animate-fade-rise">
          {/* Header */}
          <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3">
                <JapaneseText className="text-5xl">{entry.word}</JapaneseText>
                <AudioButton text={entry.word} size={22} />
              </div>
              <p className="mono text-sm text-muted-foreground mt-1">{entry.romaji} · {entry.pos}</p>
              <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full border text-green-300 border-green-300/40 bg-green-300/8">{entry.jlptLevel}</span>
            </div>
            <div className="flex gap-2">
              <LiquidButton size="sm" onClick={() => toast('Added to SRS ✓','success')}>+ SRS</LiquidButton>
              <LiquidButton size="sm" onClick={() => toast('Saved ✓','success')}>📓 Notes</LiquidButton>
            </div>
          </div>
          {/* Pitch */}
          <div className="pt-6 border-t border-border mb-6">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Pitch Accent</p>
            <PitchAccentGraph morae={entry.pitchAccent.morae} pattern={entry.pitchAccent.pattern} patternName={entry.patternName} />
          </div>
          {/* Meanings */}
          <div className="pt-6 border-t border-border mb-6">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Meanings</p>
            {entry.meanings.map((m, i) => (
              <div key={i} className="font-display text-xl mb-1.5">
                <span className="text-sm text-muted-foreground mr-2 font-body">{i+1}.</span>{m}
              </div>
            ))}
          </div>
          {/* Examples */}
          <div className="pt-6 border-t border-border mb-6">
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
          {/* Related */}
          <div className="pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Related Words</p>
            <div className="flex flex-wrap gap-2">
              {entry.related.map(r => (
                <Link key={r} to={`/dictionary/${encodeURIComponent(r)}`}
                  className="liquid-glass rounded-full px-4 py-1.5 jp text-lg border border-border hover:border-accent-ember/40 transition-colors">
                  {r}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <MobileNav />
    </div>
  )
}