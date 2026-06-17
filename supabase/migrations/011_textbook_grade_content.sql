-- Migration 011: Textbook-Grade Content Support Tables
-- Sourced from nihongo_master_textbook_grade_content_plan.md

-- 1. document_embeddings table moved to 009
-- 2. Kana Entries
CREATE TABLE IF NOT EXISTS public.kana_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kana TEXT NOT NULL,
  kana_type TEXT NOT NULL CHECK (kana_type IN ('hiragana', 'katakana')),
  romaji TEXT NOT NULL,
  row_group TEXT,
  column_vowel TEXT,
  audio_url TEXT,
  stroke_order_url TEXT,
  example_words JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.kana_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to kana_entries" 
  ON public.kana_entries FOR SELECT TO authenticated, anon USING (true);

-- 3. Lesson Units
CREATE TABLE IF NOT EXISTS public.lesson_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jlpt_level TEXT NOT NULL CHECK (jlpt_level IN ('N5','N4','N3','N2','N1')),
  unit_order INTEGER NOT NULL,
  title_vi TEXT NOT NULL,
  description_vi TEXT,
  target_skills TEXT[],
  prerequisite_unit_ids UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.lesson_units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to lesson_units" 
  ON public.lesson_units FOR SELECT TO authenticated, anon USING (true);

-- 4. Lesson Sections
CREATE TABLE IF NOT EXISTS public.lesson_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID REFERENCES public.lesson_units(id) ON DELETE CASCADE NOT NULL,
  section_order INTEGER NOT NULL,
  section_type TEXT NOT NULL CHECK (section_type IN ('vocab', 'kanji', 'grammar', 'reading', 'listening', 'practice', 'review')),
  title_vi TEXT NOT NULL,
  content_md TEXT,
  related_vocab_ids UUID[],
  related_kanji_ids UUID[],
  related_grammar_ids UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.lesson_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to lesson_sections" 
  ON public.lesson_sections FOR SELECT TO authenticated, anon USING (true);

-- 5. Vietnamese Learning Notes
CREATE TABLE IF NOT EXISTS public.vietnamese_learning_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  related_type TEXT NOT NULL CHECK (related_type IN ('vocab', 'kanji', 'grammar', 'kana', 'lesson')),
  related_id UUID NOT NULL,
  note_type TEXT NOT NULL CHECK (note_type IN ('common_mistake', 'sino_vietnamese', 'nuance', 'comparison', 'memory_tip')),
  title_vi TEXT NOT NULL,
  content_vi TEXT NOT NULL,
  examples JSONB DEFAULT '[]'::jsonb,
  review_status TEXT DEFAULT 'raw',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.vietnamese_learning_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to vietnamese_learning_notes" 
  ON public.vietnamese_learning_notes FOR SELECT TO authenticated, anon USING (true);

-- 6. Grammar Comparisons
CREATE TABLE IF NOT EXISTS public.grammar_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_vi TEXT NOT NULL,
  jlpt_level TEXT CHECK (jlpt_level IN ('N5','N4','N3','N2','N1')),
  grammar_ids UUID[],
  summary_vi TEXT NOT NULL,
  comparison_table JSONB DEFAULT '{}'::jsonb,
  examples JSONB DEFAULT '[]'::jsonb,
  common_mistakes_vi TEXT,
  practice_question_ids UUID[],
  review_status TEXT DEFAULT 'raw',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.grammar_comparisons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to grammar_comparisons" 
  ON public.grammar_comparisons FOR SELECT TO authenticated, anon USING (true);

-- 7. Conjugation Rules
CREATE TABLE IF NOT EXISTS public.conjugation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_key TEXT UNIQUE NOT NULL,
  verb_group TEXT,
  form_name TEXT NOT NULL,
  jlpt_level TEXT CHECK (jlpt_level IN ('N5','N4','N3','N2','N1')),
  explanation_vi TEXT,
  pattern JSONB DEFAULT '{}'::jsonb,
  examples JSONB DEFAULT '[]'::jsonb,
  common_mistakes_vi TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.conjugation_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to conjugation_rules" 
  ON public.conjugation_rules FOR SELECT TO authenticated, anon USING (true);

