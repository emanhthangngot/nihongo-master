import json
import time
from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse
from pydantic import BaseModel
from app.models.schemas import ChatRequest
from app.rag.memory import memory_manager
from app.rag.prompts import build_sensei_prompt
from app.models.router import model_router
from app.core.embeddings import embed_query
from app.rag.retriever import retrieve_documents_hybrid
from app.core.trace import trace_rag_run

router = APIRouter()

GRAMMAR_TRIGGERS = {
    "て-form":     {"title":"～ている",        "meaning":"ongoing action or current state",       "example":"雨が降っている。",   "translation":"It is raining."},
    "particle":    {"title":"は vs が",         "meaning":"topic vs subject marker",               "example":"私は学生です。",     "translation":"I am a student."},
    "たことがある":{"title":"～たことがある",   "meaning":"have experience of doing ~",             "example":"日本に行ったことがある。","translation":"I have been to Japan."},
    "ている":      {"title":"～ている",          "meaning":"ongoing action or resultant state",     "example":"食べています。",     "translation":"I am eating."},
    "たい":        {"title":"～たい",            "meaning":"want to do ~",                         "example":"日本語を話したい。", "translation":"I want to speak Japanese."},
    "てください":  {"title":"～てください",      "meaning":"please do ~",                           "example":"窓を開けてください。","translation":"Please open the window."},
}

def detect_grammar(text: str) -> dict | None:
    tl = text.lower()
    for key, g in GRAMMAR_TRIGGERS.items():
        if key in tl:
            return g
    return None

async def rewrite_query(query: str, history: list[str]) -> str:
    # Placeholder for LLM query rewriting
    return query

async def _generate_stream(query: str, conversation_id: str | None, user_id: str | None, jlpt_level: str):
    start_time = time.time()
    history = memory_manager.get_history(conversation_id)
    
    # 1. Query Rewriting (Stub)
    rewritten_query = await rewrite_query(query, history)
    
    # 2. Hybrid Retrieval
    query_emb = embed_query(rewritten_query)
    chunks, records = await retrieve_documents_hybrid(rewritten_query, query_emb, top_k=3)
    
    # 3. Prompt Assembly
    system_prompt = build_sensei_prompt(chunks, history, jlpt_level)

    # Detect grammar for UI
    grammar = detect_grammar(query)

    # 4. Stream tokens
    collected = ""
    try:
        async for token in model_router.astream(system_prompt, query):
            collected += token
            yield json.dumps({"delta": token, "done": False})
    except Exception as e:
        fallback = f"I understand you're asking about: {query[:60]}. Please ensure Ollama is running."
        for word in fallback.split(" "):
            yield json.dumps({"delta": word + " ", "done": False})
        collected = fallback

    # 5. Trace and Memory
    latency_ms = int((time.time() - start_time) * 1000)
    trace_rag_run(user_id, query, jlpt_level, records, latency_ms)
    
    if conversation_id:
        memory_manager.add_turn(conversation_id, "user", query)
        memory_manager.add_turn(conversation_id, "assistant", collected)

    yield json.dumps({"delta": "", "done": True, "grammar": grammar})

@router.post("/stream")
async def chat_stream(req: ChatRequest):
    query = req.messages[-1].content if req.messages else ""
    return EventSourceResponse(
        _generate_stream(query, req.conversation_id, req.user_id, req.jlpt_level or "N4"),
        media_type="text/event-stream",
    )

class GradeWritingRequest(BaseModel):
    text: str
    jlpt_level: str = "N4"

@router.post("/grade-writing")
async def grade_writing(req: GradeWritingRequest):
    """
    Separate endpoint for grading writing.
    Returns structured JSON validation.
    """
    system_prompt = f"""You are a Japanese writing grader. The user is at JLPT {req.jlpt_level} level.
Analyze the user's Japanese sentence and return a JSON object ONLY with the following schema:
{{
  "score": <0-100>,
  "level_estimate": "<estimated JLPT level>",
  "errors": [
    {{
      "span": "<incorrect part>",
      "error_type": "<type of error>",
      "correction": "<corrected part>",
      "explanation_vi": "<explanation in Vietnamese>"
    }}
  ],
  "natural_version": "<native-like version>",
  "overall_feedback_vi": "<general feedback in Vietnamese>"
}}"""

    collected = ""
    try:
        async for token in model_router.astream(system_prompt, req.text):
            collected += token
        
        json_str = collected[collected.find("{"):collected.rfind("}")+1]
        result = json.loads(json_str)
        return result
    except Exception as e:
        return {
            "score": 0,
            "errors": [],
            "natural_version": req.text,
            "overall_feedback_vi": f"Lỗi chấm điểm: {str(e)}"
        }
