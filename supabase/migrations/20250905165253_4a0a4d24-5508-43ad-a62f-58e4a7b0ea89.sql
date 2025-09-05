-- Add security audit logging infrastructure

-- Create security audit log table (if not exists)
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Only admins can view security audit logs" ON public.security_audit_log;

CREATE POLICY "Only admins can view security audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (user_has_role(auth.uid(), 'admin'::app_role));

-- Add rate limiting table (if not exists)
CREATE TABLE IF NOT EXISTS public.rate_limit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action_type TEXT NOT NULL,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on rate limit log
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only system can log rate limits" 
ON public.rate_limit_log 
FOR INSERT 
WITH CHECK (true);

-- Add security audit function
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type TEXT,
  user_id UUID DEFAULT auth.uid(),
  details JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_audit_log (event_type, user_id, details, created_at)
  VALUES (event_type, user_id, details, now())
  ON CONFLICT DO NOTHING;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't let logging errors break the application
    NULL;
END;
$$;

-- Add rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id UUID,
  p_action_type TEXT,
  p_max_attempts INTEGER DEFAULT 5,
  p_window_minutes INTEGER DEFAULT 15
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO attempt_count
  FROM public.rate_limit_log
  WHERE user_id = p_user_id
    AND action_type = p_action_type
    AND created_at > (now() - (p_window_minutes || ' minutes')::INTERVAL);
  
  IF attempt_count >= p_max_attempts THEN
    RETURN FALSE;
  END IF;
  
  INSERT INTO public.rate_limit_log (user_id, action_type)
  VALUES (p_user_id, p_action_type);
  
  RETURN TRUE;
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON public.security_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_rate_limit_log_user_action ON public.rate_limit_log(user_id, action_type, created_at);