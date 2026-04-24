-- Add vector embedding to chat_messages for RAG retrieval
alter table chat_messages add column if not exists embedding vector(1024);

create index if not exists chat_messages_embedding_idx on chat_messages
  using ivfflat (embedding vector_cosine_ops) with (lists = 50);

-- ─── Supabase RPC: semantic search over chat memories ──────────────────────
create or replace function match_chat_memories(
  p_user_id uuid,
  query_embedding vector(1024),
  match_count int default 5
)
returns table (
  id uuid,
  content text,
  role text,
  similarity float
)
language sql stable
as $$
  select
    cm.id,
    cm.content,
    cm.role,
    1 - (cm.embedding <=> query_embedding) as similarity
  from chat_messages cm
  join conversations c on c.id = cm.conversation_id
  where c.user_id = p_user_id
    and cm.embedding is not null
  order by cm.embedding <=> query_embedding
  limit match_count;
$$;
