-- Fix remaining critical security issue: Security Definer View

-- 1. Check if user_level_info is a view and drop it if it's causing security issues
DROP VIEW IF EXISTS public.user_level_info;

-- 2. Recreate user_level_info as a secure view without SECURITY DEFINER
-- or as a table with proper RLS policies
CREATE TABLE IF NOT EXISTS public.user_level_info (
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    experience_points integer DEFAULT 0,
    total_points integer DEFAULT 0,
    level integer DEFAULT 1,
    current_xp integer DEFAULT 0,
    next_level_xp integer DEFAULT 100,
    level_title text DEFAULT 'Apprenti Lecteur',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (user_id)
);

-- Enable RLS on the new table
ALTER TABLE public.user_level_info ENABLE ROW LEVEL SECURITY;

-- Create secure RLS policies for user_level_info
CREATE POLICY "Users can view their own level info"
ON public.user_level_info
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own level info"
ON public.user_level_info
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own level info"
ON public.user_level_info
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all level info"
ON public.user_level_info
FOR SELECT
USING (user_has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all level info"
ON public.user_level_info
FOR ALL
USING (user_has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (user_has_role(auth.uid(), 'admin'::app_role));

-- 3. Create a secure function to sync user stats with level info
CREATE OR REPLACE FUNCTION public.sync_user_level_info()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Upsert user level info based on user stats
  INSERT INTO public.user_level_info (
    user_id, 
    experience_points, 
    total_points, 
    level, 
    current_xp, 
    next_level_xp, 
    level_title,
    updated_at
  )
  SELECT 
    us.user_id,
    us.experience_points,
    us.total_points,
    cel.level,
    cel.current_xp,
    cel.next_level_xp,
    cel.level_title,
    now()
  FROM public.user_stats us
  CROSS JOIN LATERAL public.calculate_exponential_level(us.experience_points) cel
  ON CONFLICT (user_id) 
  DO UPDATE SET
    experience_points = EXCLUDED.experience_points,
    total_points = EXCLUDED.total_points,
    level = EXCLUDED.level,
    current_xp = EXCLUDED.current_xp,
    next_level_xp = EXCLUDED.next_level_xp,
    level_title = EXCLUDED.level_title,
    updated_at = EXCLUDED.updated_at;
END;
$function$;

-- 4. Create trigger to auto-sync when user_stats changes
CREATE OR REPLACE FUNCTION public.trigger_sync_user_level_info()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Update or insert the corresponding user level info
  WITH level_data AS (
    SELECT * FROM public.calculate_exponential_level(NEW.experience_points)
  )
  INSERT INTO public.user_level_info (
    user_id, 
    experience_points, 
    total_points, 
    level, 
    current_xp, 
    next_level_xp, 
    level_title,
    updated_at
  )
  SELECT 
    NEW.user_id,
    NEW.experience_points,
    NEW.total_points,
    ld.level,
    ld.current_xp,
    ld.next_level_xp,
    ld.level_title,
    now()
  FROM level_data ld
  ON CONFLICT (user_id) 
  DO UPDATE SET
    experience_points = EXCLUDED.experience_points,
    total_points = EXCLUDED.total_points,
    level = EXCLUDED.level,
    current_xp = EXCLUDED.current_xp,
    next_level_xp = EXCLUDED.next_level_xp,
    level_title = EXCLUDED.level_title,
    updated_at = EXCLUDED.updated_at;
    
  RETURN NEW;
END;
$function$;

-- Create the trigger
DROP TRIGGER IF EXISTS sync_user_level_info_trigger ON public.user_stats;
CREATE TRIGGER sync_user_level_info_trigger
AFTER INSERT OR UPDATE ON public.user_stats
FOR EACH ROW
EXECUTE FUNCTION public.trigger_sync_user_level_info();

-- 5. Initialize existing data
SELECT public.sync_user_level_info();

-- 6. Add security comments
COMMENT ON TABLE public.user_level_info IS 'Secure user level information table with proper RLS policies';
COMMENT ON FUNCTION public.sync_user_level_info() IS 'Secure function to synchronize user level data';
COMMENT ON FUNCTION public.trigger_sync_user_level_info() IS 'Trigger function to auto-sync user level info when stats change';