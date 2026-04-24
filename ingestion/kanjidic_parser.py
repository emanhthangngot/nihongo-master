"""
kanjidic_parser.py — Parse Kanjidic2 XML → Supabase kanji_entries with pgvector embeddings.

Usage:
  python kanjidic_parser.py --xml data/kanjidic2.xml --ai-url http://localhost:8000
"""
import argparse
import json
import xml.etree.ElementTree as ET
from dataclasses import dataclass, field

import requests
from supabase import create_client
import os

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

# Kanjidic2 uses old JLPT numbering (4=N5, 3=N4, 2=N3, 1=N2)
JLPT_MAP = {"4": "N5", "3": "N4", "2": "N3", "1": "N2"}


@dataclass
class KanjiEntry:
    kanji: str
    on_readings: list[str] = field(default_factory=list)
    kun_readings: list[str] = field(default_factory=list)
    meanings: list[str] = field(default_factory=list)
    stroke_count: int = 0
    jlpt_level: str | None = None
    grade: int | None = None


def parse_kanjidic(xml_path: str, jlpt_only: bool = True) -> list[KanjiEntry]:
    tree = ET.parse(xml_path)
    root = tree.getroot()
    entries: list[KanjiEntry] = []

    for char in root.findall("character"):
        literal_el = char.find("literal")
        if literal_el is None:
            continue
        kanji = literal_el.text or ""

        misc = char.find("misc")
        stroke_el = misc.find("stroke_count") if misc else None
        jlpt_el   = misc.find("jlpt")         if misc else None
        grade_el  = misc.find("grade")         if misc else None

        jlpt = JLPT_MAP.get(jlpt_el.text, None) if jlpt_el is not None and jlpt_el.text else None
        if jlpt_only and jlpt is None:
            continue

        stroke_count = int(stroke_el.text) if stroke_el is not None and stroke_el.text else 0
        grade = int(grade_el.text) if grade_el is not None and grade_el.text else None

        rmgroup = char.find("reading_meaning/rmgroup")
        on_readings, kun_readings, meanings = [], [], []
        if rmgroup is not None:
            for r in rmgroup.findall("reading"):
                rtype = r.get("r_type", "")
                if rtype == "ja_on":
                    on_readings.append(r.text or "")
                elif rtype == "ja_kun":
                    kun_readings.append(r.text or "")
            meanings = [m.text for m in rmgroup.findall("meaning") if m.text and not m.get("m_lang")]

        entries.append(KanjiEntry(
            kanji=kanji,
            on_readings=on_readings,
            kun_readings=kun_readings,
            meanings=meanings[:5],
            stroke_count=stroke_count,
            jlpt_level=jlpt,
            grade=grade,
        ))

    return entries


def run_ingestion(xml_path: str, ai_service_url: str):
    print("Parsing Kanjidic2...")
    entries = parse_kanjidic(xml_path, jlpt_only=True)
    print(f"  → {len(entries)} JLPT kanji entries")

    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    batch_size = 64
    for i in range(0, len(entries), batch_size):
        batch = entries[i : i + batch_size]
        texts = [
            f"passage: {e.kanji} {' '.join(e.on_readings)} {' '.join(e.kun_readings)} {' '.join(e.meanings)}"
            for e in batch
        ]

        resp = requests.post(f"{ai_service_url}/embed/batch", json=texts, timeout=120)
        resp.raise_for_status()
        data = resp.json()
        embeddings = data.get("embeddings", data) if isinstance(data, dict) else data

        records = [
            {
                "char":         e.kanji,
                "on_readings":  e.on_readings,
                "kun_readings": e.kun_readings,
                "meanings":     e.meanings,
                "stroke_count": e.stroke_count,
                "jlpt_level":   e.jlpt_level,
                "embedding":    emb,
            }
            for e, emb in zip(batch, embeddings)
        ]
        supabase.table("kanji_entries").upsert(records, on_conflict="char").execute()
        print(f"  Ingested {min(i + batch_size, len(entries))}/{len(entries)}")

    print("Kanjidic2 ingestion complete!")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--xml",     required=True, help="Path to kanjidic2.xml")
    parser.add_argument("--ai-url",  default="http://localhost:8000", dest="ai_url")
    parser.add_argument("--all",     action="store_true", help="Include non-JLPT kanji")
    args = parser.parse_args()
    run_ingestion(args.xml, args.ai_url)
