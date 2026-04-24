"""
seed_learning_graph.py — Seed learning_graph_nodes and edges for JLPT Skill Tree.

Run after 004_learning_graph.sql migration has been applied.
Usage:
  python seed_learning_graph.py
"""
import os
from dataclasses import dataclass, field
from supabase import create_client, Client

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


@dataclass
class GraphNode:
    key: str
    node_type: str      # grammar | kanji | vocab | reading
    jlpt_level: str
    title: str
    description: str
    estimated_time: str
    topics: list[str] = field(default_factory=list)
    sort_order: int = 0


GRAMMAR_NODES: list[GraphNode] = [
    # ─── N5 ────────────────────────────────────────────────────────────────
    GraphNode("n5_grammar_copula",     "grammar","N5","N は N です",    "Basic copula sentences",                    "~10 min", ["Identity","Occupation","Nationality"],       1),
    GraphNode("n5_grammar_question",   "grammar","N5","Question Form",  "Forming yes/no questions with か",          "~10 min", ["Yes/No questions","Rising intonation"],      2),
    GraphNode("n5_grammar_possession", "grammar","N5","の Possession",   "Possessive particle の",                    "~15 min", ["Ownership","Noun modification"],             3),
    GraphNode("n5_grammar_location",   "grammar","N5","Location Words",  "ここ そこ あそこ どこ",                    "~15 min", ["こそあど system","Where questions"],          4),
    GraphNode("n5_grammar_vmaseru",    "grammar","N5","V-ます Form",     "Polite present/future verb form",          "~20 min", ["Verb conjugation","Masu/masen"],             5),
    GraphNode("n5_grammar_te_form",    "grammar","N5","て-form Basics",  "Connecting verbs; requests with ください", "~20 min", ["て-form rules","てください","てから"],       6),
    GraphNode("n5_grammar_teiru",      "grammar","N5","～ている",         "Ongoing action or current state",           "~20 min", ["Progressive","Resultant state"],             7),
    GraphNode("n5_grammar_adj",        "grammar","N5","Adjective Types", "い-adj vs な-adj conjugation",              "~25 min", ["い-adjective","な-adjective","Negation"],    8),
    GraphNode("n5_grammar_time",       "grammar","N5","Time Expressions","Time: に、から、まで、ごろ",                "~20 min", ["Clock times","Frequency"],                  9),

    # ─── N4 ────────────────────────────────────────────────────────────────
    GraphNode("n4_grammar_teform",     "grammar","N4","て-form Advanced","Connecting clauses; simultaneous actions", "~20 min", ["てから","ながら","てもいい"],               30),
    GraphNode("n4_grammar_teiru",      "grammar","N4","～ている (N4)",    "State vs progressive; habitual action",     "~25 min", ["Habitual action","Resultant state"],        31),
    GraphNode("n4_grammar_tai",        "grammar","N4","～たい",           "Wanting to do something",                   "~15 min", ["Desire","～たがっている"],                  32),
    GraphNode("n4_grammar_plain",      "grammar","N4","Plain Form",       "Dictionary form in complex sentences",     "~30 min", ["と思います","んです","から"],                33),
    GraphNode("n4_grammar_relative",   "grammar","N4","Relative Clauses", "Verb/adj modifying nouns",                 "~30 min", ["Relative clause","Noun modification"],      34),
    GraphNode("n4_grammar_passive",    "grammar","N4","Passive Form",     "受身形 — suffering/neutral passive",       "~30 min", ["Passive conjugation","に被られる"],          35),
    GraphNode("n4_grammar_potential",  "grammar","N4","Potential Form",   "Can do / able to do",                      "~20 min", ["Potential conjugation","できる"],            36),
    GraphNode("n4_grammar_causative",  "grammar","N4","Causative Form",   "Make/let someone do something",            "~25 min", ["Causative conjugation"],                    37),
    GraphNode("n4_grammar_give_recv",  "grammar","N4","Give & Receive",   "あげる/もらう/くれる trio",                 "~30 min", ["あげる","もらう","くれる","いただく"],      38),
    GraphNode("n4_grammar_keigo1",     "grammar","N4","Keigo Basics I",   "尊敬語 — respecting others' actions",       "~35 min", ["いらっしゃる","おVになる"],                 39),

    # ─── N3 ────────────────────────────────────────────────────────────────
    GraphNode("n3_grammar_ba",         "grammar","N3","～ば Conditional","If ~ conditional form",                     "~25 min", ["Conditional","Advice"],                     50),
    GraphNode("n3_grammar_noni",       "grammar","N3","～のに",           "Unexpected result / regret",               "~20 min", ["Regret","Contrast"],                        51),
    GraphNode("n3_grammar_tara",       "grammar","N3","～たら",           "When/if ~ (sequential conditional)",       "~25 min", ["Conditional","Sequence"],                   52),
]

