-- ─── Graded Reading Stories ───────────────────────────────────────────────
create table if not exists reading_stories (
  id           uuid primary key default uuid_generate_v4(),
  title_jp     text not null,
  title_en     text not null,
  jlpt_level   text not null check (jlpt_level in ('N5','N4','N3','N2','N1')),
  genre        text not null default 'story' check (genre in ('story','dialog','news','poem')),
  content_jp   text not null,
  content_en   text,
  word_count   int not null default 0,
  read_time_min int not null default 5,
  cover_gradient text default 'from-indigo-900 to-purple-900',
  created_at   timestamptz default now()
);

create index on reading_stories (jlpt_level, genre);

-- ─── User reading progress ────────────────────────────────────────────────
create table if not exists user_reading_progress (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references users(id) on delete cascade,
  story_id        uuid not null references reading_stories(id) on delete cascade,
  status          text not null default 'not_started' check (status in ('not_started','in_progress','completed')),
  quiz_score      int,
  completed_at    timestamptz,
  updated_at      timestamptz default now(),
  unique(user_id, story_id)
);

alter table user_reading_progress enable row level security;
create policy "Users manage own reading progress" on user_reading_progress
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── Comprehension Quiz Questions ─────────────────────────────────────────
create table if not exists reading_quiz_questions (
  id           uuid primary key default uuid_generate_v4(),
  story_id     uuid not null references reading_stories(id) on delete cascade,
  question_jp  text not null,
  question_en  text,
  options      jsonb not null,  -- [{"text": "...", "correct": true}, ...]
  sort_order   int not null default 0
);

-- ─── Seed N5 sample stories ───────────────────────────────────────────────
insert into reading_stories (title_jp, title_en, jlpt_level, genre, content_jp, content_en, word_count, read_time_min, cover_gradient) values
(
  '私の一日',
  'My Day',
  'N5',
  'story',
  '私は毎朝６時に起きます。それから顔を洗って朝ごはんを食べます。朝ごはんはご飯と味噌汁です。７時に家を出て学校へ行きます。学校では日本語を勉強します。午後３時に学校が終わります。家に帰ってから宿題をします。夜８時ごろ晩ごはんを食べます。それからお風呂に入ります。１０時ごろ寝ます。',
  'I wake up at 6 AM every morning. Then I wash my face and eat breakfast. Breakfast is rice and miso soup. I leave home at 7 and go to school. At school I study Japanese. School ends at 3 PM. After coming home I do homework. Around 8 PM I eat dinner. Then I take a bath. I go to bed around 10.',
  80,
  3,
  'from-blue-900 to-indigo-900'
),
(
  'スーパーで',
  'At the Supermarket',
  'N5',
  'dialog',
  '「すみません、トマトはどこですか。」「野菜売り場は２階です。エレベーターで上がってください。」「ありがとうございます。あの、りんごはいくらですか。」「一個１５０円です。」「三個ください。」「では４５０円です。」',
  '"Excuse me, where are the tomatoes?" "The vegetable section is on the 2nd floor. Please take the elevator." "Thank you. Also, how much are the apples?" "150 yen each." "Three please." "That will be 450 yen."',
  60,
  2,
  'from-green-900 to-teal-900'
),
(
  '東京の春',
  'Spring in Tokyo',
  'N4',
  'story',
  '春になると、東京の公園では桜の花が咲きます。人々は家族や友達と一緒に花見をします。桜の花は約一週間しか咲きません。だから、日本人は毎年この短い季節をとても大切にします。花見ではお弁当を食べたり、お酒を飲んだりします。桜の花びらが風に飛ばされて、まるで雪のように見えます。',
  'When spring comes, cherry blossoms bloom in Tokyo parks. People have flower-viewing parties with family and friends. Cherry blossoms only bloom for about one week. So Japanese people cherish this short season every year. At flower-viewing parties, people eat bento boxes and drink sake. Cherry blossom petals blown by the wind look just like snow.',
  100,
  4,
  'from-pink-900 to-rose-900'
)
on conflict do nothing;
