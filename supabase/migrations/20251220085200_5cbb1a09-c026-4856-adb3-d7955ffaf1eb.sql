-- Function to get user ID by email (admin only)
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(p_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Verify admin role
  IF NOT user_has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can search users';
  END IF;
  
  -- Validate input
  IF p_email IS NULL OR trim(p_email) = '' THEN
    RAISE EXCEPTION 'Email cannot be null or empty';
  END IF;
  
  -- Get user ID by email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = lower(trim(p_email));
  
  RETURN v_user_id;
END;
$$;