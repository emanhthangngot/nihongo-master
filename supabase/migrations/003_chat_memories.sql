-- ─── AI Conversations ─────────────────────────────────────────────────────
create table if not exists conversations (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references users(id) on delete cascade,
  title      text not null default 'New Chat',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table conversations enable row level security;
create policy "Users manage own conversations" on conversations
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── Chat Messages ────────────────────────────────────────────────────────
create table if not exists chat_messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role            text not null check (role in ('user','assistant')),
  content         text not null,
  grammar_data    jsonb,
  created_at      timestamptz default now()
);

create index on chat_messages (conversation_id, created_at);

-- ─── Notebook Collections ─────────────────────────────────────────────────
create table if not exists notebook_collections (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references users(id) on delete cascade,
  name       text not null,
  color      text default 'hsl(28,95%,58%)',
  created_at timestamptz default now()
);

create table if not exists notebook_items (
  id            uuid primary key default uuid_generate_v4(),
  collection_id uuid not null references notebook_collections(id) on delete cascade,
  pattern       text not null,
  meaning       text not null,
  example_jp    text,
  example_en    text,
  tags          text[] default '{}',
  in_srs        boolean default false,
  srs_card_id   uuid references srs_cards(id),
  created_at    timestamptz default now()
);