KANJI_NODES: list[GraphNode] = [
    GraphNode("n5_kanji_people",   "kanji","N5","People & Society",  "人 口 子 女 男 大 小 中 上 下",  "~30 min", ["人口","大人","子ども"],   10),
    GraphNode("n5_kanji_nature",   "kanji","N5","Nature & Elements", "山 川 木 水 火 土 空 海 花 草",  "~30 min", ["自然","季節"],             11),
    GraphNode("n5_kanji_numbers",  "kanji","N5","Numbers",           "一 二 三 四 五 六 七 八 九 十百千万", "~25 min", ["Counting","Amount"],  12),
    GraphNode("n5_kanji_time",     "kanji","N5","Time & Calendar",   "日 月 年 時 分 今 前 後 週",    "~25 min", ["Days","Months","Hours"],   13),
    GraphNode("n5_kanji_body",     "kanji","N5","Body & Health",     "目 耳 口 手 足 心 頭",          "~20 min", ["Body parts"],              14),
    GraphNode("n4_kanji_daily",    "kanji","N4","Daily Life Kanji",  "食 飲 見 聞 話 書 読 来 行 帰", "~40 min", ["Actions","Routines"],      40),
    GraphNode("n4_kanji_places",   "kanji","N4","Places & Buildings","駅 店 校 館 院 場 会社 銀行",    "~35 min", ["Places","Buildings"],      41),
    GraphNode("n4_kanji_feelings", "kanji","N4","Feelings & Mind",   "好 嫌 楽 悲 怒 思 感 心配",     "~30 min", ["Emotions","Mental state"], 42),
]

VOCAB_NODES: list[GraphNode] = [
    GraphNode("n5_vocab_greetings",  "vocab","N5","Greetings",       "Basic greetings and daily expressions",  "~15 min", ["おはよう","こんにちは","ありがとう"],  20),
    GraphNode("n5_vocab_numbers",    "vocab","N5","Numbers & Counting","一 二 三... つ counting systems",       "~20 min", ["Hitotsu","Ichi","Counters"],          21),
    GraphNode("n5_vocab_family",     "vocab","N5","Family Terms",    "Family vocabulary in and out of home",  "~20 min", ["父","母","兄","妹","家族"],             22),
    GraphNode("n5_vocab_food",       "vocab","N5","Food & Drinks",   "Common food and drink vocabulary",      "~25 min", ["ご飯","水","食べる","飲む"],            23),
    GraphNode("n4_vocab_work",       "vocab","N4","Work & Business",  "Office and professional vocabulary",    "~30 min", ["会社","仕事","報告","連絡"],            43),
    GraphNode("n4_vocab_travel",     "vocab","N4","Travel & Transport","Transportation and travel words",       "~25 min", ["電車","飛行機","旅行","予約"],          44),
]

ALL_NODES = GRAMMAR_NODES + KANJI_NODES + VOCAB_NODES

# (from_key, to_key) prerequisite edges
EDGES: list[tuple[str, str]] = [
    ("n5_grammar_copula",     "n5_grammar_question"),
    ("n5_grammar_copula",     "n5_grammar_possession"),
    ("n5_grammar_location",   "n5_grammar_vmaseru"),
    ("n5_grammar_vmaseru",    "n5_grammar_te_form"),
    ("n5_grammar_te_form",    "n5_grammar_teiru"),
    ("n5_grammar_te_form",    "n4_grammar_teform"),
    ("n5_grammar_teiru",      "n4_grammar_teiru"),
    ("n5_grammar_adj",        "n4_grammar_tai"),
    ("n4_grammar_teform",     "n4_grammar_potential"),
    ("n4_grammar_teform",     "n4_grammar_passive"),
    ("n4_grammar_teform",     "n4_grammar_causative"),
    ("n4_grammar_plain",      "n4_grammar_relative"),
    ("n4_grammar_give_recv",  "n4_grammar_keigo1"),
    ("n5_kanji_people",       "n5_vocab_family"),
    ("n5_kanji_numbers",      "n5_vocab_numbers"),
    ("n5_kanji_time",         "n5_vocab_greetings"),
    ("n4_kanji_daily",        "n4_vocab_work"),
    ("n4_kanji_places",       "n4_vocab_travel"),
    ("n4_grammar_plain",      "n3_grammar_ba"),
    ("n4_grammar_plain",      "n3_grammar_tara"),
    ("n3_grammar_ba",         "n3_grammar_noni"),
]


def seed():
    print("Seeding learning graph nodes...")

    # Upsert nodes
    node_rows = [
        {
            "node_key":       n.key,
            "node_type":      n.node_type,
            "jlpt_level":     n.jlpt_level,
            "title":          n.title,
            "description":    n.description,
            "estimated_time": n.estimated_time,
            "topics_json":    n.topics,
            "sort_order":     n.sort_order,
        }
        for n in ALL_NODES
    ]
    supabase.table("learning_graph_nodes").upsert(node_rows, on_conflict="node_key").execute()
    print(f"  ✓ {len(node_rows)} nodes upserted")

    # Fetch node ids by key
    res = supabase.table("learning_graph_nodes").select("id, node_key").execute()
    key_to_id = {r["node_key"]: r["id"] for r in res.data}

    # Upsert edges
    edge_rows = []
    for from_key, to_key in EDGES:
        if from_key in key_to_id and to_key in key_to_id:
            edge_rows.append({"from_node": key_to_id[from_key], "to_node": key_to_id[to_key]})

    if edge_rows:
        supabase.table("learning_graph_edges").upsert(edge_rows, on_conflict="from_node,to_node").execute()
    print(f"  ✓ {len(edge_rows)} edges upserted")
    print("Learning graph seed complete!")


if __name__ == "__main__":
    seed()
