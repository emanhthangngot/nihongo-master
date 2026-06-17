"""
lesson_builder.py — Seed lesson_units and lesson_sections for JLPT N5-N1.
Usage:
  python crawler/lesson_builder.py
"""
import os
import asyncio
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Define Units for N5 to N1
UNITS_DATA = [
    # N5 (Minna no Nihongo Book I: Lessons 1-25)
    {"jlpt_level": "N5", "unit_order": 1, "title_vi": "Đơn vị 1: Nhập môn & Chào hỏi", "description_vi": "Học bảng chữ cái Hiragana, Katakana, cách giới thiệu bản thân và chào hỏi cơ bản (Bài 1 - 5)"},
    {"jlpt_level": "N5", "unit_order": 2, "title_vi": "Đơn vị 2: Đời sống hàng ngày", "description_vi": "Học cách hỏi thời gian, đếm đồ vật, mua sắm và các hành động thường nhật (Bài 6 - 10)"},
    {"jlpt_level": "N5", "unit_order": 3, "title_vi": "Đơn vị 3: Di chuyển & Phương hướng", "description_vi": "Học cách chỉ đường, phương tiện đi lại, các trạng thái ở và tồn tại (Bài 11 - 15)"},
    {"jlpt_level": "N5", "unit_order": 4, "title_vi": "Đơn vị 4: Cho nhận & Hành động ngắn", "description_vi": "Học cách nói về hành động cho, nhận và cách kết nối các câu đơn giản (Bài 16 - 20)"},
    {"jlpt_level": "N5", "unit_order": 5, "title_vi": "Đơn vị 5: Thể Ta/Nai & Trải nghiệm", "description_vi": "Học cách chia thể ngắn, nói về dự định, kinh nghiệm và xin phép làm gì (Bài 21 - 25)"},
    
    # N4 (Minna no Nihongo Book II: Lessons 26-50)
    {"jlpt_level": "N4", "unit_order": 1, "title_vi": "Đơn vị 6: Khả năng & Thể ý chí", "description_vi": "Học cách nói về khả năng, ý định, lời khuyên và dự đoán tương lai (Bài 26 - 30)"},
    {"jlpt_level": "N4", "unit_order": 2, "title_vi": "Đơn vị 7: Thể bị động & Sử dịch", "description_vi": "Học về thể bị động, sai khiến, bị động sai khiến và cách truyền đạt thông tin (Bài 31 - 35)"},
    {"jlpt_level": "N4", "unit_order": 3, "title_vi": "Đơn vị 8: Tôn kính ngữ & Khiêm nhường ngữ", "description_vi": "Học kính ngữ cơ bản trong giao tiếp công việc và trang trọng (Bài 36 - 40)"},
    {"jlpt_level": "N4", "unit_order": 4, "title_vi": "Đơn vị 9: Điều kiện & Giả định", "description_vi": "So sánh cách dùng conditional (ba, tara, to, nara) và cách nói phỏng đoán (Bài 41 - 45)"},
    {"jlpt_level": "N4", "unit_order": 5, "title_vi": "Đơn vị 10: Hoàn thành & Trạng thái phức hợp", "description_vi": "Học về sự hoàn thành hành động (te shimau) và các mẫu bổ trợ trạng thái (Bài 46 - 50)"},
    
    # N3 (Trung cấp)
    {"jlpt_level": "N3", "unit_order": 1, "title_vi": "Đơn vị 11: Ngữ pháp Giao tiếp Trung cấp", "description_vi": "Các mẫu ngữ pháp liên kết mệnh đề và cách nói ý kiến cá nhân trong đời sống"},
    {"jlpt_level": "N3", "unit_order": 2, "title_vi": "Đơn vị 12: Đọc hiểu & Viết thư tín", "description_vi": "Học cách đọc thông báo, email công việc và các cấu trúc giải thích nguyên nhân phức tạp"},
    
    # N2 (Thượng trung cấp)
    {"jlpt_level": "N2", "unit_order": 1, "title_vi": "Đơn vị 13: Văn viết & Xã luận báo chí", "description_vi": "Học các cấu trúc ngữ pháp trang trọng, xuất hiện nhiều trong văn bản chính luận"},
    
    # N1 (Cao cấp)
    {"jlpt_level": "N1", "unit_order": 1, "title_vi": "Đơn vị 14: Cao cấp & Học thuật", "description_vi": "Các cấu trúc ngữ pháp cổ, trang trọng bậc nhất và các bài luận học thuật phức tạp"}
]

async def build_curriculum():
    print("🚀 Seeding Lesson Units...")
    
    units = []
    for u in UNITS_DATA:
        units.append(u)
        
    try:
        # Seed units
        supabase.table("lesson_units").upsert(units, on_conflict="jlpt_level,unit_order").execute()
        print("  ✓ Seeded lesson units")
    except Exception as e:
        print(f"  ❌ Error seeding units: {e}")
        return
        
    # Fetch units to get IDs
    try:
        res = supabase.table("lesson_units").select("id, jlpt_level, unit_order").execute()
        units_db = res.data or []
    except Exception as e:
        print(f"  ❌ Error fetching units: {e}")
        return
        
    print("🚀 Seeding Lesson Sections...")
    sections = []
    for u in units_db:
        unit_id = u["id"]
        lvl = u["jlpt_level"]
        order = u["unit_order"]
        
        # For each unit, create 7 sections
        section_types = [
            ("vocab", "Từ vựng trọng tâm"),
            ("kanji", "Hán tự bài học"),
            ("grammar", "Ngữ pháp chi tiết"),
            ("reading", "Luyện đọc hiểu"),
            ("listening", "Luyện nghe hiểu"),
            ("practice", "Luyện tập & Quiz"),
            ("review", "Ôn tập Flashcard")
        ]
        
        for idx, (sec_type, title) in enumerate(section_types):
            sections.append({
                "unit_id": unit_id,
                "section_order": idx + 1,
                "section_type": sec_type,
                "title_vi": f"{title} (Đơn vị {order} - {lvl})",
                "content_md": f"## {title}\nNội dung chi tiết của phần học này đang được chuẩn bị. Bạn có thể sử dụng các công cụ RAG hoặc AI Tutor để tìm hiểu thêm."
            })
            
    # Batch upsert sections
    batch_size = 50
    for i in range(0, len(sections), batch_size):
        batch = sections[i:i+batch_size]
        try:
            supabase.table("lesson_sections").upsert(batch, on_conflict="unit_id,section_order").execute()
            print(f"  ✓ Seeded {min(i+batch_size, len(sections))}/{len(sections)} sections")
        except Exception as e:
            # Fallback if constraint on unit_id,section_order doesn't exist
            try:
                supabase.table("lesson_sections").upsert(batch, on_conflict="id").execute()
                print(f"  ✓ Seeded {min(i+batch_size, len(sections))}/{len(sections)} sections (fallback)")
            except Exception as ex:
                print(f"  ❌ Error seeding sections batch: {ex}")
                
    print("✅ Lesson Builder Complete!")

if __name__ == "__main__":
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env")
    else:
        asyncio.run(build_curriculum())
