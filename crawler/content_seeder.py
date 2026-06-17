"""
content_seeder.py — Seed advanced textbook-grade content tables (conjugation_rules, grammar_comparisons, vietnamese_learning_notes, content_sources).
Usage:
  python crawler/content_seeder.py
"""
import os
import asyncio
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# 1. Conjugation Rules
CONJUGATION_RULES = [
    {
        "rule_key": "godan_polite_masu",
        "verb_group": "group1_godan",
        "form_name": "Thể lịch sự (ます)",
        "jlpt_level": "N5",
        "explanation_vi": "Đổi đuôi hàng u (u, ku, su, tsu, nu, mu, ru, gu, bu) sang hàng i tương ứng rồi thêm ます.",
        "pattern": {"rule": "u -> i + ます", "example": "買う (kau) -> 買い (kai) + ます = 買います (kaimasu)"},
        "examples": [
            {"base": "行く", "conjugated": "行きます", "meaning": "đi"},
            {"base": "話す", "conjugated": "話します", "meaning": "nói chuyện"}
        ],
        "common_mistakes_vi": "Nhầm lẫn hàng biến âm, ví dụ: 待つ (matsu) đổi sang hàng i phải là 待ちます (machimasu) chứ không phải まつます."
    },
    {
        "rule_key": "ichidan_polite_masu",
        "verb_group": "group2_ichidan",
        "form_name": "Thể lịch sự (ます)",
        "jlpt_level": "N5",
        "explanation_vi": "Bỏ đuôi る trực tiếp rồi thêm ます.",
        "pattern": {"rule": "る -> ます", "example": "食べる (taberu) -> 食べ (tabe) + ます = 食べます (tabemasu)"},
        "examples": [
            {"base": "見る", "conjugated": "見ます", "meaning": "xem, nhìn"},
            {"base": "起きる", "conjugated": "起きます", "meaning": "thức dậy"}
        ],
        "common_mistakes_vi": "Nhầm lẫn một số động từ nhóm 1 đặc biệt có đuôi iru/eru nhưng chia như nhóm 1 (ví dụ: 帰る - kaeru -> 帰ります - kaerimasu chứ không phải かえます)."
    },
    {
        "rule_key": "te_form_basics",
        "verb_group": "all",
        "form_name": "Thể て (Liên kết/Yêu cầu)",
        "jlpt_level": "N5",
        "explanation_vi": "Dùng nối các câu hoặc yêu cầu lịch sự với ください. Nhóm 1 chia theo đuôi: う,つ,る -> って; む,ぶ,ぬ -> んで; く -> いて (Trừ 行く -> 行って); ぐ -> いで; す -> して. Nhóm 2: bỏ る + て. Nhóm 3: する -> して, 来る -> きて.",
        "pattern": {"rule": "Nhóm 1 đuôi đặc biệt | Nhóm 2 bỏ る+て"},
        "examples": [
            {"base": "会う", "conjugated": "会って", "meaning": "gặp"},
            {"base": "飲む", "conjugated": "飲んで", "meaning": "uống"},
            {"base": "寝る", "conjugated": "寝て", "meaning": "ngủ"}
        ],
        "common_mistakes_vi": "Quên biến âm ngắt hoặc âm đục (ví dụ: 呼ぶ - yobu chia thành よんで chứ không phải よて)."
    }
]

