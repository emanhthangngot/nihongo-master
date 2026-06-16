import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth'
import { supabase } from '../lib/supabase'
import { xpService } from '../services/xpService'
import { userService } from '../services/userService'

export async function getLearningPath(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const jlptLevel = (req.query.level as string) ?? undefined

    let nodesQ = supabase
      .from('learning_graph_nodes')
      .select('*')
      .order('sort_order')
    if (jlptLevel) nodesQ = nodesQ.eq('jlpt_level', jlptLevel)

    const { data: nodes, error } = await nodesQ
    if (error) throw error

    const { data: edges, error: edgeErr } = await supabase
      .from('learning_graph_edges')
      .select('*')
    if (edgeErr) throw edgeErr

    const { data: progress } = await supabase
      .from('user_node_progress')
      .select('node_id, status, progress_current, progress_total, completed_at')
      .eq('user_id', req.userId)

    const progressMap = Object.fromEntries((progress ?? []).map((p) => [p.node_id, p]))

    const enriched = (nodes ?? []).map((node) => ({
      ...node,
      userProgress: progressMap[node.id] ?? { status: 'locked', progress_current: 0, progress_total: 0 },
    }))

    res.json({ nodes: enriched, edges: edges ?? [] })
  } catch (err) { next(err) }
}

export async function getLessons(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { data, error } = await supabase
      .from('curriculum_lessons')
      .select('*, curriculum_books(title_jp, jlpt_level)')
      .order('lesson_number')
    if (error) throw error

    const { data: progress } = await supabase
      .from('user_progress')
      .select('lesson_id, status, score, completed_at')
      .eq('user_id', req.userId)

    const pm = Object.fromEntries((progress ?? []).map((p) => [p.lesson_id, p]))
    const enriched = (data ?? []).map((l) => ({ ...l, userProgress: pm[l.id] ?? { status: 'locked' } }))
    res.json(enriched)
  } catch (err) { next(err) }
}

export async function getLesson(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { lessonNumber } = req.params
    const { data: lesson, error } = await supabase
      .from('curriculum_lessons')
      .select('*, curriculum_grammar_points(*), curriculum_books(title_jp, jlpt_level)')
      .eq('lesson_number', parseInt(lessonNumber))
      .single()
    if (error || !lesson) return res.status(404).json({ error: 'Lesson not found' })

    const { data: progress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', req.userId)
      .eq('lesson_id', lesson.id)
      .single()

    res.json({ ...lesson, userProgress: progress ?? { status: 'locked' } })
  } catch (err) { next(err) }
}

export async function completeLesson(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { lessonNumber } = req.params
    const { score } = req.body

    const { data: lesson } = await supabase
      .from('curriculum_lessons')
      .select('id, is_milestone, lesson_number')
      .eq('lesson_number', parseInt(lessonNumber))
      .single()
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' })

    // Upsert user_progress
    await supabase.from('user_progress').upsert({
      user_id: req.userId,
      lesson_id: lesson.id,
      status: 'completed',
      score: score ?? 100,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,lesson_id' })

    // Unlock next lesson
    const { data: nextLesson } = await supabase
      .from('curriculum_lessons')
      .select('id')
      .eq('lesson_number', lesson.lesson_number + 1)
      .single()

    if (nextLesson) {
      await supabase.from('user_progress').upsert({
        user_id: req.userId, lesson_id: nextLesson.id, status: 'available', updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,lesson_id' })
    }

    // Award XP
    const xpAmount = lesson.is_milestone ? 100 : 50
    const totalXP = await xpService.award(req.userId!, xpAmount)

    res.json({ success: true, xp_earned: xpAmount, total_xp: totalXP })
  } catch (err) { next(err) }
}

export async function seedInitialPath(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { data: user } = await supabase.from('users').select('jlpt_target').eq('id', req.userId).single()
    await userService.seedInitialPath(req.userId!, user?.jlpt_target ?? 'N5')
    res.json({ success: true })
  } catch (err) { next(err) }
}

export async function getRecommendedNodes(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { data: nodes, error } = await supabase.from('learning_graph_nodes').select('*')
    if (error) throw error

    const { data: edges } = await supabase.from('learning_graph_edges').select('*')
    const { data: progress } = await supabase
      .from('user_node_progress')
      .select('node_id, status')
      .eq('user_id', req.userId)

    const completedNodeIds = new Set((progress ?? []).filter(p => p.status === 'completed').map(p => p.node_id))
    
    const pendingNodes = (nodes ?? []).filter(n => !completedNodeIds.has(n.id))

    const recommendations = pendingNodes.filter(node => {
      const prerequisites = (edges ?? []).filter(e => e.to_node === node.id).map(e => e.from_node)
      return prerequisites.every(prereq => completedNodeIds.has(prereq))
    })

    res.json(recommendations.slice(0, 3))
  } catch (err) { next(err) }
}
