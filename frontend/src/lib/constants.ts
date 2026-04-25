export const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const
export type JLPTLevel = typeof JLPT_LEVELS[number]

export const LEARNING_GOALS = [
  { id: 'jlpt',   label: 'Pass JLPT',          icon: '🎓' },
  { id: 'speak',  label: 'Speak Conversationally', icon: '💬' },
  { id: 'travel', label: 'Travel to Japan',     icon: '✈️'  },
  { id: 'anime',  label: 'Enjoy Anime & Manga', icon: '⛩️'  },
] as const

export const XP_REWARDS = {
  card_again:       2,
  card_hard:        5,
  card_good:       10,
  card_easy:       15,
  card_new:         5,
  lesson_complete: 50,
  lesson_milestone:100,
  reading_complete: 30,
  streak_7day:     100,
  streak_30day:    500,
} as const

export const RATING_LABELS = {
  again: { label: 'Again', color: 'text-red-400',    key: '1' },
  hard:  { label: 'Hard',  color: 'text-orange-400', key: '2' },
  good:  { label: 'Good',  color: 'text-green-400',  key: '3' },
  easy:  { label: 'Easy',  color: 'text-blue-400',   key: '4' },
} as const

export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'
