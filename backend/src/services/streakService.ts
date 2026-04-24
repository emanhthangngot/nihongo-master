import { supabase } from '../lib/supabase'

export class StreakService {
  async checkAndUpdate(userId: string): Promise<{ streak: number; broken: boolean }> {
    const { data: stats } = await supabase
      .from('user_stats')
      .select('streak, last_study_date')
      .eq('user_id', userId)
      .single()

    const today     = new Date().toISOString().slice(0, 10)
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

    if (!stats) {
      await supabase.from('user_stats').upsert({ user_id: userId, streak: 1, last_study_date: today })
      return { streak: 1, broken: false }
    }

    if (stats.last_study_date === today) {
      return { streak: stats.streak, broken: false }
    }

    if (stats.last_study_date === yesterday) {
      const newStreak = stats.streak + 1
      await supabase.from('user_stats').update({ streak: newStreak, last_study_date: today }).eq('user_id', userId)
      return { streak: newStreak, broken: false }
    }

    await supabase.from('user_stats').update({ streak: 1, last_study_date: today }).eq('user_id', userId)
    return { streak: 1, broken: true }
  }
}

export const streakService = new StreakService()
