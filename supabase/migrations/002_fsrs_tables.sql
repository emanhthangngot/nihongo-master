-- ─── SRS Cards ────────────────────────────────────────────────────────────
create table if not exists srs_cards (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references users(id) on delete cascade,
  word        text not null,
  reading     text not null,
  meaning     text not null,
  type        text not null default 'vocab' check (type in ('vocab','grammar','kanji')),
  jlpt_level  text,
  -- FSRS state
  interval    int not null default 1,
  ease        float not null default 2.5,
  due_date    date not null default current_date,
  lapses      int not null default 0,
  retention   float not null default 0.9,
  -- FSRS-5 extended
  stability   float default null,
  difficulty  float default null,
  state       int not null default 0, -- 0=New 1=Learning 2=Review 3=Relearning
  reps        int not null default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table srs_cards enable row level security;
create policy "Users manage own SRS cards" on srs_cards
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index on srs_cards (user_id, due_date);
create index on srs_cards (user_id, state);

-- ─── Review Logs ─────────────────────────────────────────────────────────
create table if not exists review_logs (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references users(id) on delete cascade,
  card_id     uuid not null references srs_cards(id) on delete cascade,
  rating      text not null check (rating in ('again','hard','good','easy')),
  reviewed_at timestamptz not null default now(),
  response_ms int,              -- answer latency in ms
  scheduled_days int,
  actual_days    int
);

create index on review_logs (user_id, reviewed_at);
create index on review_logs (card_id);

-- ─── Streak & XP ─────────────────────────────────────────────────────────
create table if not exists user_stats (
  user_id       uuid primary key references users(id) on delete cascade,
  total_xp      int not null default 0,
  current_level int not null default 1,
  streak        int not null default 0,
  longest_streak int not null default 0,
  last_study_date date,
  updated_at    timestamptz default now()
);