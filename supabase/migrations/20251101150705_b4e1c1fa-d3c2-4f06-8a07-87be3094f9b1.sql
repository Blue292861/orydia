-- Create chapter_translations table for storing pre-translated chapters
CREATE TABLE public.chapter_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES book_chapter_epubs(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK (language IN ('en', 'es', 'de', 'ru', 'zh', 'ja', 'ar', 'pt', 'it', 'nl', 'pl', 'tr', 'ko', 'hi')),
  translated_content JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(chapter_id, language)
);

-- Create indexes for efficient querying
CREATE INDEX idx_chapter_translations_chapter_language 
ON public.chapter_translations(chapter_id, language);

CREATE INDEX idx_chapter_translations_status 
ON public.chapter_translations(status);

CREATE INDEX idx_chapter_translations_chapter_id 
ON public.chapter_translations(chapter_id);

-- Trigger to update updated_at
CREATE TRIGGER update_chapter_translations_updated_at
  BEFORE UPDATE ON public.chapter_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies
ALTER TABLE public.chapter_translations ENABLE ROW LEVEL SECURITY;

-- Admins can manage all translations
CREATE POLICY "Admins can manage translations"
  ON public.chapter_translations
  FOR ALL
  USING (user_has_role(auth.uid(), 'admin'::app_role));

-- Authenticated users can read completed translations
CREATE POLICY "Users can read completed translations"
  ON public.chapter_translations
  FOR SELECT
  USING (status = 'completed');