"""
practice_seed_loader.py — Seed the practice bank (practice_questions & practice_question_options) with textbook-grade content.
Usage:
  python crawler/practice_seed_loader.py
"""
import os
import asyncio
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Define seed questions with options
QUESTIONS_DATA = [
    # N5 Vocab Meaning
    {
        "question": {
            "question_type": "vocab_meaning",
            "jlpt_level": "N5",
            "skill_type": "vocabulary",
            "prompt": "Từ vựng 「勉強」（べんきょう） có nghĩa là gì?",
            "prompt_vi": "Hãy chọn nghĩa đúng cho từ vựng này.",
            "correct_answer": "Học tập",
            "explanation_vi": "「勉強」（べんきょう） có nghĩa là học tập. Ví dụ: 日本語を勉強します (Tôi học tiếng Nhật).",
            "difficulty": 1,
            "source_type": "textbook_like",
            "review_status": "verified"
        },
        "options": [
            {"option_label": "A", "option_text": "Học tập", "is_correct": True, "explanation_vi": "Đúng! 勉強 nghĩa là học tập."},
            {"option_label": "B", "option_text": "Làm việc", "is_correct": False, "explanation_vi": "Sai, làm việc là 仕事 (しごと) hoặc 働く (はたらく)."},
            {"option_label": "C", "option_text": "Nghỉ ngơi", "is_correct": False, "explanation_vi": "Sai, nghỉ ngơi là 休み (やすみ)."},
            {"option_label": "D", "option_text": "Du lịch", "is_correct": False, "explanation_vi": "Sai, du lịch là 旅行 (りょこう)."}
        ]
    },
    # N5 Vocab Reading
    {
        "question": {
            "question_type": "vocab_reading",
            "jlpt_level": "N5",
            "skill_type": "vocabulary",
            "prompt": "Từ vựng 「学校」 đọc là gì?",
            "prompt_vi": "Hãy chọn cách đọc đúng (Hiragana).",
            "correct_answer": "がっこう",
            "explanation_vi": "「学校」 (Học Hiệu) nghĩa là trường học, đọc là がっこう (gakkou) với âm ngắt っ.",
            "difficulty": 1,
            "source_type": "textbook_like",
            "review_status": "verified"
        },
        "options": [
            {"option_label": "A", "option_text": "がこう", "is_correct": False, "explanation_vi": "Sai, thiếu âm ngắt."},
            {"option_label": "B", "option_text": "がっこう", "is_correct": True, "explanation_vi": "Chính xác! Đọc là がっこう."},
            {"option_label": "C", "option_text": "がくこう", "is_correct": False, "explanation_vi": "Sai, chữ 学 biến âm ngắt đứng trước 校."},
            {"option_label": "D", "option_text": "かっこう", "is_correct": False, "explanation_vi": "Sai phụ âm đầu."}
        ]
    },
    # N5 Kanji Meaning
    {
        "question": {
            "question_type": "kanji_meaning",
            "jlpt_level": "N5",
            "skill_type": "kanji",
            "prompt": "Chữ Hán 「水」 (âm Hán Việt: THỦY) có nghĩa là gì?",
            "correct_answer": "Nước",
            "explanation_vi": "Chữ 「水」 (Thủy) nghĩa là nước, đọc Onyomi là スイ (sui) và Kunyomi là みず (mizu).",
            "difficulty": 1,
            "source_type": "textbook_like",
            "review_status": "verified"
        },
        "options": [
            {"option_label": "A", "option_text": "Lửa", "is_correct": False, "explanation_vi": "Sai, lửa là 火 (Hỏa)."},
            {"option_label": "B", "option_text": "Nước", "is_correct": True, "explanation_vi": "Đúng! THỦY nghĩa là nước."},
            {"option_label": "C", "option_text": "Đất", "is_correct": False, "explanation_vi": "Sai, đất là 土 (Thổ)."},
            {"option_label": "D", "option_text": "Vàng", "is_correct": False, "explanation_vi": "Sai, vàng/tiền là 金 (Kim)."}
        ]
    },
    # N5 Particle Choice
    {
        "question": {
            "question_type": "particle_choice",
            "jlpt_level": "N5",
            "skill_type": "grammar",
            "prompt": "私は学校＿＿行きます。",
            "prompt_vi": "Tôi đi đến trường học.",
            "correct_answer": "に",
            "explanation_vi": "Với các động từ di chuyển chỉ hướng đích như 行く (đi), 来る (đến), 帰る (về), địa điểm hướng tới đi kèm với trợ từ 「に」 hoặc 「へ」.",
            "difficulty": 1,
            "source_type": "textbook_like",
            "review_status": "verified"
        },
        "options": [
            {"option_label": "A", "option_text": "に", "is_correct": True, "explanation_vi": "Chính xác! Trợ từ 「に」 chỉ hướng đích di chuyển."},
            {"option_label": "B", "option_text": "で", "is_correct": False, "explanation_vi": "Sai, 「で」 chỉ nơi xảy ra hành động, không dùng cho đích đến di chuyển."},
            {"option_label": "C", "option_text": "を", "is_correct": False, "explanation_vi": "Sai, 「を」 chỉ đối tượng tác động trực tiếp của ngoại động từ."},
            {"option_label": "D", "option_text": "が", "is_correct": False, "explanation_vi": "Sai, 「が」 chỉ chủ ngữ."}
        ]
    },
    # N5 Grammar Fill Blank
    {
        "question": {
            "question_type": "grammar_fill_blank",
            "jlpt_level": "N5",
            "skill_type": "grammar",
            "prompt": "日本語を勉強し＿＿＿＿、音楽を聞きます。",
            "prompt_vi": "Tôi vừa học tiếng Nhật vừa nghe nhạc.",
            "correct_answer": "ながら",
            "explanation_vi": "Cấu trúc 「Vます + ながら」 diễn tả hai hành động xảy ra đồng thời cùng một lúc (vừa... vừa...). Bỏ ます của 勉強します -> 勉強し + ながら.",
            "difficulty": 1,
            "source_type": "textbook_like",
            "review_status": "verified"
        },
        "options": [
            {"option_label": "A", "option_text": "ながら", "is_correct": True, "explanation_vi": "Đúng! Cấu trúc đồng thời: V-ます + ながら."},
            {"option_label": "B", "option_text": "から", "is_correct": False, "explanation_vi": "Sai, 「から」 chỉ nguyên nhân hoặc từ mốc thời gian/không gian."},
            {"option_label": "C", "option_text": "ので", "is_correct": False, "explanation_vi": "Sai, 「ので」 dùng chỉ nguyên nhân khách quan."},
            {"option_label": "D", "option_text": "ため", "is_correct": False, "explanation_vi": "Sai, 「ため」 chỉ mục đích hoặc nguyên nhân dùng ở trung cao cấp."}
        ]
    },
    # N4 Conjugation Quiz
    {
        "question": {
            "question_type": "conjugation",
            "jlpt_level": "N4",
            "skill_type": "grammar",
            "prompt": "Động từ 「食べる」（nhóm 2） chia sang thể khả năng (potential form) sẽ là gì?",
            "correct_answer": "食べられる",
            "explanation_vi": "Với động từ nhóm 2 (Ichidan), để chia sang thể khả năng, ta bỏ đuôi る và thêm られる. 食べる -> 食べられる (có thể ăn).",
            "difficulty": 1,
            "source_type": "textbook_like",
            "review_status": "verified"
        },
        "options": [
            {"option_label": "A", "option_text": "食べれる", "is_correct": False, "explanation_vi": "Sai, đây là dạng rút gọn khẩu ngữ (sa-nuki), không chuẩn ngữ pháp chính thống."},
            {"option_label": "B", "option_text": "食べられる", "is_correct": True, "explanation_vi": "Chính xác! Quy tắc chuẩn nhóm 2: bỏ る + られる."},
            {"option_label": "C", "option_text": "食べさせる", "is_correct": False, "explanation_vi": "Sai, đây là thể sai khiến (causative)."},
            {"option_label": "D", "option_text": "食べられるせる", "is_correct": False, "explanation_vi": "Sai cấu trúc chia."}
        ]
    },
    # N3 Grammar Comparison Fill
    {
        "question": {
            "question_type": "grammar_comparison",
            "jlpt_level": "N3",
            "skill_type": "grammar",
            "prompt": "事故が＿＿＿＿、電車が遅れました。",
            "prompt_vi": "Vì xảy ra tai nạn nên tàu đã bị trễ. (Nguyên nhân khách quan khách sáo)",
            "correct_answer": "あったので",
            "explanation_vi": "「ので」 dùng để chỉ nguyên nhân, lý do khách quan mang sắc thái nhẹ nhàng, lịch sự. Thể thông thường + ので. Chữ あります chia thành あった + ので.",
            "difficulty": 2,
            "source_type": "textbook_like",
            "review_status": "verified"
        },
        "options": [
            {"option_label": "A", "option_text": "あったから", "is_correct": False, "explanation_vi": "Sai, 「から」 mang tính chủ quan của người nói, ít lịch sự bằng 「ので」 trong ngữ cảnh giải thích khách sáo."},
            {"option_label": "B", "option_text": "あったので", "is_correct": True, "explanation_vi": "Chính xác! Chỉ nguyên nhân khách quan phù hợp trễ tàu."},
            {"option_label": "C", "option_text": "あってから", "is_correct": False, "explanation_vi": "Sai, 「Vてから」 nghĩa là sau khi làm gì."},
            {"option_label": "D", "option_text": "あったのに", "is_correct": False, "explanation_vi": "Sai, 「のに」 diễn tả sự tương phản (mặc dù... nhưng...)."}
        ]
    }
]

async def seed_questions():
    print("🚀 Seeding Practice Bank...")
    
    for q_data in QUESTIONS_DATA:
        q_info = q_data["question"]
        options = q_data["options"]
        
        print(f"  Inserting Question: {q_info['prompt']}")
        
        try:
            # Insert question
            res = supabase.table("practice_questions").insert(q_info).execute()
            if not res.data:
                print("  ❌ Failed to insert question")
                continue
                
            q_id = res.data[0]["id"]
            
            # Prepare options
            opt_records = []
            for opt in options:
                opt_records.append({
                    "question_id": q_id,
                    "option_label": opt["option_label"],
                    "option_text": opt["option_text"],
                    "is_correct": opt["is_correct"],
                    "explanation_vi": opt["explanation_vi"]
                })
                
            # Insert options
            supabase.table("practice_question_options").insert(opt_records).execute()
            print(f"    ✓ Inserted options for question ID: {q_id}")
            
        except Exception as e:
            print(f"  ❌ Error seeding question: {e}")
            
    print("✅ Practice Bank Seeding Complete!")

if __name__ == "__main__":
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env")
    else:
        asyncio.run(seed_questions())
