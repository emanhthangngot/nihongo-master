import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth'
import { supabase } from '../lib/supabase'
import { streakService } from '../services/streakService'

const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? 'http://localhost:8000'

import { z } from 'zod'

const AskQuestionSchema = z.object({
  message: z.string().min(1).max(2000),
  conversation_id: z.string().uuid().optional(),
  jlpt_level: z.enum(["N5", "N4", "N3", "N2", "N1"]).optional()
})

export async function streamChat(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const parseRes = AskQuestionSchema.safeParse(req.body)
    if (!parseRes.success) return res.status(400).json({ error: parseRes.error.errors })
    const { message, conversation_id, jlpt_level } = parseRes.data

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    const aiRes = await fetch(`${AI_SERVICE_URL}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: message }],
        conversation_id: conversation_id ?? null,
        user_id: req.userId ?? null,
        jlpt_level: jlpt_level ?? 'N4',
      }),
    })

    if (!aiRes.ok || !aiRes.body) {
      res.write(`data: ${JSON.stringify({ error: 'AI service unavailable' })}\n\n`)
      return res.end()
    }

    // Forward SSE stream to client
    const reader = (aiRes.body as ReadableStream<Uint8Array>).getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      res.write(decoder.decode(value, { stream: true }))
    }

    // Update streak after a conversation turn
    if (req.userId) {
      streakService.checkAndUpdate(req.userId).catch(() => {})
    }

    res.end()
  } catch (err) { next(err) }
}

export async function getConversations(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('id, title, created_at, updated_at')
      .eq('user_id', req.userId)
      .order('updated_at', { ascending: false })
      .limit(20)
    if (error) throw error
    res.json(data ?? [])
  } catch (err) { next(err) }
}

export async function createConversation(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { title } = req.body
    const { data, error } = await supabase
      .from('conversations')
      .insert({ user_id: req.userId, title: title ?? 'New Chat' })
      .select()
      .single()
    if (error) throw error
    res.status(201).json(data)
  } catch (err) { next(err) }
}

export async function getMessages(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { convId } = req.params
    const { data, error } = await supabase
      .from('chat_messages')
      .select('id, role, content, grammar_data, created_at')
      .eq('conversation_id', convId)
      .order('created_at')
    if (error) throw error
    res.json(data ?? [])
  } catch (err) { next(err) }
}
