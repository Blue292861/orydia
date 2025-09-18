-- Create a function for admins to search user emails
CREATE OR REPLACE FUNCTION public.search_user_emails(p_query text)
RETURNS TABLE(email text) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Verify admin role
  IF NOT user_has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can search user emails';
  END IF;
  
  -- Validate input
  IF p_query IS NULL OR trim(p_query) = '' THEN
    RETURN;
  END IF;
  
  -- Return emails from auth.users that match the query
  RETURN QUERY
  SELECT au.email::text
  FROM auth.users au
  WHERE au.email ILIKE '%' || trim(p_query) || '%'
    AND au.email IS NOT NULL
    AND au.email_confirmed_at IS NOT NULL
  ORDER BY au.email
  LIMIT 10;
END;
$function$;