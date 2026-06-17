-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "vector";

-- ─── Users ────────────────────────────────────────────────────────────────
create table if not exists users (
  id            uuid primary key default uuid_generate_v4(),
  email         text unique not null,
  password_hash text not null,
  display_name  text not null,
  jlpt_target   text not null default 'N5' check (jlpt_target in ('N5','N4','N3','N2','N1')),
  learning_goal text not null default 'jlpt' check (learning_goal in ('jlpt','speak','travel','anime')),
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Row Level Security
alter table users enable row level security;
create policy "Users can read own profile" on users for select using (auth.uid() = id);
create policy "Users can update own profile" on users for update using (auth.uid() = id);

-- ─── Dictionary entries ────────────────────────────────────────────────────
create table if not exists dictionary_entries (
  id          uuid primary key default uuid_generate_v4(),
  word        text not null,
  reading     text not null,
  romaji      text not null,
  meanings    text[] not null default '{}',
  pos         text not null,
  jlpt_level  text check (jlpt_level in ('N5','N4','N3','N2','N1')),
  pitch_morae text[] default '{}',
  pitch_pattern int[] default '{}',
  tags        text[] default '{}',
  embedding   vector(1024),
  created_at  timestamptz default now()
);

create index on dictionary_entries using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index on dictionary_entries (jlpt_level);
create index on dictionary_entries (word);

-- ─── Kanji entries ─────────────────────────────────────────────────────────
create table if not exists kanji_entries (
  id           uuid primary key default uuid_generate_v4(),
  char         text unique not null,
  on_readings  text[] default '{}',
  kun_readings text[] default '{}',
  meanings     text[] not null default '{}',
  stroke_count int,
  jlpt_level   text check (jlpt_level in ('N5','N4','N3','N2','N1')),
  mnemonic     text,
  embedding    vector(1024),
  created_at   timestamptz default now()
);

-- ─── Example sentences ────────────────────────────────────────────────────
create table if not exists example_sentences (
  id         uuid primary key default uuid_generate_v4(),
  japanese   text not null,
  english    text not null,
  source     text,
  jlpt_level text,
  embedding  vector(1024),
  created_at timestamptz default now()
);