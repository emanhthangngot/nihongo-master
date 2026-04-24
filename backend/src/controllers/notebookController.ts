import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth'
import { supabase } from '../lib/supabase'
import { embeddingQueue } from '../queues/embeddingQueue'

export async function getCollections(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { data, error } = await supabase
      .from('notebook_collections')
      .select('*, notebook_items(count)')
      .eq('user_id', req.userId)
      .order('created_at')
    if (error) throw error
    res.json(data ?? [])
  } catch (err) { next(err) }
}

export async function createCollection(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { name, color } = req.body
    const { data, error } = await supabase
      .from('notebook_collections')
      .insert({ user_id: req.userId, name, color: color ?? 'hsl(28,95%,58%)' })
      .select().single()
    if (error) throw error
    res.status(201).json(data)
  } catch (err) { next(err) }
}

export async function deleteCollection(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const { error } = await supabase
      .from('notebook_collections')
      .delete()
      .eq('id', id)
      .eq('user_id', req.userId)
    if (error) throw error
    res.json({ success: true })
  } catch (err) { next(err) }
}

export async function getItems(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { collectionId } = req.params
    const { data, error } = await supabase
      .from('notebook_items')
      .select('*')
      .eq('collection_id', collectionId)
      .order('created_at', { ascending: false })
    if (error) throw error
    res.json(data ?? [])
  } catch (err) { next(err) }
}

export async function addItem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { collectionId } = req.params
    const { pattern, meaning, example_jp, example_en, tags } = req.body
    const { data, error } = await supabase
      .from('notebook_items')
      .insert({ collection_id: collectionId, pattern, meaning, example_jp, example_en, tags: tags ?? [] })
      .select().single()
    if (error) throw error

    // Queue embedding generation asynchronously
    embeddingQueue.add('embed-notebook-item', {
      record_id: data.id,
      record_type: 'notebook',
      text: `${pattern} ${meaning} ${example_jp ?? ''}`,
    }).catch(() => {})

    res.status(201).json(data)
  } catch (err) { next(err) }
}

export async function deleteItem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const { error } = await supabase.from('notebook_items').delete().eq('id', id)
    if (error) throw error
    res.json({ success: true })
  } catch (err) { next(err) }
}
