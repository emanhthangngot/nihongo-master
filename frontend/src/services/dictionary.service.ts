import api from './api'

export interface DictionaryEntry {
  id: string
  word: string
  reading: string
  romaji: string
  meanings: string[]
  pos: string
  jlpt_level: string | null
  pitch_morae: string[]
  pitch_pattern: number[]
  tags: string[]
}

export interface KanjiEntry {
  id: string
  char: string
  on_readings: string[]
  kun_readings: string[]
  meanings: string[]
  stroke_count: number
  jlpt_level: string | null
}

export const dictionaryService = {
  async search(query: string, level?: string): Promise<DictionaryEntry[]> {
    const params = new URLSearchParams({ q: query })
    if (level) params.set('level', level)
    const { data } = await api.get(`/dictionary/search?${params}`)
    return data.results ?? []
  },

  async getWord(word: string): Promise<DictionaryEntry> {
    const { data } = await api.get(`/dictionary/word/${encodeURIComponent(word)}`)
    return data
  },

  async getKanji(char: string): Promise<KanjiEntry> {
    const { data } = await api.get(`/dictionary/kanji/${encodeURIComponent(char)}`)
    return data
  },
}
