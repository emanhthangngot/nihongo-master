import { useState, useRef, useEffect, useCallback } from 'react'
import Navbar from '@/components/layout/Navbar'
import MobileNav from '@/components/layout/MobileNav'
import LiquidButton from '@/components/ui/LiquidButton'
import { useAIStore } from '@/stores/aiStore'
import { useToast } from '@/components/global/ToastProvider'
import { useSSEStream } from '@/hooks/useSSEStream'
import { Send, Mic, Paperclip, Plus, Trash2, Ghost } from 'lucide-react'

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

  const send = useCallback(async () => {
    if (!input.trim() || isStreaming) return
    const text = input.trim()
    setInput('')
    await sendMessage(text)
  }, [input, isStreaming, sendMessage])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-background">
      <Navbar />
      <div className="flex flex-1 min-h-0 relative">

        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-72 flex-shrink-0 border-r border-border p-5 overflow-y-auto gap-4">
          <div className="flex items-center justify-between px-1">
            <p className="text-[11px] text-muted-foreground uppercase tracking-[0.2em] font-medium">Conversations</p>
            <button onClick={newConversation} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground">
              <Plus size={16} />
            </button>
          </div>
          
          <div className="flex flex-col gap-1.5">
            {conversations.map((c) => (
              <button key={c.id} onClick={() => setActiveConv(c.id)}
                className={`group relative rounded-2xl px-4 py-3.5 text-left transition-all ${c.id === activeConvId ? 'bg-white/5 border border-white/10' : 'hover:bg-white/2 border border-transparent'}`}>
                <div className={`text-sm truncate font-medium ${c.id === activeConvId ? 'text-foreground' : 'text-muted-foreground'}`}>{c.title}</div>
                <div className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-wider">{new Date(c.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                {c.id === activeConvId && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-accent-ember rounded-r-full" />
                )}
              </button>
            ))}
          </div>

          {conversations.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 opacity-30">
              <Ghost size={32} className="mb-3" />
              <p className="text-xs">No history yet</p>
            </div>
          )}

          <LiquidButton size="sm" className="mt-auto w-full justify-center" onClick={newConversation}>
            <Plus size={16} /> New Chat
          </LiquidButton>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Header */}
          <header className="flex items-center gap-4 px-8 py-5 border-b border-border/50">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center jp text-accent-ember text-xl relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, hsl(var(--accent-ember)/0.15), transparent)', border: '1px solid hsl(var(--accent-ember)/0.2)' }}>
              <div className="absolute inset-0 bg-accent-ember/5 animate-pulse" />
              <span className="relative z-10">先</span>
            </div>
            <div>
              <p className="font-semibold text-base tracking-tight">Sensei AI</p>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 uppercase tracking-[0.1em]">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-jade shadow-[0_0_8px_hsl(var(--accent-jade))]" />
                Neural Tutor Active
              </p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <button onClick={clearMessages} className="text-xs text-muted-foreground hover:text-red-400 transition-colors p-2 flex items-center gap-2 rounded-lg hover:bg-red-500/5">
                <Trash2 size={14} /> <span className="hidden sm:inline">Clear Chat</span>
              </button>
            </div>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 scroll-smooth">
            {activeMessages.map((msg, i) => {
              const isLast = i === activeMessages.length - 1
              return (
                <div key={msg.id} className={`flex gap-5 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-rise`}>
                  {msg.role === 'assistant' && (
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center jp text-accent-ember text-sm flex-shrink-0 mt-1 border border-white/5 bg-white/3">
                      先
                    </div>
                  )}
                  <div className={`max-w-2xl ${msg.role === 'user' ? 'max-w-md' : ''}`}>
                    <div className={`rounded-3xl px-6 py-4 text-[15px] leading-[1.6] transition-all ${
                      msg.role === 'user'
                        ? 'bg-accent-ember/10 border border-accent-ember/20 text-foreground rounded-tr-none'
                        : 'bg-white/2 border border-white/5 text-foreground/90 rounded-tl-none'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}
                        {isStreaming && isLast && msg.role === 'assistant' && (
                          <span className="inline-block w-1.5 h-1.5 bg-accent-ember rounded-full ml-1.5 animate-pulse align-middle" />
                        )}
                      </p>
                      
                      {msg.grammar && (
                        <div className="mt-5 rounded-2xl p-5 border border-white/10 bg-white/2 shadow-xl animate-fade-rise-1">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium mb-2">Concept Insights</p>
                          <p className="jp text-2xl text-foreground font-medium mb-1">{msg.grammar.title}</p>
                          <p className="text-muted-foreground text-xs leading-relaxed">{msg.grammar.meaning}</p>
                          <div className="jp text-sm mt-4 px-4 py-3 rounded-xl border border-white/5 bg-white/2 italic">
                            "{msg.grammar.example}"
                          </div>
                          <p className="text-xs text-muted-foreground/60 mt-2 ml-1">→ {msg.grammar.translation}</p>
                          <div className="flex gap-3 mt-5">
                            <LiquidButton size="sm" onClick={() => toast('Added to SRS ✓', 'success')} className="flex-1">Add to SRS</LiquidButton>
                            <LiquidButton size="sm" onClick={() => toast('Saved to notebook ✓', 'success')} className="flex-1 opacity-70">Notebook</LiquidButton>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} className="h-4" />
          </div>

          {/* Input Area */}
          <div className="px-8 pb-8 pt-2">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-2 mb-4 flex-wrap overflow-x-auto no-scrollbar pb-1">
                {QUICK_PROMPTS.map((p) => (
                  <button key={p} onClick={() => { setInput(p); textareaRef.current?.focus() }}
                    className="text-[11px] px-4 py-2 rounded-full border border-white/10 bg-white/2 text-muted-foreground hover:text-foreground hover:border-white/25 transition-all whitespace-nowrap">
                    {p}
                  </button>
                ))}
              </div>
              
              <div className="relative liquid-glass rounded-[2rem] p-2 border border-white/10 shadow-2xl transition-all focus-within:border-accent-ember/30 focus-within:shadow-[0_0_40px_rgba(0,0,0,0.4)]">
                <div className="flex items-end gap-2 px-3 py-1.5">
                  <div className="flex gap-1 pb-1.5">
                    <button className="text-muted-foreground hover:text-foreground p-2 transition-colors rounded-full hover:bg-white/5">
                      <Mic size={18} />
                    </button>
                    <button className="text-muted-foreground hover:text-foreground p-2 transition-colors rounded-full hover:bg-white/5">
                      <Paperclip size={18} />
                    </button>
                  </div>
                  
                  <textarea ref={textareaRef} rows={1} value={input}
                    onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey}
                    placeholder="Ask Sensei anything..."
                    className="flex-1 bg-transparent border-none outline-none text-foreground text-[15px] py-2 px-1 resize-none max-h-48 jp placeholder:text-muted-foreground/50 leading-relaxed" />
                  
                  <button onClick={send}
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                      input.trim() && !isStreaming
                        ? 'bg-accent-ember text-white shadow-lg shadow-accent-ember/20 hover:scale-105 active:scale-95'
                        : 'bg-white/5 text-muted-foreground pointer-events-none'
                    }`}>
                    <Send size={18} />
                  </button>
                </div>
              </div>
              <p className="text-center text-[10px] text-muted-foreground/40 mt-4 uppercase tracking-[0.25em]">Powered by Velorah Intelligence RAG-v2</p>
            </div>
          </div>
        </div>
      </div>
      <MobileNav />
    </div>
  )
}
