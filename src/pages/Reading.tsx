import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import MobileNav from '@/components/layout/MobileNav'
import XPBar from '@/components/ui/XPBar'
import LiquidButton from '@/components/ui/LiquidButton'
import JapaneseText from '@/components/ui/JapaneseText'
import AudioButton from '@/components/ui/AudioButton'
import { useToast } from '@/components/global/ToastProvider'

const JLPT_BADGE: Record<string,string> = {
  N5:'text-green-300 border-green-300/40 bg-green-300/8',
  N4:'text-emerald-300 border-emerald-300/40 bg-emerald-300/8',
  N3:'text-cyan-300 border-cyan-300/40 bg-cyan-300/8',
}

interface Story {
  id:number; title:string; subtitle:string; jlpt:string; genre:string
  time:string; progress:number; gradient:string; char:string
  paragraphs:{ text:string; words:string[] }[]
  questions:{ q:string; options:string[]; correct:number }[]
}

const STORIES: Story[] = [
  { id:1, title:'桜の下で', subtitle:'Under the Cherry Blossoms', jlpt:'N4', genre:'Story', time:'~8 min', progress:42,
    gradient:'linear-gradient(135deg,rgba(249,115,22,.2),rgba(236,72,153,.15),rgba(0,20,40,1))', char:'桜',
    paragraphs:[
      { text:'春が来るたびに、田中は公園に行く。桜の花びらが空に舞い、風が優しく吹いている。', words:['春','公園','桜','花びら','空','風'] },
      { text:'彼は木の下に座って、静かに本を読む。周りの人たちはみんな笑顔で、子どもたちが走り回っている。', words:['木','静か','本','笑顔','子ども'] },
      { text:'「毎年ここに来るの、楽しみにしているんだ」と田中は独り言を言った。桜は毎年同じように咲くが、見る人の気持ちはいつも違う。', words:['毎年','楽しみ','独り言','気持ち'] },
    ],
    questions:[
      { q:'田中はどこに行きますか？', options:['図書館','公園','学校','会社'], correct:1 },
      { q:'田中は木の下で何をしますか？', options:['寝る','食べる','本を読む','音楽を聴く'], correct:2 },
      { q:'桜についての田中の気持ちは？', options:['怖い','嫌い','好き','知らない'], correct:2 },
    ]},
  { id:2, title:'雨の日の電車', subtitle:'Train on a Rainy Day', jlpt:'N5', genre:'Story', time:'~5 min', progress:0,
    gradient:'linear-gradient(135deg,rgba(56,189,248,.15),rgba(99,102,241,.12),rgba(0,20,40,1))', char:'雨',
    paragraphs:[{ text:'今日は雨が降っています。山田さんは駅で電車を待っています。傘を持ってきて良かったと思いました。', words:['雨','駅','電車','傘'] }],
    questions:[{ q:'今日の天気はどうですか？', options:['晴れ','曇り','雨','雪'], correct:2 }] },
  { id:3, title:'新しい仕事', subtitle:'A New Job', jlpt:'N3', genre:'Dialog', time:'~10 min', progress:0,
    gradient:'linear-gradient(135deg,rgba(52,211,153,.12),rgba(56,189,248,.1),rgba(0,20,40,1))', char:'仕',
    paragraphs:[{ text:'来週から新しい会社で働きます。面接では緊張しましたが、なんとか合格することができました。', words:['会社','面接','緊張','合格'] }],
    questions:[{ q:'この人はいつ新しい仕事を始めますか？', options:['今日','明日','来週','来月'], correct:2 }] },
  { id:4, title:'東京の夜', subtitle:'Tokyo at Night', jlpt:'N4', genre:'Story', time:'~12 min', progress:78,
    gradient:'linear-gradient(135deg,rgba(249,115,22,.1),rgba(147,51,234,.12),rgba(0,20,40,1))', char:'夜', paragraphs:[], questions:[] },
  { id:5, title:'日本の四季', subtitle:'Four Seasons of Japan', jlpt:'N5', genre:'News', time:'~6 min', progress:100,
    gradient:'linear-gradient(135deg,rgba(236,72,153,.12),rgba(249,115,22,.1),rgba(0,20,40,1))', char:'季', paragraphs:[], questions:[] },
  { id:6, title:'侍と刀', subtitle:'The Samurai and His Sword', jlpt:'N3', genre:'Story', time:'~15 min', progress:0,
    gradient:'linear-gradient(135deg,rgba(255,255,255,.06),rgba(100,116,139,.1),rgba(0,20,40,1))', char:'刀', paragraphs:[], questions:[] },
]

