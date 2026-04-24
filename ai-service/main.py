from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import chat, embed, analyze, health

app = FastAPI(
    title="NihongoMaster AI Service",
    description="RAG-powered Japanese tutor — LlamaIndex + SudachiPy + Ollama",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(chat.router,   prefix="/chat",    tags=["Chat"])
app.include_router(embed.router,  prefix="/embed",   tags=["Embeddings"])
app.include_router(analyze.router,prefix="/analyze", tags=["NLP"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)