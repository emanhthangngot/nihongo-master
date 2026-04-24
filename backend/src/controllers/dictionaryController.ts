import { Request, Response, NextFunction } from 'express'
import { supabase } from '../lib/supabase'

export async function search(req: Request, res: Response, next: NextFunction) {
  try {
    const q = String(req.query.q ?? '')
    const level = req.query.level as string | undefined
    if (!q) return res.json({ results: [] })

    let query = supabase
      .from('dictionary_entries')
      .select('id, word, reading, romaji, meanings, pos, jlpt_level')
      .or(`word.ilike.%${q}%,romaji.ilike.%${q}%,meanings.cs.{"${q}"}`)
      .limit(20)
    if (level) query = query.eq('jlpt_level', level)

    const { data, error } = await query
    if (error) throw error
    res.json({ results: data ?? [] })
  } catch (err) { next(err) }
}

export async function getWord(req: Request, res: Response, next: NextFunction) {
  try {
    const { word } = req.params
    const { data, error } = await supabase
      .from('dictionary_entries').select('*').eq('word', decodeURIComponent(word)).single()
    if (error || !data) return res.status(404).json({ error: 'Word not found' })
    res.json(data)
  } catch (err) { next(err) }
}

export async function getKanji(req: Request, res: Response, next: NextFunction) {
  try {
    const { char } = req.params
    const { data, error } = await supabase
      .from('kanji_entries').select('*').eq('char', decodeURIComponent(char)).single()
    if (error || !data) return res.status(404).json({ error: 'Kanji not found' })
    res.json(data)
  } catch (err) { next(err) }
}