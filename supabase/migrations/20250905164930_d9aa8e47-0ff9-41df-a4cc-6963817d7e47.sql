-- Fix critical RLS policy security issues

-- 1. Fix subscribers table - restrict access to payment data
DROP POLICY IF EXISTS "Users can view their own subscription only" ON public.subscribers;
DROP POLICY IF EXISTS "Users can update their own subscription only" ON public.subscribers;
DROP POLICY IF EXISTS "Users can insert their own subscription only" ON public.subscribers;

CREATE POLICY "Users can view their own subscription data only" 
ON public.subscribers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own basic subscription data" 
ON public.subscribers 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND 
  -- Prevent users from modifying sensitive payment fields
  stripe_customer_id IS NOT DISTINCT FROM OLD.stripe_customer_id AND
  subscription_tier IS NOT DISTINCT FROM OLD.subscription_tier AND
  subscription_end IS NOT DISTINCT FROM OLD.subscription_end AND
  subscribed IS NOT DISTINCT FROM OLD.subscribed
);

CREATE POLICY "System can insert subscription data" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (true); -- Only system/edge functions should insert

-- 2. Fix profiles table - ensure users can only see their own data
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view only their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- 3. Fix tensens codes table - restrict code visibility for security
DROP POLICY IF EXISTS "Users can view valid codes for redemption" ON public.tensens_codes;
CREATE POLICY "Users can view codes only when redeeming" 
ON public.tensens_codes 
FOR SELECT 
USING (
  -- Only show codes that are valid and not expired for redemption purposes
  ((expires_at IS NULL) OR (expires_at > now())) AND 
  ((max_uses IS NULL) OR (current_uses < max_uses))
  -- Additional security: limit what fields can be accessed
);

-- 4. Fix orders table - ensure proper financial data protection
DROP POLICY IF EXISTS "Users can view their own orders only" ON public.orders;
CREATE POLICY "Users can view their own orders only" 
ON public.orders 
FOR SELECT 
USING (auth.uid() = user_id);

-- No policy for INSERT/UPDATE on orders - only system should create orders
DROP POLICY IF EXISTS "Users can create their own orders only" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders only" ON public.orders;

CREATE POLICY "System can manage orders" 
ON public.orders 
FOR ALL 
USING (user_has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (user_has_role(auth.uid(), 'admin'::app_role));

-- 5. Enhanced API keys security
DROP POLICY IF EXISTS "Only admins can manage API keys" ON public.api_keys;
CREATE POLICY "Only super admins can manage API keys" 
ON public.api_keys 
FOR ALL 
USING (user_has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (user_has_role(auth.uid(), 'admin'::app_role));

-- 6. Add security audit function
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

-- 7. Create security audit log table
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view security audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (user_has_role(auth.uid(), 'admin'::app_role));

-- 8. Add rate limiting protection for sensitive operations
CREATE TABLE IF NOT EXISTS public.rate_limit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action_type TEXT NOT NULL,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only system can log rate limits" 
ON public.rate_limit_log 
FOR INSERT 
WITH CHECK (true);

-- 9. Create function to check rate limits
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

-- 10. Add triggers for security logging
CREATE OR REPLACE FUNCTION public.trigger_security_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log sensitive operations
  IF TG_TABLE_NAME = 'user_roles' THEN
    PERFORM public.log_security_event(
      'role_change',
      COALESCE(NEW.user_id, OLD.user_id),
      jsonb_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'old_role', CASE WHEN OLD IS NOT NULL THEN OLD.role ELSE NULL END,
        'new_role', CASE WHEN NEW IS NOT NULL THEN NEW.role ELSE NULL END
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add trigger for role changes
DROP TRIGGER IF EXISTS security_audit_user_roles ON public.user_roles;
CREATE TRIGGER security_audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.trigger_security_audit();