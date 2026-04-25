import { create } from 'zustand'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  grammar?: {
    title: string
    meaning: string
    example: string
    translation: string
  } | null
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

interface AIState {
  conversations: Conversation[]
  activeConvId: string | null
  isStreaming: boolean

  activeMessages: Message[]
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void
  updateLastMessage: (content: string) => void
  finalizeMessage: (grammar?: Message['grammar']) => void
  setStreaming: (v: boolean) => void
  newConversation: () => void
  clearMessages: () => void
  setActiveConv: (id: string) => void
}

function makeId() { return Math.random().toString(36).slice(2) }

export const useAIStore = create<AIState>((set) => ({
  conversations: [
    { id: 'c1', title: 'て-form Practice',      messages: [], createdAt: Date.now() - 7200000, updatedAt: Date.now() - 7200000 },
    { id: 'c2', title: 'Particle が vs は',     messages: [], createdAt: Date.now() - 86400000, updatedAt: Date.now() - 86400000 },
    { id: 'c3', title: 'JLPT N4 Vocabulary',    messages: [], createdAt: Date.now() - 172800000, updatedAt: Date.now() - 172800000 },
  ],
  activeConvId: 'c1',
  isStreaming: false,
  activeMessages: [],

  addMessage: (msg) =>
    set((s) => ({
      activeMessages: [...s.activeMessages, { ...msg, id: makeId(), timestamp: Date.now() }],
    })),

  updateLastMessage: (content) =>
    set((s) => {
      const msgs = [...s.activeMessages]
      if (msgs.length) msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content }
      return { activeMessages: msgs }
    }),

  finalizeMessage: (grammar) =>
    set((s) => {
      const msgs = [...s.activeMessages]
      if (msgs.length) msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], grammar: grammar ?? null }
      return { activeMessages: msgs }
    }),

  setStreaming: (isStreaming) => set({ isStreaming }),

  newConversation: () => {
    const id = makeId()
    set((s) => ({
      conversations: [{ id, title: 'New Chat', messages: [], createdAt: Date.now(), updatedAt: Date.now() }, ...s.conversations],
      activeConvId: id,
      activeMessages: [],
    }))
  },

  clearMessages: () => set({ activeMessages: [] }),

  setActiveConv: (id) =>
    set((s) => {
      const conv = s.conversations.find((c) => c.id === id)
      return { activeConvId: id, activeMessages: conv?.messages ?? [] }
    }),
}))