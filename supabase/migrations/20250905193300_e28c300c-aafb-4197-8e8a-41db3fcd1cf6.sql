-- Fix revoke_manual_premium_secure function to get email from auth.users instead of subscribers
CREATE OR REPLACE FUNCTION public.revoke_manual_premium_secure(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  user_email TEXT;
  admin_id UUID := auth.uid();
BEGIN
  -- Verify admin role
  IF NOT user_has_role(admin_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can revoke premium';
  END IF;
  
  -- Get user email from auth.users instead of subscribers table
  SELECT email INTO user_email 
  FROM auth.users 
  WHERE id = p_user_id;
  
  IF user_email IS NULL THEN
    RAISE EXCEPTION 'User not found';
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