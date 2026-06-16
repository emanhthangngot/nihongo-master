import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '../../ai-service'))

import json
import asyncio
from app.core.embeddings import embed_query
from app.rag.retriever import retrieve_documents_hybrid

async def evaluate():
    questions = []
    with open(os.path.join(os.path.dirname(__file__), "golden_questions.jsonl")) as f:
        for line in f:
            questions.append(json.loads(line))

    print("Starting retrieval evaluation...")
    for q in questions:
        query = q["query"]
        emb = embed_query(query)
        chunks, records = await retrieve_documents_hybrid(query, emb, top_k=5)
        # Note: Without populated expected_doc_ids, true recall cannot be measured.
        # This script sets up the harness for when they are populated.
        print(f"Query: {query}")
        print(f"Retrieved: {len(chunks)} chunks")
        if records:
            print(f"Top score: {records[0].get('final_score')}")
        print("-" * 20)

if __name__ == "__main__":
    asyncio.run(evaluate())
