import { useCallback, useRef, startTransition } from 'react'
import { useAIStore } from '@/stores/aiStore'
import { chatService } from '@/services/chat.service'

export function useSSEStream() {
  const { activeConvId, addMessage, updateLastMessage, finalizeMessage, setStreaming } = useAIStore()
  const accumulated = useRef('')

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    accumulated.current = ''
    addMessage({ role: 'user', content })
    addMessage({ role: 'assistant', content: '' })
    setStreaming(true)

    await chatService.streamMessage(
      content,
      activeConvId,
      'N4',
      {
        onToken: (token) => {
          accumulated.current += token
          const snapshot = accumulated.current
          startTransition(() => updateLastMessage(snapshot))
        },
        onGrammar: (grammar) => {
          finalizeMessage(grammar)
        },
        onDone: () => {
          setStreaming(false)
        },
        onError: () => {
          setStreaming(false)
        },
      }
    )
  }, [activeConvId, addMessage, updateLastMessage, finalizeMessage, setStreaming])

  return { sendMessage }
}
