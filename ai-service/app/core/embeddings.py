"""
Singleton embedding model.
Uses Google Gemini Embedding API.
"""
from app.core.config import settings

_model = None


def get_embeddings_model():
    global _model
    if _model is None:
        from llama_index.embeddings.google_genai import GoogleGenAIEmbedding
        _model = GoogleGenAIEmbedding(model_name=settings.embed_model, api_key=settings.gemini_api_key)
    return _model


def embed_texts(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []
    model = get_embeddings_model()
    vecs = model.get_text_embedding_batch(texts)
    return vecs


def embed_query(query: str) -> list[float]:
    model = get_embeddings_model()
    vec = model.get_query_embedding(query)
    return vec
