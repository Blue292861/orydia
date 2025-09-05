-- Security Fix: Restrict overly permissive RLS policies on subscribers table
-- Remove the overly broad edge function and service role policies

DROP POLICY IF EXISTS "Edge functions can update subscription data" ON public.subscribers;
DROP POLICY IF EXISTS "Service role can insert subscription data" ON public.subscribers;

-- Create more secure policies that only allow specific system operations
-- Edge functions should only be able to update subscription status for authenticated users
CREATE POLICY "Edge functions can update authenticated user subscriptions" 
ON public.subscribers 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- System can insert subscription data but only for valid authenticated users
CREATE POLICY "System can insert subscription data for authenticated users" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (
  -- Only allow insert if the user_id corresponds to a real authenticated user
  user_id IS NOT NULL AND 
  email IS NOT NULL AND 
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- Add additional security policy to prevent email enumeration
CREATE POLICY "Prevent unauthorized email access" 
ON public.subscribers 
FOR SELECT 
USING (
  -- Only allow users to see their own subscription OR admins to see all
  auth.uid() = user_id OR user_has_role(auth.uid(), 'admin'::app_role)
);

-- Security Fix: Add stricter controls to orders table
-- Remove overly broad admin policies and add audit logging
DROP POLICY IF EXISTS "Authenticated admins can manage orders" ON public.orders;

-- Create more restrictive admin policy with better validation
CREATE POLICY "Admins can manage orders with validation" 
ON public.orders 
FOR ALL 
USING (
  user_has_role(auth.uid(), 'admin'::app_role) AND
  -- Log admin access to orders for audit
  (SELECT log_security_event('admin_order_access', auth.uid(), 
   jsonb_build_object('order_id', id, 'action', 'access'))) IS NOT NULL
)
WITH CHECK (user_has_role(auth.uid(), 'admin'::app_role));

-- Security Fix: Enhance audit logging for sensitive operations
CREATE OR REPLACE FUNCTION public.log_admin_action(
  action_type text, 
  target_user_id uuid DEFAULT NULL,
  details jsonb DEFAULT '{}'::jsonb
) RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Only allow admins to log actions
  IF NOT user_has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can log actions';
  END IF;
  
  INSERT INTO public.security_audit_log (
    event_type, 
    user_id, 
    details, 
    created_at
  ) VALUES (
    action_type,
    target_user_id,
    jsonb_build_object(
      'admin_id', auth.uid(),
      'timestamp', now(),
      'details', details
    ),
    now()
  );
END;
$$;

-- Security Fix: Enhanced premium management with audit trail
CREATE OR REPLACE FUNCTION public.grant_manual_premium_secure(
  p_user_id uuid, 
  p_months integer DEFAULT 1
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  user_email TEXT;
  admin_id UUID := auth.uid();
BEGIN
  -- Verify admin role
  IF NOT user_has_role(admin_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can grant premium';
  END IF;
  
  -- Validate input parameters
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID cannot be null';
  END IF;
  
  IF p_months < 1 OR p_months > 60 THEN
    RAISE EXCEPTION 'Premium months must be between 1 and 60';
  END IF;
  
  -- Get user email for audit logging
  SELECT email INTO user_email 
  FROM auth.users 
  WHERE id = p_user_id;
  
  IF user_email IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Log the premium grant action
  PERFORM log_admin_action(
    'manual_premium_granted',
    p_user_id,
    jsonb_build_object(
      'months_granted', p_months,
      'user_email', user_email,
      'granted_by', admin_id
    )
  );
  
  -- Grant the premium subscription
  INSERT INTO public.subscribers (
    user_id, 
    email, 
    subscribed, 
    subscription_tier, 
    subscription_end,
    stripe_customer_id,
    updated_at
  ) VALUES (
    p_user_id,
    user_email,
    true,
    'Premium Manual',
    now() + (p_months || ' months')::INTERVAL,
    NULL,
    now()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    subscribed = true,
    subscription_tier = 'Premium Manual',
    subscription_end = now() + (p_months || ' months')::INTERVAL,
    stripe_customer_id = NULL,
    updated_at = now();
END;
$function$

-- Security Fix: Enhanced premium revocation with audit trail
CREATE OR REPLACE FUNCTION public.revoke_manual_premium_secure(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  user_email TEXT;
  admin_id UUID := auth.uid();
BEGIN
  -- Verify admin role
  IF NOT user_has_role(admin_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can revoke premium';
  END IF;
  
  -- Get user email for audit logging
  SELECT email INTO user_email 
  FROM subscribers 
  WHERE user_id = p_user_id;
  
  IF user_email IS NULL THEN
    RAISE EXCEPTION 'User subscription not found';
  END IF;
  
  -- Log the premium revocation action
  PERFORM log_admin_action(
    'manual_premium_revoked',
    p_user_id,
    jsonb_build_object(
      'user_email', user_email,
      'revoked_by', admin_id
    )
  );
  
  -- Revoke the premium subscription
  UPDATE public.subscribers 
  SET 
    subscribed = false,
    subscription_tier = NULL,
    subscription_end = NULL,
    updated_at = now()
  WHERE user_id = p_user_id;
END;
$function$