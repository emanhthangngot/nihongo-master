-- Update notebook_items embedding to match new model if needed, or simply add RPC
ALTER TABLE notebook_items ALTER COLUMN embedding TYPE vector;

CREATE OR REPLACE FUNCTION match_notebook_items(
  p_user_id uuid,
  query_embedding vector,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  pattern text,
  meaning text,
  example_jp text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    n.id,
    n.pattern,
    n.meaning,
    n.example_jp,
    1 - (n.embedding <=> query_embedding) as similarity
  FROM notebook_items n
  JOIN notebook_collections c ON n.collection_id = c.id
  WHERE c.user_id = p_user_id AND n.embedding IS NOT NULL
  ORDER BY n.embedding <=> query_embedding
  LIMIT match_count;
$$;
