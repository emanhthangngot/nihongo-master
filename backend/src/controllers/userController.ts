import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth'
import { supabase } from '../lib/supabase'
import { userService } from '../services/userService'

export async function getProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { data, error } = await supabase
      .from('users').select('id, email, display_name, jlpt_target, learning_goal, created_at')
      .eq('id', req.userId).single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
}

export async function getStats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const stats = await userService.getStats(req.userId!)
    res.json(stats)
  } catch (err) { next(err) }
}

export async function updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { displayName, jlptTarget, learningGoal } = req.body
    const { data, error } = await supabase
      .from('users')
      .update({ display_name: displayName, jlpt_target: jlptTarget, learning_goal: learningGoal })
      .eq('id', req.userId).select().single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
}

export async function getProgress(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { data } = await supabase
      .from('user_progress').select('*').eq('user_id', req.userId)
    res.json(data ?? [])
  } catch (err) { next(err) }
}

export async function getDailyQuests(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const today = new Date().toISOString().slice(0, 10)
    const { data } = await supabase
      .from('daily_quests').select('*').eq('user_id', req.userId).eq('date', today)
    res.json(data ?? [])
  } catch (err) { next(err) }
}