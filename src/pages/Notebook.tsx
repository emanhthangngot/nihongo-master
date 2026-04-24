import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import MobileNav from '@/components/layout/MobileNav'
import LiquidButton from '@/components/ui/LiquidButton'
import XPBar from '@/components/ui/XPBar'
import { useToast } from '@/components/global/ToastProvider'

interface Collection { id:number; name:string; count:number; mastered:number; color:string }
interface Item { id:number; pattern:string; meaning:string; example:string; en:string; tags:string[]; srs:boolean }

const INIT_COLLECTIONS: Collection[] = [
  {id:1,name:'N4 Grammar',     count:8,  mastered:3,  color:'hsl(var(--accent-ember))'},
  {id:2,name:'N5 Vocabulary',  count:24, mastered:18, color:'hsl(var(--accent-jade))'},
  {id:3,name:'JLPT Patterns',  count:12, mastered:5,  color:'hsl(var(--accent-sakura))'},
  {id:4,name:'Anime Phrases',  count:15, mastered:2,  color:'hsl(200,80%,60%)'},
]

const INIT_ITEMS: Record<number, Item[]> = {
  1:[
    {id:1,pattern:'〜てから',         meaning:'after doing ~',              example:'食べてから、歯を磨く。',         en:'After eating, brush teeth.',   tags:['N4','Grammar'],    srs:false},
    {id:2,pattern:'〜ている',          meaning:'ongoing / current state',   example:'雨が降っている。',             en:'It is raining.',               tags:['N4','Progressive'], srs:true},
    {id:3,pattern:'〜たことがある',    meaning:'have experience of doing ~', example:'日本に行ったことがある。',     en:'I have been to Japan.',        tags:['N4','Experience'],  srs:false},
    {id:4,pattern:'〜てもいい',        meaning:'it's okay to ~ / may ~',   example:'ここに座ってもいいですか？',   en:'May I sit here?',              tags:['N4','Permission'],  srs:false},
    {id:5,pattern:'〜なければならない',meaning:'must ~; have to ~',          example:'宿題をしなければならない。',   en:'I must do my homework.',       tags:['N4','Obligation'],  srs:true},
    {id:6,pattern:'〜ようにする',      meaning:'try to ~; make effort to ~', example:'毎日運動するようにしている。', en:'I try to exercise every day.', tags:['N4','Effort'],      srs:false},
    {id:7,pattern:'〜はずだ',          meaning:'should be ~; supposed to ~', example:'彼は来るはずだ。',             en:'He is supposed to come.',      tags:['N4','Expectation'], srs:true},
    {id:8,pattern:'〜かもしれない',    meaning:'might ~; perhaps ~',         example:'明日、雨が降るかもしれない。', en:'It might rain tomorrow.',      tags:['N4','Possibility'], srs:false},
  ],
  2:[
    {id:1,pattern:'食べる', meaning:'to eat',          example:'毎日野菜を食べる。',  en:'I eat vegetables every day.',   tags:['N5','Verb'],      srs:true},
    {id:2,pattern:'先生',   meaning:'teacher; master', example:'田中先生は優しい。',  en:'Teacher Tanaka is kind.',       tags:['N5','Noun'],      srs:false},
    {id:3,pattern:'難しい', meaning:'difficult; hard', example:'この問題は難しい。', en:'This problem is difficult.',    tags:['N5','Adjective'], srs:true},
  ],
  3:[], 4:[],
}

export default function Notebook() {
  const [collections, setCollections] = useState(INIT_COLLECTIONS)
  const [items, setItems]             = useState(INIT_ITEMS)
  const [active, setActive]           = useState(1)
  const [search, setSearch]           = useState('')
  const [showAdd, setShowAdd]         = useState(false)
  const [newItem, setNewItem]         = useState({pattern:'',meaning:'',example:'',en:''})
  const { toast } = useToast()

  const coll = collections.find(c => c.id === active)!
  const collItems = (items[active] ?? []).filter(item =>
    !search || item.pattern.includes(search) || item.meaning.toLowerCase().includes(search.toLowerCase()))

  const toggleSRS = (item: Item) => {
    const next = !item.srs
    setItems(p => ({...p, [active]: p[active].map(x => x.id===item.id ? {...x,srs:next} : x)}))
    toast(`${next?'Added':'Removed'} "${item.pattern}" ${next?'to':'from'} SRS`, 'success')
  }
  const deleteItem = (id: number) => {
    setItems(p => ({...p, [active]: p[active].filter(x => x.id!==id)}))
    setCollections(p => p.map(c => c.id===active ? {...c,count:c.count-1} : c))
  }
  const addItem = () => {
    if (!newItem.pattern) return
    const id = Date.now()
    setItems(p => ({...p, [active]: [...(p[active]??[]), {id,...newItem,tags:[coll.name.split(' ')[0]],srs:false}]}))
    setCollections(p => p.map(c => c.id===active ? {...c,count:c.count+1} : c))
    setNewItem({pattern:'',meaning:'',example:'',en:''})
    setShowAdd(false)
    toast('Entry added ✓', 'success')
  }
  const addCollection = () => {
    const id = Date.now()
    setCollections(p => [...p, {id,name:`Collection ${p.length+1}`,count:0,mastered:0,color:'hsl(var(--muted-foreground))'}])
    setItems(p => ({...p,[id]:[]}))
    setActive(id)
  }

  return (
    <div className="min-h-screen flex flex-col pb-20">
      <Navbar />
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-56 flex-shrink-0 border-r border-border p-4 gap-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-widest">Collections</span>
            <button onClick={addCollection} className="text-muted-foreground hover:text-foreground text-lg w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/6 transition-colors">＋</button>
          </div>
          {collections.map(c => (
            <button key={c.id} onClick={() => {setActive(c.id);setShowAdd(false)}}
              className={`rounded-xl px-3 py-2.5 text-left transition-all border ${active===c.id?'bg-accent-ember/8 border-accent-ember/30':'border-transparent hover:bg-white/4'}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm">{c.name}</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/6 text-muted-foreground">{c.count}</span>
              </div>
              {c.mastered > 0 && c.count > 0 && (
                <div className="mt-1.5">
                  <XPBar current={c.mastered} max={c.count} className="h-[3px]" color={c.color} />
                  <p className="text-[10px] text-muted-foreground mt-0.5">{c.mastered}/{c.count} in SRS</p>
                </div>
              )}
            </button>
          ))}
        </aside>

        <main className="flex-1 p-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3 animate-fade-rise">
            <h1 className="font-display text-3xl">{coll?.name}</h1>
            <div className="flex gap-2">
              <LiquidButton size="sm" onClick={() => setShowAdd(s => !s)}>{showAdd?'Cancel':'＋ Add Entry'}</LiquidButton>
              <LiquidButton size="sm" ember as="a" href="/flashcards">Review SRS →</LiquidButton>
            </div>
          </div>

          {/* Add form */}
          {showAdd && (
            <div className="rounded-2xl p-5 mb-5 border border-border animate-fade-rise" style={{background:'hsl(var(--surface))'}}>
              <h3 className="font-display mb-4">New Entry</h3>
              {[
                ['Grammar pattern / Word (e.g. 〜てから)','pattern','text'],
                ['Meaning in English','meaning','text'],
                ['Example in Japanese…','example','jp'],
                ['English translation','en','text'],
              ].map(([ph,key,font]) => (
                <input key={key} placeholder={ph} value={(newItem as any)[key]} onChange={e => setNewItem(n => ({...n,[key]:e.target.value}))}
                  className={`w-full mb-3 px-4 py-2.5 rounded-xl text-sm bg-white/4 border border-white/8 outline-none text-foreground placeholder:text-muted-foreground focus:border-accent-ember/40 transition-colors ${font==='jp'?'jp':''}`} />
              ))}
              <LiquidButton ember className="w-full justify-center" onClick={addItem}>Add to Collection</LiquidButton>
            </div>
          )}

          {/* Search */}
          <div className="flex items-center gap-2 bg-white/4 border border-white/8 rounded-xl px-3 py-2.5 mb-5">
            <svg className="text-muted-foreground flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search entries…"
              className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground" />
            {search && <button onClick={() => setSearch('')} className="text-muted-foreground text-sm">✕</button>}
          </div>

          {/* Items */}
          {collItems.length === 0 ? (
            <div className="text-center py-16 animate-fade-rise">
              <div className="jp text-8xl text-white/5">無</div>
              <h3 className="font-display text-2xl text-muted-foreground mt-4">No entries yet.</h3>
              <p className="text-sm text-muted-foreground mt-1">Add your first entry to start building.</p>
              <LiquidButton ember className="mt-6" onClick={() => setShowAdd(true)}>Add your first entry</LiquidButton>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-rise-1">
              {collItems.map(item => (
                <div key={item.id} className="liquid-glass rounded-2xl p-5 border border-white/7 hover:border-white/15 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="mono text-xl leading-tight">{item.pattern}</span>
                    {item.srs && <span className="text-xs px-2 py-0.5 rounded-full bg-accent-ember/15 text-accent-ember border border-accent-ember/30 flex-shrink-0">In SRS</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.meaning}</p>
                  {item.example && (
                    <div className="mt-3 px-3 py-2.5 rounded-xl bg-white/3 border border-white/5">
                      <p className="jp text-sm leading-relaxed">{item.example}</p>
                      {item.en && <p className="text-xs text-muted-foreground mt-1">{item.en}</p>}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {item.tags.map(t => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded-full border border-white/12 bg-white/4 text-muted-foreground">{t}</span>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
                    <LiquidButton size="sm" onClick={() => toggleSRS(item)} className="text-xs">{item.srs?'Remove SRS':'→ SRS'}</LiquidButton>
                    <LiquidButton size="sm" className="text-xs">Edit</LiquidButton>
                    <button onClick={() => deleteItem(item.id)} className="ml-auto text-xs text-red-500/50 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/8">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      <MobileNav />
    </div>
  )
}