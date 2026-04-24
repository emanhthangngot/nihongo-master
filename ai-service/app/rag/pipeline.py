"""
LlamaIndex RAG pipeline for grammar & dictionary grounding.
"""
from llama_index.core import VectorStoreIndex, Settings as LISettings
from llama_index.core.memory import ChatMemoryBuffer
from llama_index.core.chat_engine import CondensePlusContextChatEngine
from app.core.llm import get_llm, get_embed_model

SYSTEM_PROMPT = """You are Sensei AI, an expert Japanese language tutor inside NihongoMaster.

Rules:
- Always ground grammar explanations in the retrieved context (JMDict / Kanjidic2 / Minna no Nihongo curriculum).
- Never invent grammar rules; if uncertain, say so and suggest consulting a textbook.
- When explaining a grammar point, always provide:
  1. Pattern name (e.g. ～ている)
  2. Meaning in English
  3. One clear example sentence (Japanese + English)
  4. Common mistakes learners make
- Respond in English unless the user writes in Japanese, in which case mirror their language.
- Keep explanations concise but complete. Use markdown for structure.
"""

_engine = None

def get_chat_engine(index: VectorStoreIndex):
    global _engine
    if _engine:
        return _engine
    memory = ChatMemoryBuffer.from_defaults(token_limit=4096)
    _engine = CondensePlusContextChatEngine.from_defaults(
        retriever=index.as_retriever(similarity_top_k=4),
        memory=memory,
        llm=get_llm(),
        system_prompt=SYSTEM_PROMPT,
        verbose=False,
    )
    return _engine