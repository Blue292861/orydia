-- Create helper functions that accept email directly for admin premium management

-- Function to grant premium using email directly
CREATE OR REPLACE FUNCTION public.grant_manual_premium_by_email_secure(p_email text, p_months integer DEFAULT 1)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  user_record RECORD;
  admin_id UUID := auth.uid();
BEGIN
  -- Verify admin role
  IF NOT user_has_role(admin_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can grant premium';
  END IF;
  
  -- Validate input parameters
  IF p_email IS NULL OR trim(p_email) = '' THEN
    RAISE EXCEPTION 'Email cannot be null or empty';
  END IF;
  
  IF p_months < 1 OR p_months > 60 THEN
    RAISE EXCEPTION 'Premium months must be between 1 and 60';
  END IF;
  
  -- Get user by email from auth.users
  SELECT id, email INTO user_record 
  FROM auth.users 
  WHERE email = lower(trim(p_email));
  
  IF user_record.id IS NULL THEN
    RAISE EXCEPTION 'User not found with email: %', p_email;
  END IF;
  
  -- Log the premium grant action
  PERFORM log_admin_action(
    'manual_premium_granted',
    user_record.id,
    jsonb_build_object(
      'months_granted', p_months,
      'user_email', user_record.email,
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
    user_record.id,
    user_record.email,
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

-- Function to revoke premium using email directly
CREATE OR REPLACE FUNCTION public.revoke_manual_premium_by_email_secure(p_email text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  user_record RECORD;
  admin_id UUID := auth.uid();
BEGIN
  -- Verify admin role
  IF NOT user_has_role(admin_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can revoke premium';
  END IF;
  
  -- Validate input
  IF p_email IS NULL OR trim(p_email) = '' THEN
    RAISE EXCEPTION 'Email cannot be null or empty';
  END IF;
  
  -- Get user by email from auth.users
  SELECT id, email INTO user_record 
  FROM auth.users 
  WHERE email = lower(trim(p_email));
  
  IF user_record.id IS NULL THEN
    RAISE EXCEPTION 'User not found with email: %', p_email;
  END IF;
  
  -- Log the premium revocation action
  PERFORM log_admin_action(
    'manual_premium_revoked',
    user_record.id,
    jsonb_build_object(
      'user_email', user_record.email,
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
  WHERE user_id = user_record.id;
  
  -- If no subscriber record exists, that's fine - user had no subscription anyway
END;
$$;