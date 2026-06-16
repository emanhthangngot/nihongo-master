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

def trace_rag_run(user_id: str | None, query: str, user_level: str, retrieved_records: list[dict], latency_ms: int = 0) -> None:
    if not _sb:
        return
    try:
        run_res = _sb.table("rag_runs").insert({
            "user_id": user_id,
            "query": query,
            "user_level": user_level,
            "latency_ms": latency_ms
        }).execute()
        
        if run_res.data:
            run_id = run_res.data[0]["id"]
            retrievals = []
            for i, r in enumerate(retrieved_records):
                retrievals.append({
                    "run_id": run_id,
                    "document_id": r.get("id"),
                    "vector_score": r.get("vector_score"),
                    "bm25_score": r.get("bm25_score"),
                    "rerank_score": r.get("final_score"),
                    "final_rank": i + 1
                })
            if retrievals:
                _sb.table("rag_retrievals").insert(retrievals).execute()
    except Exception as e:
        print(f"Tracing error: {e}")
