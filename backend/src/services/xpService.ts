import { supabase } from '../lib/supabase'

export const XP_RULES: Record<string, number> = {
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
}

export class XPService {
  xpFor(action: string): number {
    return XP_RULES[action] ?? 0
  }

  async award(userId: string, amount: number): Promise<number> {
    // Upsert user_stats row, then increment
    await supabase.from('user_stats').upsert(
      { user_id: userId, total_xp: amount },
      { onConflict: 'user_id', ignoreDuplicates: true }
    )

    // Fetch current, then update
    const { data: current } = await supabase
      .from('user_stats').select('total_xp').eq('user_id', userId).single()
    const newXP = (current?.total_xp ?? 0) + amount
    await supabase.from('user_stats').update({ total_xp: newXP }).eq('user_id', userId)
    return newXP
  }
}

export const xpService = new XPService()
