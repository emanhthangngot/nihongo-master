import { useEffect } from 'react'

type KeyMap = Record<string, () => void>

/**
 * Bind keyboard shortcuts.
 * @param keyMap  Object mapping key names to handlers, e.g. { ' ': flip, '1': again }
 * @param enabled Whether the bindings are active (default true)
 */
export function useKeyboardShortcut(keyMap: KeyMap, enabled = true) {
  useEffect(() => {
    if (!enabled) return
    const handler = (e: KeyboardEvent) => {
      // Skip if user is typing in an input/textarea
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      const fn = keyMap[e.key]
      if (fn) { e.preventDefault(); fn() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [keyMap, enabled])
}