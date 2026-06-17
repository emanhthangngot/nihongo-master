"""
kana_loader.py — Seed Hiragana & Katakana entries into public.kana_entries.
Usage:
  python crawler/kana_loader.py
"""
import os
import asyncio
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Definition of Gojūon (base hiragana & katakana)
HIRAGANA_DATA = [
    # a-row
    ("あ", "a", "a", "a"), ("い", "i", "a", "i"), ("う", "u", "a", "u"), ("え", "e", "a", "e"), ("お", "o", "a", "o"),
    # ka-row
    ("か", "ka", "ka", "a"), ("き", "ki", "ka", "i"), ("く", "ku", "ka", "u"), ("け", "ke", "ka", "e"), ("こ", "ko", "ka", "o"),
    # sa-row
    ("さ", "sa", "sa", "a"), ("し", "shi", "sa", "i"), ("す", "su", "sa", "u"), ("せ", "se", "sa", "e"), ("そ", "so", "sa", "o"),
    # ta-row
    ("た", "ta", "ta", "a"), ("ち", "chi", "ta", "i"), ("つ", "tsu", "ta", "u"), ("て", "te", "ta", "e"), ("と", "to", "ta", "o"),
    # na-row
    ("な", "na", "na", "a"), ("に", "ni", "na", "i"), ("ぬ", "nu", "na", "u"), ("ね", "ne", "na", "e"), ("の", "no", "na", "o"),
    # ha-row
    ("は", "ha", "ha", "a"), ("ひ", "hi", "ha", "i"), ("ふ", "fu", "ha", "u"), ("へ", "he", "ha", "e"), ("ほ", "ho", "ha", "o"),
    # ma-row
    ("ま", "ma", "ma", "a"), ("み", "mi", "ma", "i"), ("む", "mu", "ma", "u"), ("め", "me", "ma", "e"), ("も", "mo", "ma", "o"),
    # ya-row
    ("や", "ya", "ya", "a"), ("ゆ", "yu", "ya", "u"), ("よ", "yo", "ya", "o"),
    # ra-row
    ("ら", "ra", "ra", "a"), ("り", "ri", "ra", "i"), ("る", "ru", "ra", "u"), ("れ", "re", "ra", "e"), ("ろ", "ro", "ra", "o"),
    # wa-row
    ("わ", "wa", "wa", "a"), ("を", "wo", "wa", "o"),
    # n-row
    ("ん", "n", "n", "")
]

KATAKANA_DATA = [
    # a-row
    ("ア", "a", "a", "a"), ("イ", "i", "a", "i"), ("ウ", "u", "a", "u"), ("エ", "e", "a", "e"), ("オ", "o", "a", "o"),
    # ka-row
    ("カ", "ka", "ka", "a"), ("キ", "ki", "ka", "i"), ("ク", "ku", "ka", "u"), ("ケ", "ke", "ka", "e"), ("コ", "ko", "ka", "o"),
    # sa-row
    ("サ", "sa", "sa", "a"), ("シ", "shi", "sa", "i"), ("ス", "su", "sa", "u"), ("セ", "se", "sa", "e"), ("ソ", "so", "sa", "o"),
    # ta-row
    ("タ", "ta", "ta", "a"), ("チ", "chi", "ta", "i"), ("ツ", "tsu", "ta", "u"), ("テ", "te", "ta", "e"), ("ト", "to", "ta", "o"),
    # na-row
    ("ナ", "na", "na", "a"), ("ニ", "ni", "na", "i"), ("ヌ", "nu", "na", "u"), ("ネ", "ne", "na", "e"), ("ノ", "no", "na", "o"),
    # ha-row
    ("ハ", "ha", "ha", "a"), ("ヒ", "hi", "ha", "i"), ("フ", "fu", "ha", "u"), ("ヘ", "he", "ha", "e"), ("ホ", "ho", "ha", "o"),
    # ma-row
    ("マ", "ma", "ma", "a"), ("ミ", "mi", "ma", "i"), ("ム", "mu", "ma", "u"), ("メ", "me", "ma", "e"), ("モ", "mo", "ma", "o"),
    # ya-row
    ("ヤ", "ya", "ya", "a"), ("ユ", "yu", "ya", "u"), ("ヨ", "yo", "ya", "o"),
    # ra-row
    ("ラ", "ra", "ra", "a"), ("リ", "ri", "ra", "i"), ("ル", "ru", "ra", "u"), ("レ", "re", "ra", "e"), ("ロ", "ro", "ra", "o"),
    # wa-row
    ("ワ", "wa", "wa", "a"), ("ヲ", "wo", "wa", "o"),
    # n-row
    ("ン", "n", "n", "")
]

