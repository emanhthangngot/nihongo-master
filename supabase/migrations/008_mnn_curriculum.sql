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