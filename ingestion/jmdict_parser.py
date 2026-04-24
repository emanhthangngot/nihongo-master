"""
Parse JMDict XML → insert into Supabase dictionary_entries + queue embeddings.
Usage: python jmdict_parser.py --file JMdict_e.gz --limit 10000
"""
import gzip, xml.etree.ElementTree as ET, argparse, asyncio
import asyncpg, os
from dotenv import load_dotenv

load_dotenv()

async def parse_and_insert(filepath: str, limit: int):
    conn = await asyncpg.connect(os.environ["DATABASE_URL"])
    count = 0

    open_fn = gzip.open if filepath.endswith(".gz") else open
    with open_fn(filepath, "rb") as f:
        tree = ET.iterparse(f, events=("end",))
        for event, elem in tree:
            if elem.tag != "entry" or count >= limit:
                break

            # Extract word
            keb = elem.findtext("k_ele/keb") or elem.findtext("r_ele/reb", "")
            reb = elem.findtext("r_ele/reb", "")
            meanings = [g.text for g in elem.findall(".//gloss") if g.text]
            pos_el = elem.find(".//pos")
            pos = pos_el.text.strip("<>") if pos_el is not None and pos_el.text else "unknown"

            # JLPT mapping (simplified; use jlpt-vocab-lists for accuracy)
            jlpt = None
            misc = elem.findtext(".//misc", "")
            if "nf" in misc:
                jlpt = "N5"

            if keb and meanings:
                await conn.execute(
                    """insert into dictionary_entries (word, reading, romaji, meanings, pos, jlpt_level)
                       values ($1,$2,$3,$4,$5,$6) on conflict do nothing""",
                    keb, reb, "", meanings[:5], pos, jlpt
                )
                count += 1
            elem.clear()

    await conn.close()
    print(f"✅ Inserted {count} entries")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--file",  default="JMdict_e.gz")
    parser.add_argument("--limit", type=int, default=50000)
    args = parser.parse_args()
    asyncio.run(parse_and_insert(args.file, args.limit))