const UNKNOWN = ['桜','花びら','笑顔','独り言','気持ち']

function ReadingMode({ story, onBack }: { story: Story; onBack: () => void }) {
  const [popup, setPopup]     = useState<{word:string;x:number;y:number}|null>(null)
  const [answers, setAnswers] = useState<Record<number,number>>({})
  const [quizDone, setQuizDone] = useState(false)
  const [vocabList, setVocabList] = useState<string[]>([])
  const [srsAdded, setSrsAdded]   = useState<string[]>([])
  const { toast } = useToast()

  const handleWord = (word: string, e: React.MouseEvent) => {
    if (!UNKNOWN.includes(word)) return
    const r = (e.target as HTMLElement).getBoundingClientRect()
    setPopup({ word, x: r.left, y: r.bottom + 8 })
    if (!vocabList.includes(word)) setVocabList(v => [...v, word])
  }
  const addSRS = (word: string) => { setSrsAdded(s => [...s, word]); setPopup(null); toast(`Added ${word} to SRS ✓`, 'success') }
  const answer = (qi: number, oi: number) => {
    if (answers[qi] !== undefined) return
    setAnswers(a => ({ ...a, [qi]: oi }))
    if (Object.keys(answers).length + 1 === story.questions.length) setTimeout(() => setQuizDone(true), 600)
  }

  const renderPara = (para: { text:string; words:string[] }) => {
    const parts: React.ReactNode[] = []
    let i = 0; const text = para.text
    while (i < text.length) {
      let found = false
      for (const w of para.words) {
        if (text.slice(i).startsWith(w)) {
          const unk = UNKNOWN.includes(w)
          parts.push(
            <span key={i} className={`cursor-pointer rounded-sm px-px transition-colors hover:bg-accent-ember/20 ${unk ? 'bg-accent-ember/12 underline underline-offset-2 decoration-accent-ember/40' : ''}`}
              onClick={(e) => handleWord(w, e)}>{w}</span>)
          i += w.length; found = true; break
        }
      }
      if (!found) { parts.push(text[i]); i++ }
    }
    return parts
  }

  return (
    <div className="flex flex-1 min-h-0">
      {/* Vocab sidebar */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 border-r border-border p-5 overflow-y-auto gap-3">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Vocabulary Encountered</p>
        {vocabList.length === 0
          ? <p className="text-sm text-muted-foreground">Click highlighted words to look them up.</p>
          : vocabList.map(w => (
              <div key={w} className="liquid-glass rounded-xl px-3 py-2 flex items-center justify-between border border-white/6">
                <span className="jp text-lg">{w}</span>
                {srsAdded.includes(w)
                  ? <span className="text-xs text-accent-jade">✓ SRS</span>
                  : <button onClick={() => addSRS(w)} className="text-xs text-accent-ember hover:underline">+SRS</button>}
              </div>
            ))}
      </aside>

      {/* Content */}
      <div className="flex-1 max-w-2xl mx-auto px-8 py-8 overflow-y-auto">
        <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground mb-5">← Library</button>
        <div className="flex gap-2 mb-3 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full border ${JLPT_BADGE[story.jlpt]}`}>{story.jlpt}</span>
          <span className="text-xs text-muted-foreground">{story.time}</span>
        </div>
        <h1 className="font-display text-3xl animate-fade-rise"><JapaneseText>{story.title}</JapaneseText></h1>
        <p className="text-muted-foreground text-sm mt-1 mb-6 animate-fade-rise-1">{story.subtitle}</p>
        <hr className="border-border mb-8" />

        {story.paragraphs.map((para, i) => (
          <p key={i} className="jp text-lg leading-[2.4] mb-7">{renderPara(para)}</p>
        ))}
        {story.paragraphs.length === 0 && (
          <p className="text-muted-foreground italic">Full text available in the complete app.</p>
        )}

        {story.questions.length > 0 && (
          <div className="mt-10 pt-8 border-t border-border">
            <JapaneseText className="text-2xl">理解チェック</JapaneseText>
            <p className="font-display text-lg text-muted-foreground mt-1 mb-6">Comprehension Check</p>
            {story.questions.map((q, qi) => (
              <div key={qi} className="mb-6">
                <p className="text-sm mb-3">{q.q}</p>
                {q.options.map((opt, oi) => {
                  const answered = answers[qi] !== undefined
                  const cls = answered
                    ? oi === q.correct ? 'border-accent-jade bg-accent-jade/10'
                      : oi === answers[qi] ? 'border-red-500/60 bg-red-500/8'
                      : 'border-border opacity-40'
                    : 'border-border hover:border-white/25 hover:bg-white/4'
                  return (
                    <button key={oi} onClick={() => answer(qi, oi)}
                      className={`w-full liquid-glass rounded-xl px-4 py-3 text-left text-sm border mb-2 transition-all ${cls}`}>
                      <span className={/[　-鿿]/.test(opt) ? 'jp' : ''}>{opt}</span>
                    </button>
                  )
                })}
              </div>
            ))}
            {quizDone && (
              <div className="rounded-2xl p-5 text-center mt-4 border border-accent-jade/40 bg-accent-jade/8">
                <div className="text-2xl mb-2">🎉</div>
                <div className="font-display text-xl">Well done! +50 XP</div>
                <p className="text-muted-foreground text-sm mt-1">Comprehension complete</p>
              </div>
            )}
          </div>
        )}
      </div>

      {popup && (
        <>
          <div className="fixed inset-0 z-[99]" onClick={() => setPopup(null)} />
          <div className="liquid-glass rounded-xl p-4 border border-white/12 z-[100] min-w-52 animate-fade-rise"
            style={{ position:'fixed', left: Math.min(popup.x, window.innerWidth - 220), top: popup.y, background:'rgba(8,20,36,.97)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="jp text-xl">{popup.word}</span>
              <button className="text-muted-foreground text-sm" onClick={() => setPopup(null)}>✕</button>
            </div>
            <LiquidButton size="sm" ember className="w-full justify-center" onClick={() => addSRS(popup.word)}>+ Add to SRS</LiquidButton>
          </div>
        </>
      )}
    </div>
  )
}

export default function Reading() {
  const [story, setStory] = useState<Story|null>(null)
  const [levelF, setLevelF] = useState<string|null>(null)
  const [genreF, setGenreF] = useState<string|null>(null)

  const filtered = STORIES.filter(s => (!levelF || s.jlpt === levelF) && (!genreF || s.genre === genreF))

  if (story) return (
    <div className="min-h-screen flex flex-col pb-20">
      <Navbar />
      <ReadingMode story={story} onBack={() => setStory(null)} />
      <MobileNav />
    </div>
  )

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      <div className="sticky top-16 z-30 flex gap-2 flex-wrap px-6 py-3 border-b border-border items-center"
        style={{ background:'rgba(0,20,40,.9)', backdropFilter:'blur(12px)' }}>
        <span className="text-xs text-muted-foreground mr-1">Level:</span>
        {['N5','N4','N3','N2','N1'].map(l => (
          <button key={l} onClick={() => setLevelF(levelF === l ? null : l)}
            className={`text-xs px-3 py-1 rounded-full border transition-all ${levelF===l?'border-accent-ember text-accent-ember bg-accent-ember/10':'border-border text-muted-foreground hover:border-white/25'}`}>{l}</button>
        ))}
        <div className="w-px h-5 bg-border mx-1" />
        <span className="text-xs text-muted-foreground mr-1">Genre:</span>
        {['Story','News','Dialog'].map(g => (
          <button key={g} onClick={() => setGenreF(genreF === g ? null : g)}
            className={`text-xs px-3 py-1 rounded-full border transition-all ${genreF===g?'border-accent-ember text-accent-ember bg-accent-ember/10':'border-border text-muted-foreground hover:border-white/25'}`}>{g}</button>
        ))}
      </div>
      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(s => (
          <div key={s.id} className="liquid-glass rounded-2xl overflow-hidden cursor-pointer border border-white/6 hover:border-accent-ember/30 hover:scale-[1.02] transition-all"
            onClick={() => setStory(s)}>
            <div className="h-40 flex items-center justify-center relative overflow-hidden" style={{ background: s.gradient }}>
              <span className="jp text-[5rem] opacity-20 absolute select-none">{s.char}</span>
              <span className={`relative text-xs px-2 py-0.5 rounded-full border ${JLPT_BADGE[s.jlpt] ?? ''}`}>{s.jlpt}</span>
            </div>
            <div className="p-4">
              <div className="flex gap-2 mb-2 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${JLPT_BADGE[s.jlpt] ?? ''}`}>{s.jlpt}</span>
                <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-white/5">{s.genre}</span>
                <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-white/5">{s.time}</span>
              </div>
              <div className="jp text-lg font-medium">{s.title}</div>
              <p className="text-sm text-muted-foreground mt-0.5">{s.subtitle}</p>
              {s.progress > 0 && (
                <div className="mt-3">
                  <XPBar current={s.progress} max={100} color={s.progress === 100 ? 'hsl(var(--accent-jade))' : undefined} />
                  <p className="text-xs text-muted-foreground mt-1">{s.progress}% complete</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <MobileNav />
    </div>
  )
}