# Dakuten & Handakuten
DAKUTEN_HIRAGANA = [
    ("が", "ga", "ka", "a"), ("ぎ", "gi", "ka", "i"), ("ぐ", "gu", "ka", "u"), ("げ", "ge", "ka", "e"), ("ご", "go", "ka", "o"),
    ("ざ", "za", "sa", "a"), ("じ", "ji", "sa", "i"), ("ず", "zu", "sa", "u"), ("ぜ", "ze", "sa", "e"), ("ぞ", "zo", "sa", "o"),
    ("だ", "da", "ta", "a"), ("ぢ", "ji", "ta", "i"), ("づ", "zu", "ta", "u"), ("で", "de", "ta", "e"), ("ど", "do", "ta", "o"),
    ("ば", "ba", "ha", "a"), ("び", "bi", "ha", "i"), ("ぶ", "bu", "ha", "u"), ("べ", "be", "ha", "e"), ("ぼ", "bo", "ha", "o"),
    ("ぱ", "pa", "ha", "a"), ("ぴ", "pi", "ha", "i"), ("ぷ", "pu", "ha", "u"), ("ぺ", "pe", "ha", "e"), ("ぽ", "po", "ha", "o")
]

DAKUTEN_KATAKANA = [
    ("ガ", "ga", "ka", "a"), ("ギ", "gi", "ka", "i"), ("グ", "gu", "ka", "u"), ("ゲ", "ge", "ka", "e"), ("ゴ", "go", "ka", "o"),
    ("ザ", "za", "sa", "a"), ("ジ", "ji", "sa", "i"), ("ズ", "zu", "sa", "u"), ("ゼ", "ze", "sa", "e"), ("ゾ", "zo", "sa", "o"),
    ("ダ", "da", "ta", "a"), ("ヂ", "ji", "ta", "i"), ("ズ", "zu", "ta", "u"), ("デ", "de", "ta", "e"), ("ド", "do", "ta", "o"),
    ("バ", "ba", "ha", "a"), ("ビ", "bi", "ha", "i"), ("ブ", "bu", "ha", "u"), ("ベ", "be", "ha", "e"), ("ボ", "bo", "ha", "o"),
    ("パ", "pa", "ha", "a"), ("ピ", "pi", "ha", "i"), ("プ", "pu", "ha", "u"), ("ペ", "pe", "ha", "e"), ("ポ", "po", "ha", "o")
]

async def seed():
    print("🚀 Seeding Kana entries...")
    records = []
    
    # 1. Base Hiragana
    for kana, romaji, row, col in HIRAGANA_DATA:
        records.append({
            "kana": kana,
            "kana_type": "hiragana",
            "romaji": romaji,
            "row_group": row,
            "column_vowel": col,
            "audio_url": f"https://assets.nihongomaster.com/audio/kana/{romaji}.mp3"
        })
        
    # 2. Base Katakana
    for kana, romaji, row, col in KATAKANA_DATA:
        records.append({
            "kana": kana,
            "kana_type": "katakana",
            "romaji": romaji,
            "row_group": row,
            "column_vowel": col,
            "audio_url": f"https://assets.nihongomaster.com/audio/kana/{romaji}.mp3"
        })

    # 3. Dakuten/Handakuten Hiragana
    for kana, romaji, row, col in DAKUTEN_HIRAGANA:
        records.append({
            "kana": kana,
            "kana_type": "hiragana",
            "romaji": romaji,
            "row_group": row,
            "column_vowel": col,
            "audio_url": f"https://assets.nihongomaster.com/audio/kana/{romaji}.mp3"
        })

    # 4. Dakuten/Handakuten Katakana
    for kana, romaji, row, col in DAKUTEN_KATAKANA:
        records.append({
            "kana": kana,
            "kana_type": "katakana",
            "romaji": romaji,
            "row_group": row,
            "column_vowel": col,
            "audio_url": f"https://assets.nihongomaster.com/audio/kana/{romaji}.mp3"
        })

    # Batch upsert
    batch_size = 100
    for i in range(0, len(records), batch_size):
        batch = records[i:i+batch_size]
        try:
            supabase.table("kana_entries").upsert(batch, on_conflict="kana").execute()
            print(f"  ✓ Seeded {min(i+batch_size, len(records))}/{len(records)} kana")
        except Exception as e:
            print(f"  ❌ Error upserting kana batch: {e}")
            
    print("✅ Kana Seeding Complete!")

if __name__ == "__main__":
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env")
    else:
        asyncio.run(seed())
