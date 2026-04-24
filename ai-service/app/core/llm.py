from llama_index.llms.ollama import Ollama
from llama_index.llms.groq import Groq
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from app.core.config import settings

def get_llm():
    """Return primary LLM (Ollama local) or Groq fallback."""
    try:
        return Ollama(
            model=settings.ollama_model,
            base_url=settings.ollama_base_url,
            request_timeout=60.0,
        )
    except Exception:
        if settings.groq_api_key and settings.use_groq_fallback:
            return Groq(model=settings.groq_model, api_key=settings.groq_api_key)
        raise

def get_embed_model():
    return HuggingFaceEmbedding(model_name=settings.embed_model)