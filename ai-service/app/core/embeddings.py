"""
Singleton sentence-transformer embedding model.
Lazy-loaded on first use to avoid slowing startup.
"""
from app.core.config import settings

_model = None


def get_embeddings_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer(settings.embed_model)
    return _model


def embed_texts(texts: list[str]) -> list[list[float]]:
    model = get_embeddings_model()
    prefixed = [f"passage: {t}" for t in texts]
    vecs = model.encode(prefixed, batch_size=32, normalize_embeddings=True)
    return vecs.tolist()


def embed_query(query: str) -> list[float]:
    model = get_embeddings_model()
    vec = model.encode(f"query: {query}", normalize_embeddings=True)
    return vec.tolist()
