"""
kanji_downloader.py — Download JLPT N5-N1 Kanji data and import into Supabase kanji_entries.
Usage:
  python crawler/kanji_downloader.py
"""
import os
import json
import httpx
import asyncio
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")
AI_SERVICE_URL = os.environ.get("AI_SERVICE_URL", "http://localhost:8000")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

JLPT_MAP = {
    5: "N5",
    4: "N4",
    3: "N3",
    2: "N2",
    1: "N1"
}

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
    url = "https://raw.githubusercontent.com/davidluzgouveia/kanji-data/master/kanji.json"
    print(f"📥 Downloading Kanji Data from {url}...")
    
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, timeout=120)
        if resp.status_code != 200:
            print(f"❌ Failed to download Kanji database. Status code: {resp.status_code}")
            return
            
        kanji_db = resp.json()
        print(f"  ✓ Downloaded {len(kanji_db)} characters. Filtering JLPT N5-N1...")
        
        entries = []
        for char, info in kanji_db.items():
            jlpt_num = info.get("jlpt_new")
            if jlpt_num in JLPT_MAP:
                meanings = info.get("meanings", [])
                on_readings = info.get("readings_on", [])
                kun_readings = info.get("readings_kun", [])
                strokes = info.get("strokes", 0)
                
                entries.append({
                    "char": char,
                    "on_readings": on_readings,
                    "kun_readings": kun_readings,
                    "meanings": meanings[:5],
                    "stroke_count": strokes,
                    "jlpt_level": JLPT_MAP[jlpt_num]
                })
        
        print(f"  ✓ Found {len(entries)} JLPT Kanji entries. Starting import in batches of 64...")
        
        batch_size = 64
        for i in range(0, len(entries), batch_size):
            batch = entries[i : i + batch_size]
            
            # Prepare text for embedding: "char (kun_readings / on_readings): meaning"
            texts = [
                f"passage: {e['char']} (On: {', '.join(e['on_readings'])} / Kun: {', '.join(e['kun_readings'])}): {', '.join(e['meanings'])}"
                for e in batch
            ]
            
            embeddings = await embed_batch(client, texts)
            
            records = []
            for e, emb in zip(batch, embeddings):
                record = {
                    "char": e["char"],
                    "on_readings": e["on_readings"],
                    "kun_readings": e["kun_readings"],
                    "meanings": e["meanings"],
                    "stroke_count": e["stroke_count"],
                    "jlpt_level": e["jlpt_level"]
                }
                if emb:
                    record["embedding"] = emb
                records.append(record)
            
            try:
                supabase.table("kanji_entries").upsert(
                    records, on_conflict="char"
                ).execute()
            except Exception as ex:
                print(f"  ❌ Error bulk inserting batch starting at {i}: {ex}")
                
            print(f"  ✓ Processed {min(i + batch_size, len(entries))}/{len(entries)} characters")
            
        print("✅ Kanji Ingestion Complete!")

if __name__ == "__main__":
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables must be set.")
    else:
        asyncio.run(download_and_import())