-- 8. Conjugation Examples
CREATE TABLE IF NOT EXISTS public.conjugation_examples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dictionary_entry_id UUID REFERENCES public.dictionary_entries(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES public.conjugation_rules(id) ON DELETE CASCADE,
  base_form TEXT NOT NULL,
  conjugated_form TEXT NOT NULL,
  sentence_jp TEXT,
  sentence_vi TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.conjugation_examples ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to conjugation_examples" 
  ON public.conjugation_examples FOR SELECT TO authenticated, anon USING (true);

-- 9. Reading Passages
CREATE TABLE IF NOT EXISTS public.reading_passages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_vi TEXT NOT NULL,
  title_jp TEXT,
  jlpt_level TEXT NOT NULL CHECK (jlpt_level IN ('N5','N4','N3','N2','N1')),
  passage_jp TEXT NOT NULL,
  passage_with_furigana TEXT,
  translation_vi TEXT,
  topic TEXT,
  word_count INTEGER,
  related_vocab_ids UUID[],
  related_grammar_ids UUID[],
  comprehension_questions UUID[],
  audio_url TEXT,
  source_type TEXT DEFAULT 'generated',
  review_status TEXT DEFAULT 'raw',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.reading_passages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to reading_passages" 
  ON public.reading_passages FOR SELECT TO authenticated, anon USING (true);

-- 10. Listening Items
CREATE TABLE IF NOT EXISTS public.listening_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_vi TEXT NOT NULL,
  jlpt_level TEXT NOT NULL CHECK (jlpt_level IN ('N5','N4','N3','N2','N1')),
  audio_url TEXT,
  audio_speed TEXT DEFAULT 'normal',
  transcript_jp TEXT NOT NULL,
  transcript_vi TEXT,
  topic TEXT,
  related_vocab_ids UUID[],
  related_grammar_ids UUID[],
  question_ids UUID[],
  source_type TEXT DEFAULT 'tts_generated',
  review_status TEXT DEFAULT 'raw',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.listening_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to listening_items" 
  ON public.listening_items FOR SELECT TO authenticated, anon USING (true);

-- 11. Practice Questions
CREATE TABLE IF NOT EXISTS public.practice_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_type TEXT NOT NULL,
  jlpt_level TEXT NOT NULL CHECK (jlpt_level IN ('N5','N4','N3','N2','N1')),
  skill_type TEXT NOT NULL CHECK (skill_type IN ('kana', 'vocabulary', 'kanji', 'grammar', 'reading', 'listening', 'writing')),
  prompt TEXT NOT NULL,
  prompt_vi TEXT,
  correct_answer TEXT NOT NULL,
  explanation_vi TEXT,
  difficulty INTEGER DEFAULT 1,
  related_vocab_ids UUID[],
  related_kanji_ids UUID[],
  related_grammar_node_ids UUID[],
  related_lesson_id UUID,
  source_type TEXT DEFAULT 'generated',
  review_status TEXT DEFAULT 'raw',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.practice_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to practice_questions" 
  ON public.practice_questions FOR SELECT TO authenticated, anon USING (true);

-- 12. Practice Question Options
CREATE TABLE IF NOT EXISTS public.practice_question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES public.practice_questions(id) ON DELETE CASCADE NOT NULL,
  option_label TEXT NOT NULL,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  explanation_vi TEXT
);

ALTER TABLE public.practice_question_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to practice_question_options" 
  ON public.practice_question_options FOR SELECT TO authenticated, anon USING (true);

-- 13. User Question Attempts (Owner Protected)
CREATE TABLE IF NOT EXISTS public.user_question_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.practice_questions(id) ON DELETE CASCADE NOT NULL,
  user_answer TEXT,
  is_correct BOOLEAN,
  time_spent_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_question_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow owners full access to attempts"
  ON public.user_question_attempts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 14. Flashcards
CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_type TEXT NOT NULL CHECK (card_type IN ('vocab', 'kanji', 'grammar', 'sentence')),
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  hint_vi TEXT,
  explanation_vi TEXT,
  related_vocab_id UUID REFERENCES public.dictionary_entries(id) ON DELETE CASCADE,
  related_kanji_id UUID REFERENCES public.kanji_entries(id) ON DELETE CASCADE,
  related_grammar_id UUID REFERENCES public.learning_graph_nodes(id) ON DELETE CASCADE,
  jlpt_level TEXT CHECK (jlpt_level IN ('N5','N4','N3','N2','N1')),
  difficulty INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to flashcards" 
  ON public.flashcards FOR SELECT TO authenticated, anon USING (true);

-- 15. User Flashcard Reviews (Owner Protected)
CREATE TABLE IF NOT EXISTS public.user_flashcard_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  flashcard_id UUID REFERENCES public.flashcards(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 4),
  review_interval_days INTEGER,
  next_review_at TIMESTAMP WITH TIME ZONE,
  last_reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_flashcard_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow owners full access to flashcard reviews"
  ON public.user_flashcard_reviews FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 16. JLPT Mock Tests
CREATE TABLE IF NOT EXISTS public.jlpt_mock_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_vi TEXT NOT NULL,
  jlpt_level TEXT NOT NULL CHECK (jlpt_level IN ('N5','N4','N3','N2','N1')),
  duration_minutes INTEGER,
  section_config JSONB DEFAULT '{}'::jsonb,
  question_ids UUID[],
  review_status TEXT DEFAULT 'raw',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.jlpt_mock_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to jlpt_mock_tests" 
  ON public.jlpt_mock_tests FOR SELECT TO authenticated, anon USING (true);

-- 17. User Mock Test Attempts (Owner Protected)
CREATE TABLE IF NOT EXISTS public.user_mock_test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  mock_test_id UUID REFERENCES public.jlpt_mock_tests(id) ON DELETE CASCADE NOT NULL,
  score NUMERIC,
  section_scores JSONB DEFAULT '{}'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_mock_test_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow owners full access to mock test attempts"
  ON public.user_mock_test_attempts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 18. Content Sources
CREATE TABLE IF NOT EXISTS public.content_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name TEXT NOT NULL,
  source_url TEXT,
  source_type TEXT CHECK (source_type IN ('github_dataset', 'website', 'manual', 'ai_generated', 'public_domain')),
  license TEXT,
  allowed_usage TEXT,
  attribution_required BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.content_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to content_sources" 
  ON public.content_sources FOR SELECT TO authenticated, anon USING (true);

-- 19. Content Review Tasks (Owner/Reporter Protected)
CREATE TABLE IF NOT EXISTS public.content_review_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  issue_type TEXT CHECK (issue_type IN ('translation_quality', 'grammar_accuracy', 'duplicate', 'unnatural_sentence', 'source_license')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'approved', 'rejected', 'fixed')),
  reviewer_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.content_review_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow reporters to read/create review tasks"
  ON public.content_review_tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
