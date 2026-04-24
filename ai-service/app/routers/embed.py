from fastapi import APIRouter, BackgroundTasks
from app.models.schemas import EmbedRequest
from app.core.embeddings import embed_texts, embed_query

router = APIRouter()


@router.post("/")
async def create_embedding(req: EmbedRequest):
    """Generate embedding for a single text entry."""
    vecs = embed_texts([req.text])
    return {"entry_id": req.entry_id, "dims": len(vecs[0]), "embedding": vecs[0]}


@router.post("/batch")
async def batch_embed(texts: list[str]):
    """Batch-embed a list of texts. Returns list of float vectors."""
    vecs = embed_texts(texts)
    return {"count": len(vecs), "dims": len(vecs[0]) if vecs else 0, "embeddings": vecs}


@router.post("/query")
async def embed_query_text(payload: dict):
    """Embed a search query (uses query: prefix for e5 model)."""
    q = payload.get("text", "")
    return {"embedding": embed_query(q)}
