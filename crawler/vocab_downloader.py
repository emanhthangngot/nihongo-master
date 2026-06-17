"""
vocab_downloader.py — Download JLPT N5-N1 vocabulary and import into Supabase dictionary_entries.
Usage:
  python crawler/vocab_downloader.py
"""
import os
import csv
import httpx
import asyncio
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")
AI_SERVICE_URL = os.environ.get("AI_SERVICE_URL", "http://localhost:8000")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async def embed_batch(client: httpx.AsyncClient, texts: list[str]) -> list[list[float]]:
    try:
        resp = await client.post(f"{AI_SERVICE_URL}/embed/batch", json=texts, timeout=120)
        if resp.status_code == 200:
            data = resp.json()
            return data.get("embeddings", data) if isinstance(data, dict) else data
    except Exception as e:
        print(f"  [Warning] Failed to generate embeddings via AI service: {e}. Proceeding without embeddings.")
    return [None] * len(texts)

async def download_and_import():
    levels = ["n5", "n4", "n3", "n2", "n1"]
    async with httpx.AsyncClient() as client:
        for lvl in levels:
            url = f"https://raw.githubusercontent.com/jamsinclair/open-anki-jlpt-decks/main/src/{lvl}.csv"
            print(f"📥 Downloading Vocabulary for {lvl.upper()} from {url}...")
            
            resp = await client.get(url)
            if resp.status_code != 200:
                print(f"  ❌ Failed to download {lvl.upper()} vocabulary. Status code: {resp.status_code}")
                continue
                
            csv_data = resp.text.splitlines()
            reader = csv.DictReader(csv_data)
            
            entries = []
            for row in reader:
                word = row.get("expression", "").strip()
                reading = row.get("reading", "").strip()
                meaning_raw = row.get("meaning", "").strip()
                
                # Parse meanings (e.g. "to meet, to see" -> ["to meet", "to see"])
                meanings = [m.strip().strip('"') for m in meaning_raw.split(",") if m.strip()]
                
                if word:
                    entries.append({
                        "word": word,
                        "reading": reading,
                        "romaji": "", # Will be filled if needed or parsed
                        "meanings": meanings[:5],
                        "pos": "unknown", # General POS
                        "jlpt_level": lvl.upper(),
                    })
            
            print(f"  ✓ Parsed {len(entries)} words. Starting import in batches of 64...")
            
            # Upsert in batches
            batch_size = 64
            for i in range(0, len(entries), batch_size):
                batch = entries[i : i + batch_size]
                
                # Prepare text for embedding: "word: reading - meaning"
                texts = [
                    f"passage: {e['word']} ({e['reading']}) - {', '.join(e['meanings'])}"
                    for e in batch
                ]
                
                embeddings = await embed_batch(client, texts)
                
                records = []
                for e, emb in zip(batch, embeddings):
                    record = {
                        "word": e["word"],
                        "reading": e["reading"],
                        "romaji": e["romaji"],
                        "meanings": e["meanings"],
                        "pos": e["pos"],
                        "jlpt_level": e["jlpt_level"],
                    }
                    if emb:
                        record["embedding"] = emb
                    records.append(record)
                
                try:
                    # Using Supabase python SDK to upsert
                    supabase.table("dictionary_entries").upsert(
                        records, on_conflict="word,reading"
                    ).execute()
                except Exception as ex:
                    # In case unique constraint is only on 'word' or differs:
                    try:
                        supabase.table("dictionary_entries").upsert(
                            records, on_conflict="id"
                        ).execute()
                    except Exception:
                        # Fallback: insert one by one or print error
                        print(f"  ❌ Error bulk inserting batch starting at {i}: {ex}")
                        
                print(f"  ✓ Processed {min(i + batch_size, len(entries))}/{len(entries)} words")
            
            print(f"✅ Ingestion complete for {lvl.upper()}!")

if __name__ == "__main__":
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables must be set.")
    else:
        asyncio.run(download_and_import())
