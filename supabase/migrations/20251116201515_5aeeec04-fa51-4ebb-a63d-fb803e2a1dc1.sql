-- Create translation budget tracking table
CREATE TABLE public.translation_budget (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_year TEXT NOT NULL UNIQUE, -- Format: 'YYYY-MM'
  budget_usd NUMERIC(10, 2) NOT NULL DEFAULT 100.00,
  spent_usd NUMERIC(10, 2) NOT NULL DEFAULT 0,
  alert_threshold_pct INTEGER NOT NULL DEFAULT 80,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for current month queries
CREATE INDEX idx_translation_budget_month_year ON public.translation_budget(month_year);
CREATE INDEX idx_translation_budget_active ON public.translation_budget(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.translation_budget ENABLE ROW LEVEL SECURITY;

-- Admins can manage budgets
CREATE POLICY "Admins can manage translation budgets"
  ON public.translation_budget
  FOR ALL
  TO authenticated
  USING (user_has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (user_has_role(auth.uid(), 'admin'::app_role));

-- Anyone can view budgets (for checking limits)
CREATE POLICY "Anyone can view translation budgets"
  ON public.translation_budget
  FOR SELECT
  TO authenticated
  USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_translation_budget_updated_at
  BEFORE UPDATE ON public.translation_budget
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add content_hash to chapter_translations for caching
ALTER TABLE public.chapter_translations
ADD COLUMN IF NOT EXISTS content_hash TEXT;

-- Create index on content_hash for fast cache lookups
CREATE INDEX IF NOT EXISTS idx_chapter_translations_content_hash 
ON public.chapter_translations(content_hash, language) 
WHERE status = 'completed';

-- Function to get or create current month budget
CREATE OR REPLACE FUNCTION public.get_current_month_budget()
RETURNS TABLE (
  id UUID,
  month_year TEXT,
  budget_usd NUMERIC,
  spent_usd NUMERIC,
  remaining_usd NUMERIC,
  alert_threshold_pct INTEGER,
  is_over_threshold BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_month TEXT;
  budget_record RECORD;
BEGIN
  current_month := to_char(now(), 'YYYY-MM');
  
  -- Get or create budget for current month
  INSERT INTO public.translation_budget (month_year)
  VALUES (current_month)
  ON CONFLICT (month_year) DO NOTHING;
  
  -- Return budget info
  RETURN QUERY
  SELECT 
    tb.id,
    tb.month_year,
    tb.budget_usd,
    tb.spent_usd,
    (tb.budget_usd - tb.spent_usd) as remaining_usd,
    tb.alert_threshold_pct,
    (tb.spent_usd >= (tb.budget_usd * tb.alert_threshold_pct / 100)) as is_over_threshold
  FROM public.translation_budget tb
  WHERE tb.month_year = current_month;
END;
$$;

-- Function to update budget spent amount
CREATE OR REPLACE FUNCTION public.update_translation_budget_spent(cost_amount NUMERIC)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_month TEXT;
BEGIN
  current_month := to_char(now(), 'YYYY-MM');
  
  -- Update spent amount for current month
  UPDATE public.translation_budget
  SET 
    spent_usd = spent_usd + cost_amount,
    updated_at = now()
  WHERE month_year = current_month;
  
  RETURN true;
END;
$$;

COMMENT ON TABLE public.translation_budget IS 'Tracks monthly translation budgets and spending to control API costs';
COMMENT ON FUNCTION public.get_current_month_budget IS 'Gets or creates the budget record for the current month';
COMMENT ON FUNCTION public.update_translation_budget_spent IS 'Updates the spent amount for the current month budget';