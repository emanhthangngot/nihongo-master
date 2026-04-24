"""
Import Tatoeba example sentences (sentences.csv + links.csv).
Usage: python tatoeba_parser.py --jpn jpn_sentences.tsv --eng eng_sentences.tsv
"""
import csv, asyncio, os, asyncpg, argparse
from dotenv import load_dotenv

load_dotenv()

async def import_sentences(jpn_file: str, eng_file: str, limit: int):
    conn = await asyncpg.connect(os.environ["DATABASE_URL"])

    jpn = {}
    with open(jpn_file, encoding="utf-8") as f:
        for row in csv.reader(f, delimiter="\t"):
            if len(row) >= 3:
                jpn[row[0]] = row[2]

    count = 0
    with open(eng_file, encoding="utf-8") as f:
        for row in csv.reader(f, delimiter="\t"):
            if count >= limit or len(row) < 3:
                break
            # For demo: pair consecutive IDs (real app uses links.csv)
            sid = str(int(row[0]) - 1)
            if sid in jpn:
                await conn.execute(
                    "insert into example_sentences (japanese, english, source) values ($1,$2,$3) on conflict do nothing",
                    jpn[sid], row[2], "tatoeba"
                )
                count += 1

    await conn.close()
    print(f"✅ Imported {count} sentence pairs")

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--jpn",   default="jpn_sentences.tsv")
    p.add_argument("--eng",   default="eng_sentences.tsv")
    p.add_argument("--limit", type=int, default=100000)
    args = p.parse_args()
    asyncio.run(import_sentences(args.jpn, args.eng, args.limit))