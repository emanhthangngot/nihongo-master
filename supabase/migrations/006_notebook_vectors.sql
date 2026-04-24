-- Add vector embedding to notebook_items for AI Tutor retrieval
alter table notebook_items add column if not exists embedding vector(1024);

create index if not exists notebook_items_embedding_idx on notebook_items
  using ivfflat (embedding vector_cosine_ops) with (lists = 50);

-- ─── Supabase RPC: semantic vocabulary search ─────────────────────────────
create or replace function match_vocabulary(
  query_embedding vector(1024),
  match_count int default 10,
  filter_level text default null
)
returns table (
  id uuid,
  word text,
  reading text,
  meanings_json text,
  jlpt_level text,
  similarity float
)
language sql stable
as $$
  select
    d.id,
    d.word,
    d.reading,
    array_to_string(d.meanings, '; ') as meanings_json,
    d.jlpt_level,
    1 - (d.embedding <=> query_embedding) as similarity
  from dictionary_entries d
  where d.embedding is not null
    and (filter_level is null or d.jlpt_level = filter_level)
  order by d.embedding <=> query_embedding
  limit match_count;
$$;
