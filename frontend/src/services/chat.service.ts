const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

export interface SSECallbacks {
  onToken: (token: string) => void
  onGrammar: (grammar: { title: string; meaning: string; example: string; translation: string }) => void
  onDone: () => void
  onError?: (err: Error) => void
}

export const chatService = {
  async streamMessage(message: string, conversationId: string | null, jlptLevel = 'N4', callbacks: SSECallbacks) {
    const token = localStorage.getItem('access_token')
    const res = await fetch(`${BASE_URL}/api/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message, conversation_id: conversationId, jlpt_level: jlptLevel }),
    })

    if (!res.ok || !res.body) {
      callbacks.onError?.(new Error(`HTTP ${res.status}`))
      return
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buf = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buf += decoder.decode(value, { stream: true })

      const lines = buf.split('\n')
      buf = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        try {
          const payload = JSON.parse(line.slice(6))
          if (payload.done) {
            if (payload.grammar) callbacks.onGrammar(payload.grammar)
            callbacks.onDone()
          } else if (payload.delta != null) {
            callbacks.onToken(payload.delta)
          }
        } catch {
          // skip malformed chunk
        }
      }
    }
  },

  async getConversations() {
    const { default: api } = await import('./api')
    const { data } = await api.get('/chat/conversations')
    return data
  },

  async createConversation(title?: string) {
    const { default: api } = await import('./api')
    const { data } = await api.post('/chat/conversations', { title })
    return data
  },
}