# 2. Grammar Comparisons
GRAMMAR_COMPARISONS = [
    {
        "title_vi": "Phân biệt trợ từ: は vs が",
        "jlpt_level": "N5",
        "summary_vi": "Trợ từ は (Wa) nhấn mạnh vào vị ngữ đứng sau, dùng để giới thiệu chủ đề. Trợ từ が (Ga) nhấn mạnh vào chủ ngữ đứng trước, dùng để chỉ đối tượng thực hiện hành động hoặc thông tin mới.",
        "comparison_table": {
            "ha": "Nhấn mạnh thông tin phía sau. Dùng cho chủ đề chung, sự thật hiển nhiên hoặc đối chiếu.",
            "ga": "Nhấn mạnh danh từ phía trước. Dùng cho câu mô tả hiện tượng, chủ ngữ phụ hoặc thông tin mới xuất hiện."
        },
        "examples": [
            {"sentence_jp": "私は学生です。", "sentence_vi": "Tôi là học sinh. (Nhấn mạnh vị trí học sinh, tôi là chủ đề)", "particle": "は"},
            {"sentence_jp": "私が学生 của lớp này です。", "sentence_vi": "Chính tôi là học sinh của lớp này. (Nhấn mạnh 'Tôi' chứ không phải ai khác)", "particle": "が"}
        ],
        "common_mistakes_vi": "Người Việt hay nhầm khi giới thiệu đồ vật/cảnh vật xung quanh, ví dụ mô tả 'Mưa đang rơi' bắt buộc phải dùng が (雨が降っている) chứ không dùng は."
    },
    {
        "title_vi": "Phân biệt chỉ lý do: から vs ので",
        "jlpt_level": "N4",
        "summary_vi": "から (Kara) chỉ nguyên nhân mang tính chủ quan, cá nhân của người nói (thường đi kèm mệnh lệnh, lời khuyên). ので (Node) chỉ nguyên nhân khách quan, mang tính lịch sự, khách sáo, tránh làm phiền người nghe.",
        "comparison_table": {
            "kara": "Chủ quan. Dùng tự nhiên trong văn nói, giao tiếp hàng ngày, hoặc khi đưa ra ý kiến cá nhân.",
            "node": "Khách quan. Dùng lịch sự khi xin phép, xin lỗi, giải thích lý do trễ giờ hoặc lý do công việc."
        },
        "examples": [
            {"sentence_jp": "危ないから, 近づかないでください。", "sentence_vi": "Vì nguy hiểm nên xin đừng lại gần. (Mệnh lệnh/Chủ quan -> dùng から)", "particle": "から"},
            {"sentence_jp": "風邪をひいたので, 今日はお休みします。", "sentence_vi": "Vì bị cảm nên hôm nay tôi xin phép nghỉ. (Lịch sự/Khách quan -> dùng ので)", "particle": "ので"}
        ],
        "common_mistakes_vi": "Khi xin lỗi sếp hoặc giáo viên, dùng から sẽ mang cảm giác bào chữa chủ quan, thiếu lịch sự. Bắt buộc phải dùng ので để tạo thiện cảm khách quan."
    }
]

# 3. Vietnamese Learning Notes
VIETNAMESE_NOTES = [
    {
        "related_type": "grammar",
        "note_type": "comparison",
        "title_vi": "Lỗi dịch nghĩa cứng nhắc của thể ～ている",
        "content_vi": "Học viên Việt Nam thường dịch cấu trúc V-ている là 'đang làm gì đó' theo lối dịch nghĩa tiếng Anh (V-ing). Tuy nhiên, trong tiếng Nhật, V-ている còn dùng để diễn tả trạng thái kết quả kéo dài của hành động. Ví dụ: 結婚している (đã kết hôn và đang trong trạng thái kết hôn), 知っている (biết - trạng thái đã nhận thức thông tin) chứ không phải 'đang kết hôn' hay 'đang biết'.",
        "examples": [
            {"jp": "私はハノiに住んでいます。", "vi": "Tôi đang sống ở Hà Nội. (Trạng thái cư trú lâu dài chứ không phải đang thực hiện hành động sống)"},
            {"jp": "彼は死んでいます。", "vi": "Anh ấy đã chết. (Trạng thái đã chết kéo dài, không phải 'đang chết')"}
        ]
    },
    {
        "related_type": "kanji",
        "note_type": "sino_vietnamese",
        "title_vi": "Lợi thế vượt trội của âm Hán-Việt khi học Kanji",
        "content_vi": "Người Việt Nam có lợi thế cực lớn khi học Kanji nhờ sự tương đồng giữa âm Hán-Việt và âm Onyomi (âm Trung Quốc) của tiếng Nhật. Có đến hơn 70% từ ghép Onyomi có phát âm và ý nghĩa tương đương từ Hán-Việt. Ví dụ: 準備 (Chuẩn bị) đọc là じゅんび (Junbi), 電話 (Điện thoại) đọc là でんわ (Denwa), 家族 (Gia tộc) đọc là かぞく (Kazoku). Tận dụng điều này giúp bạn đoán nghĩa và cách đọc của từ mới cực nhanh.",
        "examples": [
            {"jp": "注意 (Chú ý)", "vi": "Đọc là ちゅうい (Chu-i)"},
            {"jp": "国家 (Quốc gia)", "vi": "Đọc là こっか (Kokka)"}
        ]
    }
]

