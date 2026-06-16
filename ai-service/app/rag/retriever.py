"""
Retrieval helpers: vector search against Supabase pgvector.
Falls back to empty list when DB is not configured.
"""
from typing import Optional

try:
    from supabase import create_client, Client
    from app.core.config import settings
    _sb: Optional[Client] = (
        create_client(settings.supabase_url, settings.supabase_service_key)
        if settings.supabase_url and settings.supabase_service_key
        else None
    )
except Exception:
    _sb = None


async def retrieve_vocabulary(query_embedding: list[float], top_k: int = 5) -> list[str]:
    """Semantic search over vocabulary / dictionary_entries table."""
    if not _sb:
        return []
    try:
        res = _sb.rpc("match_vocabulary", {
            "query_embedding": query_embedding,
            "match_count": top_k,
        }).execute()
        chunks = []
        for row in res.data or []:
            word = row.get("word", "")
            reading = row.get("reading", "")
            meanings = row.get("meanings_json", "")
            chunks.append(f"{word}（{reading}）: {meanings}")
        return chunks
    except Exception:
        return []


async def retrieve_chat_memories(user_id: str, query_embedding: list[float], top_k: int = 3) -> list[str]:
    """Semantic search over chat_messages for a user's past conversations."""
    if not _sb:
        return []
    try:
        res = _sb.rpc("match_chat_memories", {
            "p_user_id": user_id,
            "query_embedding": query_embedding,
            "match_count": top_k,
        }).execute()
        return [row.get("content", "") for row in res.data or []]
    except Exception:
        return []

async def retrieve_documents_hybrid(query_text: str, query_embedding: list[float], top_k: int = 3) -> tuple[list[str], list[dict]]:
    """Hybrid search over document_embeddings using pgvector and tsvector (RRF)."""
    if not _sb:
        return [], []
    try:
        res = _sb.rpc("hybrid_search_documents", {
            "query_text": query_text,
            "query_embedding": query_embedding,
            "match_count": top_k,
        }).execute()
        
        records = res.data or []
        chunks = []
        for row in records:
            content = row.get("content", "")
            meta = row.get("metadata", {})
            level = meta.get("level", "Unknown")
            chunks.append(f"[Level: {level}] {content}")
            
        return chunks, records
    except Exception as e:
        print(f"Hybrid retrieval error: {e}")
        return [], []
