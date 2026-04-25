import { useParams, Link } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import MobileNav from '@/components/layout/MobileNav'
import JapaneseText from '@/components/ui/JapaneseText'
import { useToast } from '@/components/global/ToastProvider'
import { useState } from 'react'

const STUB = {
  id:1, title:'桜の下で', subtitle:'Under the Cherry Blossoms', jlpt:'N4', time:'~8 min',
  paragraphs:[
    {text:'春が来るたびに、田中は公園に行く。桜の花びらが空に舞い、風が優しく吹いている。', words:['春','公園','桜','花びら','空','風']},
    {text:'彼は木の下に座って、静かに本を読む。周りの人たちはみんな笑顔で、子どもたちが走り回っている。', words:['木','静か','本','笑顔','子ども']},
    {text:'「毎年ここに来るの、楽しみにしているんだ」と田中は独り言を言った。', words:['毎年','楽しみ','独り言']},
  ],
  questions:[
    {q:'田中はどこに行きますか？',options:['図書館','公園','学校','会社'],correct:1},
    {q:'田中は木の下で何をしますか？',options:['寝る','食べる','本を読む','音楽を聴く'],correct:2},
  ],
}

export default function ReadingDetail() {
  const { id: _id } = useParams()
  const { toast: _toast } = useToast()
  const story = STUB
  const [answers, setAnswers] = useState<Record<number,number>>({})
  const [quizDone, setQuizDone] = useState(false)

  const answer = (qi:number,oi:number) => {
    if (answers[qi] !== undefined) return
    setAnswers(a => ({...a,[qi]:oi}))
    if (Object.keys(answers).length+1 === story.questions.length) setTimeout(() => setQuizDone(true),600)
  }

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      <div className="flex">
        <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 border-r border-border p-5 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Vocabulary</p>
          <p className="text-sm text-muted-foreground">Click highlighted words to look them up.</p>
        </aside>
        <div className="flex-1 max-w-2xl mx-auto px-8 py-10">
          <Link to="/reading" className="text-sm text-muted-foreground hover:text-foreground mb-5 inline-flex">← Library</Link>
          <span className="text-xs px-2 py-0.5 rounded-full border text-emerald-300 border-emerald-300/40 bg-emerald-300/8 ml-2">{story.jlpt}</span>
          <h1 className="font-display text-3xl mt-4 animate-fade-rise"><JapaneseText>{story.title}</JapaneseText></h1>
          <p className="text-muted-foreground text-sm mt-1 mb-6 animate-fade-rise-1">{story.subtitle}</p>
          <hr className="border-border mb-8" />
          {story.paragraphs.map((para,i) => (
            <p key={i} className="jp text-lg leading-[2.4] mb-7 animate-fade-rise-2">{para.text}</p>
          ))}
          <div className="mt-10 pt-8 border-t border-border">
            <JapaneseText className="text-2xl">理解チェック</JapaneseText>
            <p className="font-display text-lg text-muted-foreground mt-1 mb-6">Comprehension Check</p>
            {story.questions.map((q,qi) => (
              <div key={qi} className="mb-6">
                <p className="text-sm mb-3">{q.q}</p>
                {q.options.map((opt,oi) => {
                  const answered = answers[qi] !== undefined
                  const cls = answered
                    ? oi===q.correct ? 'border-accent-jade bg-accent-jade/10'
                      : oi===answers[qi] ? 'border-red-500/60 bg-red-500/8'
                      : 'border-border opacity-40'
                    : 'border-border hover:border-white/25 hover:bg-white/4'
                  return (
                    <button key={oi} onClick={() => answer(qi,oi)}
                      className={`w-full liquid-glass rounded-xl px-4 py-3 text-left text-sm border mb-2 transition-all ${cls}`}>
                      <span className={/[　-鿿]/.test(opt)?'jp':''}>{opt}</span>
                    </button>
                  )
                })}
              </div>
            ))}
            {quizDone && (
              <div className="rounded-2xl p-5 text-center border border-accent-jade/40 bg-accent-jade/8">
                <div className="text-2xl mb-2">🎉</div>
                <div className="font-display text-xl">Well done! +50 XP</div>
              </div>
            )}
          </div>
        </div>
      </div>
      <MobileNav />
    </div>
  )
}