# 4. Content Sources
CONTENT_SOURCES = [
    {"source_name": "JMDict Dictionary Project", "source_url": "https://www.edrdg.org/jmdict/jmdichtml.html", "source_type": "github_dataset", "license": "Creative Commons Attribution-ShareAlike", "attribution_required": True, "notes": "Cơ sở dữ liệu từ điển Nhật - Anh cốt lõi của ứng dụng."},
    {"source_name": "Kanjidic2 Project", "source_url": "https://www.edrdg.org/wiki/index.php/KANJIDIC_Project", "source_type": "github_dataset", "license": "Creative Commons Attribution-ShareAlike", "attribution_required": True, "notes": "Cơ sở dữ liệu Hán tự với số nét, âm đọc và nghĩa."},
    {"source_name": "Tatoeba Sentence Corpus", "source_url": "https://tatoeba.org/", "source_type": "public_domain", "license": "Creative Commons Attribution 2.0 France", "attribution_required": True, "notes": "Cơ sở dữ liệu câu ví dụ đa ngôn ngữ."},
    {"source_name": "JLPT Sensei Grammar Reference", "source_url": "https://jlptsensei.com/", "source_type": "website", "license": "Public reference/Educational", "attribution_required": False, "notes": "Nguồn cào cấu trúc ngữ pháp và câu ví dụ tham khảo."}
]

async def seed_content():
    print("🚀 Seeding Advanced Textbook Content...")
    
    # 1. Content Sources
    try:
        supabase.table("content_sources").upsert(CONTENT_SOURCES, on_conflict="source_name").execute()
        print("  ✓ Seeded content sources")
    except Exception as e:
        print(f"  ❌ Error seeding sources: {e}")
        
    # 2. Conjugation Rules
    try:
        supabase.table("conjugation_rules").upsert(CONJUGATION_RULES, on_conflict="rule_key").execute()
        print("  ✓ Seeded conjugation rules")
    except Exception as e:
        print(f"  ❌ Error seeding conjugation rules: {e}")
        
    # 3. Grammar Comparisons
    try:
        supabase.table("grammar_comparisons").upsert(GRAMMAR_COMPARISONS, on_conflict="title_vi").execute()
        print("  ✓ Seeded grammar comparisons")
    except Exception as e:
        print(f"  ❌ Error seeding comparisons: {e}")
        
    # 4. Vietnamese Learning Notes
    try:
        supabase.table("vietnamese_learning_notes").upsert(VIETNAMESE_NOTES, on_conflict="title_vi").execute()
        print("  ✓ Seeded Vietnamese learning notes")
    except Exception as e:
        # Fallback if constraint on title_vi doesn't exist
        try:
            supabase.table("vietnamese_learning_notes").upsert(VIETNAMESE_NOTES, on_conflict="id").execute()
            print("  ✓ Seeded Vietnamese learning notes (fallback)")
        except Exception as ex:
            print(f"  ❌ Error seeding Vietnamese notes: {ex}")
            
    print("✅ Advanced Textbook Content Seeding Complete!")

if __name__ == "__main__":
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env")
    else:
        asyncio.run(seed_content())
