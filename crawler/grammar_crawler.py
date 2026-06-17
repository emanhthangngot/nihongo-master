"""
grammar_crawler.py — Crawl JLPT N5-N1 grammar, conjugate rules, and example sentences from JLPT Sensei.
Translates English content into Vietnamese using Gemini or local Ollama Gemma 2 if available.
Usage:
  python crawler/grammar_crawler.py --level N5
  python crawler/grammar_crawler.py --all
"""
import os
import re
import argparse
import asyncio
import httpx
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")
AI_SERVICE_URL = os.environ.get("AI_SERVICE_URL", "http://localhost:8000")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

async def translate_text(text: str) -> str:
    """Translates English text to Vietnamese using Gemini or local Ollama."""
    if not text:
        return ""
    
    prompt = f"Translate the following Japanese grammar explanation or example sentence into natural Vietnamese. Preserve any structural formatting. Do not output anything else but the translation:\n\n{text}"
    
    # 1. Try Gemini API
    if GEMINI_API_KEY:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
            async with httpx.AsyncClient() as client:
                resp = await client.post(url, json={
                    "contents": [{"parts": [{"text": prompt}]}]
                }, timeout=15)
                if resp.status_code == 200:
                    data = resp.json()
                    translated = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                    if translated:
                        return translated
        except Exception as e:
            print(f"  [Warning] Gemini translation failed: {e}. Trying Ollama...")

    # 2. Try Local Ollama (Gemma 2 9b)
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post("http://localhost:11434/api/generate", json={
                "model": "gemma2:9b",
                "prompt": prompt,
                "stream": False
            }, timeout=30)
            if resp.status_code == 200:
                data = resp.json()
                translated = data.get("response", "").strip()
                if translated:
                    return translated
    except Exception:
        pass

    # Fallback to English
    return text

async def embed_text(text: str) -> list[float]:
    """Generates vector embedding via the local AI service."""
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(f"{AI_SERVICE_URL}/embed/batch", json=[text], timeout=120)
            if resp.status_code == 200:
                data = resp.json()
                embeddings = data.get("embeddings", data) if isinstance(data, dict) else data
                return embeddings[0] if embeddings else None
    except Exception as e:
        print(f"  [Warning] Embedding generation failed: {e}")
    return None

async def scrape_detail_page(client: httpx.AsyncClient, url: str) -> dict:
    """Scrapes grammar connection details and example sentences from detail page."""
    try:
        resp = await client.get(url, headers=headers, timeout=20)
        if resp.status_code != 200:
            return {}
        
        soup = BeautifulSoup(resp.content, 'html.parser')
        
        # 1. Grammar connection / How to use
        connection = ""
        box = soup.find(class_="grammar-connection") or soup.find(class_="how-to-use") or soup.find(class_="panel-body")
        if box:
            connection = box.get_text("\n").strip()
            
        # 2. Example sentences
        examples = []
        rows = soup.find_all("tr", class_="example-row") or soup.find_all("div", class_="example-sentence")
        
        # Fallback if no specific classes: look for japanese text + english translation paragraphs
        if not rows:
            blocks = soup.find_all(class_="example-sentence-wrapper")
            for block in blocks:
                jp = block.find(class_="japanese")
                en = block.find(class_="english")
                if jp and en:
                    examples.append({
                        "japanese": jp.get_text().strip(),
                        "english": en.get_text().strip()
                    })
        else:
            for row in rows:
                jp_el = row.find(class_="japanese") or row.find("p", class_="japanese-text")
                en_el = row.find(class_="english") or row.find("p", class_="english-translation")
                if jp_el and en_el:
                    examples.append({
                        "japanese": jp_el.get_text().strip(),
                        "english": en_el.get_text().strip()
                    })
                    
        return {
            "connection": connection,
            "examples": examples[:5] # Limit to top 5
        }
    except Exception as e:
        print(f"  [Warning] Failed to scrape detail page {url}: {e}")
    return {}

