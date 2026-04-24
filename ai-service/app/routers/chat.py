import json
from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse
from app.models.schemas import ChatRequest
from app.rag.memory import memory_manager
from app.rag.prompts import build_sensei_prompt
from app.models.router import model_router

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


async def _generate_stream(query: str, conversation_id: str | None, jlpt_level: str):
    history = memory_manager.get_history(conversation_id)
    system_prompt = build_sensei_prompt([], history, jlpt_level)

    # Detect grammar for card injection
    grammar = detect_grammar(query)

    # Stream tokens from model router (Gemma → Groq fallback)
    collected = ""
    try:
        async for token in model_router.astream(system_prompt, query):
            collected += token
            yield json.dumps({"delta": token, "done": False})
    except Exception as e:
        # Fallback response if model unavailable
        fallback = f"I understand you're asking about: {query[:60]}. Please ensure Ollama is running with `ollama serve` and the gemma2:9b model is pulled."
        for word in fallback.split(" "):
            yield json.dumps({"delta": word + " ", "done": False})
        collected = fallback

    # Store turn in memory
    if conversation_id:
        memory_manager.add_turn(conversation_id, "user", query)
        memory_manager.add_turn(conversation_id, "assistant", collected)

    yield json.dumps({"delta": "", "done": True, "grammar": grammar})


@router.post("/stream")
async def chat_stream(req: ChatRequest):
    query = req.messages[-1].content if req.messages else ""
    return EventSourceResponse(
        _generate_stream(query, req.conversation_id, req.jlpt_level or "N4"),
        media_type="text/event-stream",
    )


@router.post("/")
async def chat(req: ChatRequest):
    query = req.messages[-1].content if req.messages else ""
    grammar = detect_grammar(query)
    return {
        "response": f"(Non-streaming) Received: {query}. Connect Ollama for real responses.",
        "grammar": grammar,
    }
