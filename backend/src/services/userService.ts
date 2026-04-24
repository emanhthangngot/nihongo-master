import { supabase } from '../lib/supabase'

export class UserService {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, display_name, jlpt_target, learning_goal, avatar_url, created_at')
      .eq('id', userId)
      .single()
    if (error) throw error
    return data
  }

  async updateProfile(userId: string, updates: Partial<{ display_name: string; jlpt_target: string; learning_goal: string; avatar_url: string }>) {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select('id, email, display_name, jlpt_target, learning_goal, avatar_url')
      .single()
    if (error) throw error
    return data
  }

  async getStats(userId: string) {
    const { data } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single()
    return data ?? { user_id: userId, total_xp: 0, current_level: 1, streak: 0, longest_streak: 0 }
  }

  async seedInitialPath(userId: string, jlptTarget: string) {
    const levelMap: Record<string, string[]> = {
      N5: ['N5'], N4: ['N5','N4'], N3: ['N5','N4','N3'], N2: ['N5','N4','N3','N2'], N1: ['N5','N4','N3','N2','N1'],
    }
    const levels = levelMap[jlptTarget] ?? ['N5']

    // Unlock first available lesson for each level
    const { data: nodes } = await supabase
      .from('learning_graph_nodes')
      .select('id')
      .in('jlpt_level', levels)
      .order('sort_order')
      .limit(1)

    if (nodes?.length) {
      await supabase.from('user_node_progress').upsert({
        user_id: userId, node_id: nodes[0].id, status: 'active', unlocked_at: new Date().toISOString(),
      }, { onConflict: 'user_id,node_id' })
    }
  }
}

export const userService = new UserService()