async def crawl_level(level: str):
    print(f"\n🚀 Starting Grammar Crawl for {level}...")
    lvl_num = level.lower().replace("n", "") # e.g. "5"
    url = f"https://jlptsensei.com/jlpt-n{lvl_num}-grammar-list/"
    
    os.makedirs("data/grammar_docs", exist_ok=True)
    
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, headers=headers, timeout=30)
        if resp.status_code != 200:
            print(f"❌ Failed to download grammar list for {level}. Status: {resp.status_code}")
            return
            
        soup = BeautifulSoup(resp.content, 'html.parser')
        table = soup.find('table', class_='jlpt-grammar-list') or soup.find('table')
        if not table:
            print(f"❌ Could not find grammar table on {url}")
            return
            
        rows = table.find_all('tr')
        print(f"  ✓ Found table. Parsing {len(rows)-1} rows...")
        
        count = 0
        for row in rows[1:]: # Skip header
            cols = row.find_all('td')
            if len(cols) < 3:
                continue
                
            # Parse columns
            grammar_el = cols[1]
            grammar_point = grammar_el.text.strip()
            link_el = grammar_el.find('a')
            detail_url = link_el['href'] if link_el else None
            
            romaji = cols[2].text.strip() if len(cols) >= 4 else ""
            english_meaning = cols[3].text.strip() if len(cols) >= 4 else cols[2].text.strip()
            
            print(f"\n📖 Crawling Grammar Point: {grammar_point} ({romaji})")
            
            # Fetch detail page
            connection = ""
            examples = []
            if detail_url:
                details = await scrape_detail_page(client, detail_url)
                connection = details.get("connection", "")
                examples = details.get("examples", [])
            
            # Translate to Vietnamese
            print("  Translating explanation & examples...")
            vi_meaning = await translate_text(english_meaning)
            vi_connection = await translate_text(connection) if connection else ""
            
            # Generate markdown document for RAG
            md_content = f"""# JLPT {level} Grammar: {grammar_point} ({romaji})

## Ý nghĩa (Meaning)
*   **English**: {english_meaning}
*   **Vietnamese**: {vi_meaning}

## Cấu trúc ngữ pháp (Conjugation / Rules)
```text
{connection or 'Chưa cập nhật'}
```
*   *Giải thích cấu trúc (VN)*: {vi_connection or 'Chưa cập nhật'}

## Ví dụ tham khảo (Example Sentences)
"""
            for idx, ex in enumerate(examples):
                vi_ex = await translate_text(ex['english'])
                md_content += f"\n{idx+1}. **{ex['japanese']}**\n   * English: {ex['english']}\n   * Tiếng Việt: {vi_ex}\n"
                
                # Import examples into example_sentences table
                ex_emb = await embed_text(ex['japanese'])
                ex_record = {
                    "japanese": ex['japanese'],
                    "english": f"{ex['english']} | {vi_ex}",
                    "source": "JLPT Sensei Scraper",
                    "jlpt_level": level,
                }
                if ex_emb:
                    ex_record["embedding"] = ex_emb
                try:
                    supabase.table("example_sentences").upsert(ex_record, on_conflict="japanese").execute()
                except Exception:
                    pass

            # Save Markdown file to workspace
            safe_title = re.sub(r'[\\/*?:"<>|]', "", grammar_point).replace(" ", "_")
            safe_title = safe_title[:100] # Truncate to prevent OS errors
            filepath = f"data/grammar_docs/{level.lower()}_{safe_title}.md"
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(md_content)
            print(f"  ✓ Saved Markdown document to {filepath}")
            
            # Embed grammar file and insert into document_embeddings
            doc_emb = await embed_text(md_content)
            doc_record = {
                "content": md_content,
                "metadata": {
                    "level": level,
                    "tags": ["grammar", level.lower()],
                    "title": grammar_point,
                    "romaji": romaji
                }
            }
            if doc_emb:
                # Add doc embedding. Check the embedding length, pgvector is 1024 or 3072 depending on migrations
                doc_record["embedding"] = doc_emb
            try:
                supabase.table("document_embeddings").upsert(doc_record, on_conflict="id").execute()
            except Exception as ex:
                print(f"  [Warning] Failed to insert document embedding: {ex}")
                
            # Upsert into learning_graph_nodes
            node_key = f"{level.lower()}_grammar_{safe_title}"
            node_record = {
                "node_key": node_key,
                "node_type": "grammar",
                "jlpt_level": level,
                "title": grammar_point,
                "description": vi_meaning,
                "estimated_time": "~15 min",
                "topics_json": [romaji, "grammar"]
            }
            try:
                supabase.table("learning_graph_nodes").upsert(node_record, on_conflict="node_key").execute()
            except Exception as ex:
                print(f"  [Warning] Failed to upsert learning node: {ex}")

            count += 1
            await asyncio.sleep(2) # Friendly delay
            
        print(f"\n✅ Finished crawling {count} grammar points for {level}!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--level", default="N5", help="JLPT Level (N5, N4, N3, N2, N1)")
    parser.add_argument("--all", action="store_true", help="Crawl all levels")
    args = parser.parse_args()
    
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables must be set.")
        exit(1)
        
    if args.all:
        for lvl in ["N5", "N4", "N3", "N2", "N1"]:
            asyncio.run(crawl_level(lvl))
    else:
        asyncio.run(crawl_level(args.level.upper()))
