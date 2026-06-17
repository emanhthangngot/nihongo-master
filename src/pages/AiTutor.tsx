import { useState, useRef, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import MobileNav from '@/components/layout/MobileNav'
import LiquidButton from '@/components/ui/LiquidButton'
import { useAIStore } from '@/stores/aiStore'
import { useToast } from '@/components/global/ToastProvider'
import { useSSEStream } from '@/hooks/useSSEStream'

const QUICK_PROMPTS = ['Explain て-form','Practice N4 vocab','は vs が particles','How to count things']

export default function AiTutor() {
  const { conversations, activeConvId, activeMessages, isStreaming,
    addMessage, clearMessages, setActiveConv, newConversation } = useAIStore()
  const { sendMessage } = useSSEStream()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  // Seed welcome message on mount
  useEffect(() => {
    if (activeMessages.length === 0) {
      addMessage({ role: 'assistant', content: `こんにちは！I'm your Japanese Sensei 🌸\n\nI can help with grammar explanations, vocabulary practice, and natural conversation.\n\nTry asking me: "Explain the て-form" or "Practice N4 vocab".` })
    }
  }, [activeMessages.length, addMessage])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeMessages, isStreaming])

  const send = async () => {
    if (!input.trim() || isStreaming) return
    const text = input.trim()
    setInput('')
    await sendMessage(text)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex flex-1 min-h-0">

        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 flex-shrink-0 border-r border-border p-4 overflow-y-auto gap-2">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Conversations</p>
          {conversations.map((c) => (
            <button key={c.id} onClick={() => setActiveConv(c.id)}
              className={`liquid-glass rounded-xl px-4 py-3 text-left transition-colors ${c.id === activeConvId ? 'bg-white/5' : 'hover:bg-white/3'}`}>
              <div className="text-sm truncate">{c.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{new Date(c.updatedAt).toLocaleDateString()}</div>
            </button>
          ))}
          <LiquidButton size="sm" className="mt-auto w-full justify-center" onClick={newConversation}>＋ New Chat</LiquidButton>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
            <div className="w-10 h-10 rounded-full flex items-center justify-center jp text-accent-ember text-lg"
              style={{ background: 'radial-gradient(circle,hsl(var(--accent-ember)/0.2),hsl(var(--accent-ember)/0.05))', border: '1px solid hsl(var(--accent-ember)/0.3)' }}>先</div>
            <div>
              <p className="font-medium">Sensei AI</p>
              <p className="text-xs text-muted-foreground">
                <span className="inline-block w-2 h-2 rounded-full bg-accent-jade mr-1.5" style={{ boxShadow: '0 0 6px hsl(var(--accent-jade))' }} />
                Online — ready to practice
              </p>
            </div>
            <div className="ml-auto flex gap-2">
              <LiquidButton size="sm" onClick={clearMessages}>Clear</LiquidButton>
              <LiquidButton size="sm" onClick={newConversation}>＋ New</LiquidButton>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {activeMessages.map((msg, i) => {
              const isLast = i === activeMessages.length - 1
              return (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center jp text-accent-ember text-sm flex-shrink-0 mt-1"
                      style={{ background: 'hsl(var(--accent-ember)/0.1)', border: '1px solid hsl(var(--accent-ember)/0.2)' }}>先</div>
                  )}
                  <div className={`max-w-2xl ${msg.role === 'user' ? 'max-w-md' : ''}`}>
                    <div className={`rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'liquid-glass border border-white/10 rounded-tr-sm'
                        : 'rounded-tl-sm border border-border'
                    }`} style={msg.role === 'assistant' ? { background: 'hsl(var(--surface))' } : {}}>
                      <p className="whitespace-pre-wrap">{msg.content}
                        {isStreaming && isLast && msg.role === 'assistant' && (
                          <span className="inline-block w-0.5 h-4 bg-accent-ember ml-0.5 animate-blink align-middle" />
                        )}
                      </p>
                      {msg.grammar && (
                        <div className="mt-3 rounded-xl p-4 border border-border text-sm" style={{ background: 'hsl(var(--surface-raised))' }}>
                          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Grammar Point</p>
                          <p className="jp text-lg text-foreground">{msg.grammar.title}</p>
                          <p className="text-muted-foreground text-xs mt-1">{msg.grammar.meaning}</p>
                          <div className="jp text-sm mt-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                            {msg.grammar.example}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{msg.grammar.translation}</p>
                          <div className="flex gap-2 mt-3">
                            <LiquidButton size="sm" onClick={() => toast('Added to SRS ✓', 'success')}>+ SRS</LiquidButton>
                            <LiquidButton size="sm" onClick={() => toast('Saved to notebook ✓', 'success')}>📓 Notes</LiquidButton>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-6 py-4 border-t border-border">
            <div className="flex gap-2 mb-3 flex-wrap">
              {QUICK_PROMPTS.map((p) => (
                <button key={p} onClick={() => { setInput(p); textareaRef.current?.focus() }}
                  className="text-xs px-3 py-1 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-white/25 transition-colors">
                  {p}
                </button>
              ))}
            </div>
            <div className="flex items-end gap-3 liquid-glass rounded-2xl p-3 border border-white/8">
              <button className="text-muted-foreground hover:text-foreground p-1 transition-colors">🎤</button>
              <button className="text-muted-foreground hover:text-foreground p-1 transition-colors">📎</button>
              <textarea ref={textareaRef} rows={1} value={input}
                onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey}
                placeholder="Ask in Japanese or English..."
                className="flex-1 bg-transparent border-none outline-none text-foreground text-sm resize-none max-h-32 jp placeholder:text-muted-foreground leading-relaxed" />
              <button onClick={send}
                className={`rounded-xl px-4 py-2 text-sm flex-shrink-0 transition-all ${
                  input.trim() && !isStreaming
                    ? 'bg-accent-ember/20 border border-accent-ember/50 text-accent-ember hover:bg-accent-ember/30'
                    : 'bg-white/4 border border-white/8 text-muted-foreground pointer-events-none'
                }`}>Send →</button>
            </div>
          </div>
        </div>
      </div>
      <MobileNav />
    </div>
  )
}
