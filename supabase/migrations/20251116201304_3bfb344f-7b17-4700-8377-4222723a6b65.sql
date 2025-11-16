-- Create translation_metrics table for monitoring and cost tracking
CREATE TABLE public.translation_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES translation_jobs(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES book_chapter_epubs(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  duration_ms INTEGER,
  tokens_used INTEGER,
  cost_usd NUMERIC(10, 6),
  retries INTEGER DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'skipped')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_translation_metrics_job_id ON public.translation_metrics(job_id);
CREATE INDEX idx_translation_metrics_chapter_id ON public.translation_metrics(chapter_id);
CREATE INDEX idx_translation_metrics_created_at ON public.translation_metrics(created_at DESC);
CREATE INDEX idx_translation_metrics_status ON public.translation_metrics(status);

-- Enable RLS
ALTER TABLE public.translation_metrics ENABLE ROW LEVEL SECURITY;

-- Admins can view all metrics
CREATE POLICY "Admins can view all translation metrics"
  ON public.translation_metrics
  FOR SELECT
  TO authenticated
  USING (user_has_role(auth.uid(), 'admin'::app_role));

-- System can insert metrics
CREATE POLICY "System can insert translation metrics"
  ON public.translation_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Comment
COMMENT ON TABLE public.translation_metrics IS 'Tracks detailed metrics for each translation operation including duration, tokens, and costs';