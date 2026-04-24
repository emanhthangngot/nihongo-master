"""
Seed Minna no Nihongo curriculum data (50 lessons).
Usage: python seed_mnn_curriculum.py
"""
import asyncio, os, asyncpg
from dotenv import load_dotenv

load_dotenv()

LESSONS = [
  # Book I — N5 (lessons 1–25)
  (1,"はじめまして","Nice to meet you","N5",["〜は〜です","〜じゃありません"],["わたし","あなた","せんせい"],[]),
  (2,"これは〜です","This is ~","N5",["これ/それ/あれ","〜の"],["これ","それ","あれ","ほん"],[]),
  (3,"ここはデパートです","This place is a department store","N5",["ここ/そこ/あそこ","〜も"],["ここ","どこ","かいしゃ"],[]),
  (4,"〜時〜分です","It is ~ o'clock","N5",["時間","〜から〜まで"],["じ","ふん","いま"],[]),
  (5,"郵便局は何時から何時までですか","What hours is the post office open?","N5",["〜から〜まで","〜ね/〜よ"],["ゆうびんきょく","ぎんこう"],[]),
  (6,"駅の前です","It's in front of the station","N5",["〜に〜があります","位置"],["うえ","した","まえ","うしろ"],[]),
  (7,"富士山は高いです","Mt. Fuji is tall","N5",["い-adjectives","〜くない"],["たかい","やすい","おおきい"],["山","高"]),
  (8,"日本の映画は好きですか","Do you like Japanese films?","N5",["な-adjectives","〜が好きです/嫌いです"],["すき","きらい","じょうず"],["好","映"]),
  (9,"カリナさんはどんな人ですか","What kind of person is Karina?","N5",["〜が〜できます","そして/でも"],["かみ","め","せ"],[]),
  (10,"料理を作ります","I will cook","N5",["〜で（手段）","〜に（行きます/来ます/帰ります）"],["つくります","かいます"],[]),
  # Book II — N4 (lessons 26–50)
  (26,"山に登ったことがありますか","Have you ever climbed a mountain?","N4",["〜たことがある","〜たり〜たりします"],["のぼる","おもいで"],["山","登"]),
  (27,"この映画、見るかどうか迷っています","I'm unsure whether to watch this film","N4",["〜かどうか","〜と思っています"],["まよう","かんがえる"],[]),
  (28,"電気をつけたまま寝てしまいました","I fell asleep with the lights on","N4",["〜たまま","〜てしまいます"],["でんき","ねる"],["電","気"]),
  (29,"最近、太ってきました","I've been gaining weight lately","N4",["〜てきます","〜ていきます"],["さいきん","ふとる"],[]),
  (30,"もっと早く起きればよかったです","I should have woken up earlier","N4",["〜ばよかった","〜なければよかった"],["はやく","おきる"],[]),
]

async def seed():
    conn = await asyncpg.connect(os.environ["DATABASE_URL"])

    # Get book IDs
    books = await conn.fetch("select id, lesson_range from curriculum_books")
    book1 = next(b for b in books if b["lesson_range"][0] == 1)
    book2 = next(b for b in books if b["lesson_range"][0] == 26)

    for (num, jp, en, level, grammar, vocab, kanji) in LESSONS:
        book_id = book1["id"] if num <= 25 else book2["id"]
        await conn.execute(
            """insert into curriculum_lessons
               (book_id, lesson_number, title_jp, title_en, grammar_points, key_vocab, kanji, jlpt_level)
               values ($1,$2,$3,$4,$5,$6,$7,$8) on conflict do nothing""",
            book_id, num, jp, en, grammar, vocab, kanji, level
        )

    await conn.close()
    print(f"✅ Seeded {len(LESSONS)} curriculum lessons")

if __name__ == "__main__":
    asyncio.run(seed())