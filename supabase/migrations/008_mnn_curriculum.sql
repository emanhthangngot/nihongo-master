-- ─── Minna no Nihongo Books ───────────────────────────────────────────────
create table if not exists curriculum_books (
  id         uuid primary key default uuid_generate_v4(),
  title_jp   text not null,
  title_en   text not null,
  jlpt_level text not null,
  lesson_range int[] not null,   -- [1,25] or [26,50]
  created_at timestamptz default now()
);

insert into curriculum_books (title_jp, title_en, jlpt_level, lesson_range) values
  ('みんなの日本語 I',  'Minna no Nihongo Book I',  'N5', '{1,25}'),
  ('みんなの日本語 II', 'Minna no Nihongo Book II', 'N4', '{26,50}');

-- ─── Curriculum Lessons ───────────────────────────────────────────────────
create table if not exists curriculum_lessons (
  id             uuid primary key default uuid_generate_v4(),
  book_id        uuid not null references curriculum_books(id),
  lesson_number  int not null,
  title_jp       text not null,
  title_en       text not null,
  grammar_points text[] default '{}',
  key_vocab      text[] default '{}',
  kanji          text[] default '{}',
  jlpt_level     text not null,
  created_at     timestamptz default now(),
  unique(book_id, lesson_number)
);

-- ─── User Progress per Lesson ─────────────────────────────────────────────
create table if not exists user_progress (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references users(id) on delete cascade,
  lesson_id    uuid not null references curriculum_lessons(id),
  status       text not null default 'locked' check (status in ('locked','available','in_progress','completed')),
  score        int,
  completed_at timestamptz,
  updated_at   timestamptz default now(),
  unique(user_id, lesson_id)
);

-- Seed some sample lessons for Book I (Minna no Nihongo I)
DO $$ 
DECLARE
  book_id_n5 uuid;
BEGIN
  SELECT id INTO book_id_n5 FROM curriculum_books WHERE title_jp = 'みんなの日本語 I' LIMIT 1;
  
  IF book_id_n5 IS NOT NULL THEN
    INSERT INTO curriculum_lessons (book_id, lesson_number, title_jp, title_en, grammar_points, key_vocab, kanji, jlpt_level)
    VALUES 
      (book_id_n5, 1, 'はじめまして', 'Nice to meet you', '{"N1は N2です", "N1は N2じゃありません", "N1は N2ですか"}', '{"わたし", "あなた", "～さん", "せんせい", "がくせい"}', '{"私", "先", "生", "学"}', 'N5'),
      (book_id_n5, 2, 'ほんのきもちです', 'This is a small token', '{"これ/それ/あれ", "この/その/あの", "そうです/そうじゃありません"}', '{"これ", "それ", "あれ", "ほん", "じしょ"}', '{"本", "何", "気"}', 'N5')
    ON CONFLICT (book_id, lesson_number) DO NOTHING;
  END IF;
END $$;