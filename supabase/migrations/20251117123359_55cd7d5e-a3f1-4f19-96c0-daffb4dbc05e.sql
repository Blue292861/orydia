-- Phase 6: Create translation alerts table
CREATE TABLE IF NOT EXISTS translation_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('budget_threshold', 'budget_exceeded', 'translation_failed', 'job_failed')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')) DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies
ALTER TABLE translation_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all translation alerts"
  ON translation_alerts
  FOR ALL
  USING (user_has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (user_has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert translation alerts"
  ON translation_alerts
  FOR INSERT
  WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_translation_alerts_type ON translation_alerts(alert_type);
CREATE INDEX idx_translation_alerts_severity ON translation_alerts(severity);
CREATE INDEX idx_translation_alerts_resolved ON translation_alerts(is_resolved);
CREATE INDEX idx_translation_alerts_created_at ON translation_alerts(created_at DESC);

-- Add updated_at trigger
CREATE TRIGGER set_translation_alerts_updated_at
  BEFORE UPDATE ON translation_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create budget alert
CREATE OR REPLACE FUNCTION check_and_create_budget_alert()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_budget RECORD;
BEGIN
  -- Get current month budget
  SELECT * INTO v_budget
  FROM translation_budget
  WHERE month_year = to_char(now(), 'YYYY-MM')
    AND is_active = true
  LIMIT 1;

  IF v_budget IS NULL THEN
    RETURN;
  END IF;

  -- Check if budget is exceeded
  IF v_budget.spent_usd >= v_budget.budget_usd THEN
    INSERT INTO translation_alerts (alert_type, severity, title, message, metadata)
    VALUES (
      'budget_exceeded',
      'critical',
      'Translation Budget Exceeded',
      'Monthly translation budget has been exceeded. New translations are blocked.',
      jsonb_build_object(
        'budget_usd', v_budget.budget_usd,
        'spent_usd', v_budget.spent_usd,
        'month_year', v_budget.month_year
      )
    )
    ON CONFLICT DO NOTHING;
    RETURN;
  END IF;

  -- Check if budget threshold is exceeded
  IF (v_budget.spent_usd / v_budget.budget_usd * 100) >= v_budget.alert_threshold_pct THEN
    INSERT INTO translation_alerts (alert_type, severity, title, message, metadata)
    VALUES (
      'budget_threshold',
      'warning',
      'Translation Budget Threshold Exceeded',
      format('Translation budget is at %s%% of monthly limit', 
        round((v_budget.spent_usd / v_budget.budget_usd * 100)::numeric, 1)),
      jsonb_build_object(
        'budget_usd', v_budget.budget_usd,
        'spent_usd', v_budget.spent_usd,
        'threshold_pct', v_budget.alert_threshold_pct,
        'month_year', v_budget.month_year
      )
    )
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;