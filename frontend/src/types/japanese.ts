export interface Word {
  id: string
  word: string
  reading: string
  romaji: string
  meanings: string[]
  partOfSpeech: string
  jlptLevel: 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
  pitchAccent: { morae: string[]; pattern: number[] }
  patternName: 'Heiban' | 'Atamadaka' | 'Nakadaka' | 'Odaka'
  examples: { jp: string; en: string; source?: string }[]
  tags?: string[]
}

export interface KanjiEntry {
  char: string
  readings: { on: string[]; kun: string[] }
  meanings: string[]
  radicals: { char: string; name: string; meaning: string }[]
  mnemonic: string
  strokeCount: number
  jlptLevel: 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
  words: string[]       // words that use this kanji
}

export interface GrammarPoint {
  id: string
  pattern: string       // e.g. "〜てから"
  meaning: string
  jlptLevel: 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
  examples: { jp: string; en: string }[]
  notes?: string
}

export interface SearchResult {
  type: 'word' | 'kanji' | 'grammar'
  word?: Word
  kanji?: KanjiEntry
  grammar?: GrammarPoint
}