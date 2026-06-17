import { Queue, Worker } from 'bullmq'
import { redis } from '../lib/redis'
import { createClient } from '@supabase/supabase-js'

export const embeddingQueue = new Queue('embeddings', { connection: redis as any })

const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? 'http://localhost:8000'

function supabaseServiceClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY!
  )
}

export const embeddingWorker = new Worker(
  'embeddings',
  async (job) => {
    const { record_id, record_type, text } = job.data

    // Call AI service to generate embedding
    const res = await fetch(`${AI_SERVICE_URL}/embed/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([text]),
    })
    if (!res.ok) throw new Error(`Embed service ${res.status}`)

    const data = await res.json() as { embeddings?: number[][] }
    const embedding = data.embeddings?.[0]
    if (!embedding) throw new Error('No embedding returned')

    const table = record_type === 'notebook' ? 'notebook_items' : 'chat_messages'
    const sb = supabaseServiceClient()
    await sb.from(table).update({ embedding }).eq('id', record_id)

    return { record_id, table, dims: embedding.length }
  },
  {
    connection: redis as any,
    concurrency: 3,
    // Retry 3 times with exponential backoff
  }
)

embeddingWorker.on('completed', (job) => console.log(`[embed] ✓ ${job.id}`))
embeddingWorker.on('failed', (job, err) => console.error(`[embed] ✗ ${job?.id}:`, err.message))
