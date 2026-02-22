
-- Table for chapter problem reports
CREATE TABLE public.chapter_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  book_id UUID NOT NULL,
  chapter_id UUID NOT NULL,
  chapter_title TEXT NOT NULL,
  report_type TEXT NOT NULL,
  description TEXT NOT NULL,
  screenshot_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chapter_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
ON public.chapter_reports FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own reports"
ON public.chapter_reports FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage reports"
ON public.chapter_reports FOR ALL TO authenticated
USING (public.is_admin(auth.uid()));

-- Storage bucket for report screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('chapter-report-screenshots', 'chapter-report-screenshots', false);

CREATE POLICY "Users upload report screenshots"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'chapter-report-screenshots' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users view own report screenshots"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'chapter-report-screenshots' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Admins view all report screenshots"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'chapter-report-screenshots' AND public.is_admin(auth.uid()));
