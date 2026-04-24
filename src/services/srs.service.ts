import api from './api'

export type Rating = 'again' | 'hard' | 'good' | 'easy'

export interface SRSCard {
  id: string
  word: string
  reading: string
  meaning: string
  type: 'vocab' | 'grammar' | 'kanji'
  jlpt_level: string | null
  interval: number
  ease: number
  due_date: string
  lapses: number
  state: number
  reps: number
}

export const srsService = {
  async getDueQueue(limit = 50): Promise<{ due: SRSCard[]; totalToday: number }> {
    const { data } = await api.get(`/srs/queue?limit=${limit}`)
    return data
  },

  async gradeCard(cardId: string, rating: Rating): Promise<SRSCard> {
    const { data } = await api.post(`/srs/grade/${cardId}`, { rating })
    return data
  },

  async addCard(card: { word: string; reading: string; meaning: string; type?: string; jlptLevel?: string }): Promise<SRSCard> {
    const { data } = await api.post('/srs/cards', card)
    return data
  },

  async getStats() {
    const { data } = await api.get('/srs/stats')
    return data
  },
}
