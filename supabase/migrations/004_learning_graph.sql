-- ─── Learning Graph Nodes ─────────────────────────────────────────────────
create table if not exists learning_graph_nodes (
  id            uuid primary key default uuid_generate_v4(),
  node_key      text not null unique,
  node_type     text not null check (node_type in ('grammar','kanji','vocab','reading')),
  jlpt_level    text not null check (jlpt_level in ('N5','N4','N3','N2','N1')),
  title         text not null,
  description   text,
  estimated_time text,
  topics_json   jsonb default '[]',
  sort_order    int not null default 0,
  mnn_lesson_id uuid,
  created_at    timestamptz default now()
);

create index on learning_graph_nodes (jlpt_level, node_type);
create index on learning_graph_nodes (sort_order);

-- ─── Learning Graph Edges (prerequisite dependencies) ──────────────────────
create table if not exists learning_graph_edges (
  id          uuid primary key default uuid_generate_v4(),
  from_node   uuid not null references learning_graph_nodes(id) on delete cascade,
  to_node     uuid not null references learning_graph_nodes(id) on delete cascade,
  edge_type   text not null default 'prerequisite',
  unique(from_node, to_node)
);

-- ─── Per-user Node Progress ────────────────────────────────────────────────
create table if not exists user_node_progress (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references users(id) on delete cascade,
  node_id          uuid not null references learning_graph_nodes(id) on delete cascade,
  status           text not null default 'locked' check (status in ('locked','active','completed')),
  progress_current int not null default 0,
  progress_total   int not null default 0,
  unlocked_at      timestamptz,
  completed_at     timestamptz,
  unique(user_id, node_id)
);

alter table user_node_progress enable row level security;
create policy "Users manage own node progress" on user_node_progress
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index on user_node_progress (user_id, status);

-- ─── Seed N5 starter nodes ────────────────────────────────────────────────
insert into learning_graph_nodes (node_key, node_type, jlpt_level, title, description, estimated_time, sort_order) values
  ('n5_grammar_copula',        'grammar', 'N5', 'N は N です',        'Copula sentence pattern',         '~10 min', 1),
  ('n5_grammar_question',      'grammar', 'N5', 'Question Form',      'か question ending',              '~10 min', 2),
  ('n5_grammar_possession',    'grammar', 'N5', 'の Possession',       'Noun modification with の',       '~15 min', 3),
  ('n5_grammar_location',      'grammar', 'N5', 'Location Words',     'ここ/そこ/あそこ location words',  '~15 min', 4),
  ('n5_grammar_vmaseru',       'grammar', 'N5', 'V-ます Form',         'Polite verb conjugation',         '~20 min', 5),
  ('n5_grammar_te_form',       'grammar', 'N5', 'て-form Basics',      'Connecting verbs with て',        '~20 min', 6),
  ('n5_grammar_teiru',         'grammar', 'N5', '～ている',            'Ongoing action / current state',  '~20 min', 7),
  ('n5_kanji_people',          'kanji',   'N5', 'People & Numbers',   '人 口 子 女 男 大 小 etc.',         '~30 min', 10),
  ('n5_kanji_nature',          'kanji',   'N5', 'Nature Kanji',       '山 川 木 水 火 etc.',               '~30 min', 11),
  ('n5_vocab_greetings',       'vocab',   'N5', 'Greetings',          'Basic greetings and expressions',  '~15 min', 20),
  ('n5_vocab_numbers',         'vocab',   'N5', 'Numbers',            '一 二 三... counting systems',     '~20 min', 21),
  ('n4_grammar_teform_basics', 'grammar', 'N4', 'て-form Advanced',   'て-form for requests and linking', '~20 min', 30),
  ('n4_grammar_teiru',         'grammar', 'N4', '～ている Deep Dive',  'State vs action with ている',       '~25 min', 31),
  ('n4_grammar_tai',           'grammar', 'N4', '～たい',              'Expressing desire to do something','~15 min', 32),
  ('n4_grammar_plain_form',    'grammar', 'N4', 'Plain Form',         'Dictionary form in sentences',     '~30 min', 33),
  ('n4_kanji_daily',           'kanji',   'N4', 'Daily Life Kanji',   '食 飲 見 聞 話 書 読 etc.',         '~40 min', 40)
on conflict (node_key) do nothing;

-- ─── Seed prerequisite edges ──────────────────────────────────────────────
insert into learning_graph_edges (from_node, to_node)
select f.id, t.id from learning_graph_nodes f, learning_graph_nodes t
where (f.node_key = 'n5_grammar_vmaseru'  and t.node_key = 'n5_grammar_te_form')
   or (f.node_key = 'n5_grammar_te_form'  and t.node_key = 'n5_grammar_teiru')
   or (f.node_key = 'n5_grammar_teiru'    and t.node_key = 'n4_grammar_teiru')
   or (f.node_key = 'n5_grammar_te_form'  and t.node_key = 'n4_grammar_teform_basics')
   or (f.node_key = 'n5_kanji_people'     and t.node_key = 'n5_vocab_greetings')
on conflict do nothing;
