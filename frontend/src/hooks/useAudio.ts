import { useRef, useCallback } from 'react'

/**
 * Simple TTS / audio-file playback hook.
 * In production, replace playSynth with a call to your TTS endpoint.
 */
export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const play = useCallback((text: string, lang = 'ja-JP') => {
    if ('speechSynthesis' in window) {
      const utt = new SpeechSynthesisUtterance(text)
      utt.lang = lang
      utt.rate = 0.85
      const voices = window.speechSynthesis.getVoices()
      const ja = voices.find((v) => v.lang.startsWith('ja'))
      if (ja) utt.voice = ja
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utt)
    }
  }, [])

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel()
    audioRef.current?.pause()
  }, [])

  return { play, stop }
}