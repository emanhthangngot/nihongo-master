"""
Model router: tries Ollama/Gemma first, falls back to Groq on timeout/error.
"""
import asyncio
from typing import AsyncIterator
from app.core.config import settings


class ModelRouter:
    async def astream(self, system_prompt: str, query: str) -> AsyncIterator[str]:
        try:
            async for token in self._stream_ollama(system_prompt, query):
                yield token
        except Exception:
            if settings.groq_api_key and settings.use_groq_fallback:
                async for token in self._stream_groq(system_prompt, query):
                    yield token
            else:
                yield "I'm currently offline. Please check back later."

    async def _stream_ollama(self, system_prompt: str, query: str) -> AsyncIterator[str]:
        from llama_index.llms.ollama import Ollama
        llm = Ollama(
            model=settings.ollama_model,
            base_url=settings.ollama_base_url,
            request_timeout=8.0,
        )
        full_prompt = f"{system_prompt}\n\nUser: {query}\nSensei:"
        async with asyncio.timeout(8.0):
            response = await llm.acomplete(full_prompt)
            # Stream word by word to simulate token streaming
            for word in str(response).split(" "):
                yield word + " "
                await asyncio.sleep(0)

    async def _stream_groq(self, system_prompt: str, query: str) -> AsyncIterator[str]:
        from llama_index.llms.groq import Groq
        from llama_index.core.llms import ChatMessage
        llm = Groq(model=settings.groq_model, api_key=settings.groq_api_key)
        messages = [
            ChatMessage(role="system", content=system_prompt),
            ChatMessage(role="user", content=query),
        ]
        response = await llm.astream_chat(messages)
        async for chunk in response:
            if chunk.delta:
                yield chunk.delta


model_router = ModelRouter()
