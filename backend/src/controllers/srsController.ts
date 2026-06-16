import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth'
import { supabase } from '../lib/supabase'
import { fsrsGrade } from '../services/fsrsService'

export async function getDueQueue(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const today = new Date().toISOString().slice(0, 10)
    const { data, error } = await supabase
      .from('srs_cards')
      .select('*')
      .eq('user_id', req.userId)
      .lte('due_date', today)
      .order('due_date')
      .limit(50)
    if (error) throw error
    res.json({ due: data ?? [], totalToday: data?.length ?? 0 })
  } catch (err) { next(err) }
}

import { z } from 'zod'

const ReviewCardSchema = z.object({
  rating: z.number().int().min(1).max(4),
  clientMutationId: z.string().uuid().optional()
})

export async function gradeCard(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { cardId } = req.params
    const parseRes = ReviewCardSchema.safeParse(req.body)
    if (!parseRes.success) return res.status(400).json({ error: parseRes.error.errors })
    const { rating, clientMutationId } = parseRes.data

    if (clientMutationId) {
      const { data: existing } = await supabase
        .from('client_mutations')
        .select('id')
        .eq('id', clientMutationId)
        .single()
      if (existing) {
        return res.json({ success: true, idempotent: true })
      }
    }

    const { data: card } = await supabase
      .from('srs_cards').select('*').eq('id', cardId).eq('user_id', req.userId).single()
    if (!card) return res.status(404).json({ error: 'Card not found' })

    const updated = fsrsGrade(card, rating)
    const { data } = await supabase
      .from('srs_cards').update(updated).eq('id', cardId).select().single()

    if (clientMutationId) {
       await supabase.from('client_mutations').insert({ id: clientMutationId, user_id: req.userId, mutation_type: 'grade_card' }).catch(() => {})
    }

    res.json(data)
  } catch (err) { next(err) }
}

export async function addCard(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { word, reading, meaning, type, jlptLevel } = req.body
    const today = new Date().toISOString().slice(0, 10)
    const { data, error } = await supabase
      .from('srs_cards')
      .insert({ user_id: req.userId, word, reading, meaning, type, jlpt_level: jlptLevel,
        interval: 1, ease: 2.5, due_date: today, lapses: 0, retention: 0.9 })
      .select().single()
    if (error) throw error
    res.status(201).json(data)
  } catch (err) { next(err) }
}

export async function getStats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { data } = await supabase
      .from('review_logs')
      .select('rating, reviewed_at')
      .eq('user_id', req.userId)
      .gte('reviewed_at', new Date(Date.now() - 30 * 86400000).toISOString())
    res.json({ reviews: data ?? [] })
  } catch (err) { next(err) }
}