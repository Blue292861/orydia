-- Create translation_jobs table for tracking translation states
CREATE TABLE IF NOT EXISTS public.translation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  total_chapters INTEGER NOT NULL,
  completed_chapters INTEGER DEFAULT 0,
  failed_chapters INTEGER DEFAULT 0,
  target_languages TEXT[] NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_translation_jobs_status ON public.translation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_translation_jobs_book_id ON public.translation_jobs(book_id);
CREATE INDEX IF NOT EXISTS idx_translation_jobs_updated_at ON public.translation_jobs(updated_at) WHERE status = 'processing';

-- Create optimized indexes for chapter_translations
CREATE INDEX IF NOT EXISTS idx_chapter_translations_status_chapter 
ON public.chapter_translations(status, chapter_id, language);

CREATE INDEX IF NOT EXISTS idx_chapter_translations_updated_at 
ON public.chapter_translations(updated_at) WHERE status IN ('processing', 'pending');

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_translation_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_translation_jobs_updated_at
  BEFORE UPDATE ON public.translation_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_translation_jobs_updated_at();

-- RLS Policies
ALTER TABLE public.translation_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all translation jobs"
ON public.translation_jobs
FOR ALL
TO authenticated
USING (user_has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (user_has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view translation jobs"
ON public.translation_jobs
FOR SELECT
TO authenticated
USING (true);