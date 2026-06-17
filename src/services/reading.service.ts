import api from './api'

export interface Story {
  id: string
  title: string
  subtitle: string
  content: string
  jlpt_level: string
  genre: string
  estimated_time: string
  character_theme?: string
  gradient_css?: string
  paragraphs: { text: string; words: string[] }[]
  questions: { q: string; options: string[]; correct: number }[]
  userProgress?: {
    status: 'unread' | 'reading' | 'completed'
    progress: number
  }
}

export const readingService = {
  async getReadings(level?: string, genre?: string): Promise<Story[]> {
    const params = new URLSearchParams()
    if (level) params.set('level', level)
    if (genre) params.set('genre', genre)
    const { data } = await api.get(`/readings?${params}`)
    return data
  },

  async getReading(id: string): Promise<Story> {
    const { data } = await api.get(`/readings/${id}`)
    return data
  },

  async updateProgress(id: string, progress: number, status: 'reading' | 'completed') {
    const { data } = await api.post(`/readings/${id}/progress`, { progress, status })
    return data
  }
}
