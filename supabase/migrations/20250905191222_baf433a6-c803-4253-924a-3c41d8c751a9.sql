-- Phase 2: Enhanced Premium Management Security with Audit Logging

-- Create enhanced admin action logging function
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
      'action_details', details
    ),
    now()
  );
END;
$$;

-- Create secure premium granting function with audit trail
CREATE OR REPLACE FUNCTION public.grant_manual_premium_secure(
  p_user_id uuid, 
  p_months integer DEFAULT 1
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Create secure premium revocation function with audit trail
CREATE OR REPLACE FUNCTION public.revoke_manual_premium_secure(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;