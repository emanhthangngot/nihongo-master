# NihongoMaster

> AI-powered Japanese learning — RAG-heavy architecture & FSRS memory science

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| State | Zustand + TanStack Query |
| Animations | Framer Motion |
| Backend | Node.js + Express + BullMQ |
| AI Service | FastAPI + LlamaIndex + SudachiPy |
| Database | Supabase (PostgreSQL + pgvector) |
| Cache/Queue | Redis |
| Local LLM | Ollama (Gemma 2 9b) |

## Getting Started

```bash
# 1. Clone & install
git clone https://github.com/your-org/nihongo-master.git
cd nihongo-master

# 2. Frontend
cd frontend
npm install
cp ../.env.example .env.local
npm run dev

# 3. Backend (separate terminal)
cd backend
npm install
npm run dev

# 4. AI Service (separate terminal)
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 5. Local services (Docker)
docker compose up -d   # Supabase, Redis, Ollama
```

## Directory Structure

```
nihongo-master/
├── frontend/          # React 18 PWA
├── backend/           # Node.js + Express API Gateway
├── ai-service/        # FastAPI RAG + NLP service
├── ingestion/         # Python data import scripts
├── supabase/          # SQL migrations
└── docker-compose.yml
```
