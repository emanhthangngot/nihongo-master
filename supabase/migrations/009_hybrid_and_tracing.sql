-- 1. Client Mutations for Idempotency
CREATE TABLE IF NOT EXISTS client_mutations (
  id uuid primary key,
  user_id uuid not null,
  mutation_type text not null,
  created_at timestamptz default now()
);

-- 2. Hybrid Search for Document Embeddings
ALTER TABLE document_embeddings
ADD COLUMN IF NOT EXISTS search_text tsvector;

CREATE INDEX IF NOT EXISTS document_embeddings_search_idx
ON document_embeddings USING GIN(search_text);

-- Update existing rows
UPDATE document_embeddings
SET search_text = to_tsvector(
  'simple',
  coalesce(content, '') || ' ' ||
  coalesce(metadata->>'level', '') || ' ' ||
  coalesce(metadata->>'tags', '')
);

-- Trigger to update search_text automatically
CREATE OR REPLACE FUNCTION update_document_search_text() RETURNS trigger AS $$
BEGIN
  NEW.search_text := to_tsvector(
    'simple',
    coalesce(NEW.content, '') || ' ' ||
    coalesce(NEW.metadata->>'level', '') || ' ' ||
    coalesce(NEW.metadata->>'tags', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_document_search_text ON document_embeddings;
CREATE TRIGGER trigger_update_document_search_text
BEFORE INSERT OR UPDATE ON document_embeddings
FOR EACH ROW EXECUTE FUNCTION update_document_search_text();

-- 3. Observability & Tracing Tables
CREATE TABLE IF NOT EXISTS rag_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  query text,
  rewritten_query text,
  user_level text,
  prompt_version text,
  model_name text,
  latency_ms int,
  token_input int,
  token_output int,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS rag_retrievals (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references rag_runs(id),
  document_id uuid, -- UUID of the document_embeddings or other source
  source text,
  vector_score float,
  bm25_score float,
  rerank_score float,
  final_rank int
);

-- 4. RPC for Hybrid Search
CREATE OR REPLACE FUNCTION hybrid_search_documents(
  query_text text,
  query_embedding vector(3072),
  match_count int DEFAULT 5,
  full_text_weight float DEFAULT 1.0,
  semantic_weight float DEFAULT 1.0,
  rrf_k int DEFAULT 60
) RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  vector_score float,
  bm25_score float,
  final_score float
) AS $$
WITH semantic_search AS (
  SELECT id, content, metadata, 1 - (embedding <=> query_embedding) AS vector_score,
         ROW_NUMBER() OVER (ORDER BY embedding <=> query_embedding) AS rank
  FROM document_embeddings
  ORDER BY embedding <=> query_embedding
  LIMIT match_count * 2
),
fulltext_search AS (
  SELECT id, content, metadata, ts_rank(search_text, websearch_to_tsquery('simple', query_text)) AS bm25_score,
         ROW_NUMBER() OVER (ORDER BY ts_rank(search_text, websearch_to_tsquery('simple', query_text)) DESC) AS rank
  FROM document_embeddings
  WHERE search_text @@ websearch_to_tsquery('simple', query_text)
  ORDER BY bm25_score DESC
  LIMIT match_count * 2
)
SELECT 
  COALESCE(s.id, f.id) AS id,
  COALESCE(s.content, f.content) AS content,
  COALESCE(s.metadata, f.metadata) AS metadata,
  COALESCE(s.vector_score, 0) AS vector_score,
  COALESCE(f.bm25_score, 0) AS bm25_score,
  (COALESCE(semantic_weight / (rrf_k + s.rank), 0) + COALESCE(full_text_weight / (rrf_k + f.rank), 0)) AS final_score
FROM semantic_search s
FULL OUTER JOIN fulltext_search f ON s.id = f.id
ORDER BY final_score DESC
LIMIT match_count;
$$ LANGUAGE sql;
