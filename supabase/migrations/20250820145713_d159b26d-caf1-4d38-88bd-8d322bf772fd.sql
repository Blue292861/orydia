-- Fix critical security issues identified by security scanner

-- 1. Fix the profiles table RLS policies - CRITICAL SECURITY FIX
-- Remove the public SELECT policy that exposes personal information
DROP POLICY IF EXISTS "Les profils publics sont visibles par tous." ON public.profiles;

-- Create secure policies for profiles table
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (user_has_role(auth.uid(), 'admin'::app_role));

-- 2. Fix functions with mutable search_path - SECURITY FIX
-- Update all functions to have secure search_path

CREATE OR REPLACE FUNCTION public.update_genre_preference(p_user_id uuid, p_genre text, p_reading_time_minutes integer DEFAULT 30)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.user_genre_preferences (user_id, genre, read_count, total_time_minutes, last_read_at)
  VALUES (p_user_id, p_genre, 1, p_reading_time_minutes, now())
  ON CONFLICT (user_id, genre)
  DO UPDATE SET
    read_count = user_genre_preferences.read_count + 1,
    total_time_minutes = user_genre_preferences.total_time_minutes + p_reading_time_minutes,
    last_read_at = now(),
    updated_at = now();
    
  -- Recalculate preference scores for this user
  UPDATE public.user_genre_preferences 
  SET preference_score = (
    read_count::DECIMAL / GREATEST(1, (
      SELECT SUM(read_count) FROM public.user_genre_preferences WHERE user_id = p_user_id
    ))
  ) * 100
  WHERE user_id = p_user_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_recommended_theme(p_user_id uuid)
 RETURNS ui_theme
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  top_genre TEXT;
  recommended_theme ui_theme;
BEGIN
  -- Get the user's most read genre
  SELECT genre INTO top_genre
  FROM public.user_genre_preferences
  WHERE user_id = p_user_id
  ORDER BY preference_score DESC, read_count DESC
  LIMIT 1;
  
  -- Map genres to themes
  recommended_theme := CASE
    WHEN top_genre IN ('Fantasy', 'Fantaisie', 'Medieval', 'Magic') THEN 'medieval_fantasy'
    WHEN top_genre IN ('Science Fiction', 'SF', 'Sci-Fi', 'Technology', 'Future') THEN 'science_fiction'
    WHEN top_genre IN ('Romance', 'Love', 'Romantic') THEN 'romance'
    WHEN top_genre IN ('Western', 'Cowboy', 'Far West') THEN 'western'
    WHEN top_genre IN ('Slice of Life', 'Daily Life', 'Contemporary', 'Realistic') THEN 'slice_of_life'
    ELSE 'default'
  END;
  
  RETURN recommended_theme;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_exponential_level(xp_points integer)
 RETURNS TABLE(level integer, current_xp integer, next_level_xp integer, level_title text)
 LANGUAGE sql
 IMMUTABLE
 SET search_path = public
AS $function$
  WITH level_calc AS (
    SELECT 
      CASE 
        WHEN xp_points < 100 THEN 1
        WHEN xp_points < 250 THEN 2
        WHEN xp_points < 450 THEN 3
        WHEN xp_points < 700 THEN 4
        WHEN xp_points < 1000 THEN 5
        WHEN xp_points < 1350 THEN 6
        WHEN xp_points < 1750 THEN 7
        WHEN xp_points < 2200 THEN 8
        WHEN xp_points < 2700 THEN 9
        WHEN xp_points < 3250 THEN 10
        WHEN xp_points < 3850 THEN 11
        WHEN xp_points < 4500 THEN 12
        WHEN xp_points < 5200 THEN 13
        WHEN xp_points < 5950 THEN 14
        WHEN xp_points < 6750 THEN 15
        WHEN xp_points < 7600 THEN 16
        WHEN xp_points < 8500 THEN 17
        WHEN xp_points < 9450 THEN 18
        WHEN xp_points < 10450 THEN 19
        ELSE LEAST(50, 20 + (xp_points - 10450) / 1000)
      END as calculated_level
  )
  SELECT 
    calculated_level,
    CASE calculated_level
      WHEN 1 THEN xp_points
      WHEN 2 THEN xp_points - 100
      WHEN 3 THEN xp_points - 250
      WHEN 4 THEN xp_points - 450
      WHEN 5 THEN xp_points - 700
      WHEN 6 THEN xp_points - 1000
      WHEN 7 THEN xp_points - 1350
      WHEN 8 THEN xp_points - 1750
      WHEN 9 THEN xp_points - 2200
      WHEN 10 THEN xp_points - 2700
      WHEN 11 THEN xp_points - 3250
      WHEN 12 THEN xp_points - 3850
      WHEN 13 THEN xp_points - 4500
      WHEN 14 THEN xp_points - 5200
      WHEN 15 THEN xp_points - 5950
      WHEN 16 THEN xp_points - 6750
      WHEN 17 THEN xp_points - 7600
      WHEN 18 THEN xp_points - 8500
      WHEN 19 THEN xp_points - 9450
      ELSE xp_points - (10450 + (calculated_level - 20) * 1000)
    END as current_level_xp,
    CASE calculated_level
      WHEN 1 THEN 100
      WHEN 2 THEN 150
      WHEN 3 THEN 200
      WHEN 4 THEN 250
      WHEN 5 THEN 300
      WHEN 6 THEN 350
      WHEN 7 THEN 400
      WHEN 8 THEN 450
      WHEN 9 THEN 500
      WHEN 10 THEN 550
      WHEN 11 THEN 600
      WHEN 12 THEN 650
      WHEN 13 THEN 700
      WHEN 14 THEN 750
      WHEN 15 THEN 800
      WHEN 16 THEN 850
      WHEN 17 THEN 900
      WHEN 18 THEN 950
      WHEN 19 THEN 1000
      ELSE 1000
    END as xp_for_next_level,
    CASE calculated_level
      WHEN 1 THEN 'Apprenti Lecteur'
      WHEN 2 THEN 'Lecteur Novice'
      WHEN 3 THEN 'Lecteur en Herbe'
      WHEN 4 THEN 'Passionné de Lecture'
      WHEN 5 THEN 'Dévoreur de Livres'
      WHEN 6 THEN 'Rat de Bibliothèque'
      WHEN 7 THEN 'Érudit Littéraire'
      WHEN 8 THEN 'Maître Lecteur'
      WHEN 9 THEN 'Sage des Mots'
      WHEN 10 THEN 'Bibliothécaire'
      WHEN 11 THEN 'Gardien du Savoir'
      WHEN 12 THEN 'Archiviste Légendaire'
      WHEN 13 THEN 'Maître des Récits'
      WHEN 14 THEN 'Oracle Littéraire'
      WHEN 15 THEN 'Seigneur des Livres'
      WHEN 16 THEN 'Titan de la Lecture'
      WHEN 17 THEN 'Légende Vivante'
      WHEN 18 THEN 'Divinité Littéraire'
      WHEN 19 THEN 'Empereur des Mots'
      ELSE 'Maître Absolu'
    END as title
  FROM level_calc;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_level(experience_points integer)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
 SET search_path = public
AS $function$
  SELECT level FROM calculate_exponential_level(experience_points);
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
begin
  insert into public.profiles (id, username, first_name, last_name, street_address, city, postal_code, country)
  values (
    new.id, 
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'street_address',
    new.raw_user_meta_data->>'city',
    new.raw_user_meta_data->>'postal_code',
    new.raw_user_meta_data->>'country'
  );
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.user_has_role(p_user_id uuid, p_role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = p_user_id AND role = p_role
  );
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_sale_price()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  IF NEW.is_on_sale = true AND (NEW.sale_price IS NULL OR NEW.sale_price >= NEW.price) THEN
    RAISE EXCEPTION 'Le prix soldé doit être inférieur au prix original';
  END IF;
  
  IF NEW.is_on_sale = false THEN
    NEW.sale_price = NULL;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 3. Add additional security constraints
-- Ensure user_id columns are not nullable where they should be required
ALTER TABLE public.user_stats ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.user_achievements ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.point_transactions ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.orders ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.ad_views ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.tensens_code_redemptions ALTER COLUMN user_id SET NOT NULL;

-- 4. Add index for better performance on security-critical queries
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role ON public.user_roles(user_id, role);
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);

-- 5. Ensure RLS is enabled on all user-related tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tensens_code_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- 6. Add security comments for audit purposes
COMMENT ON POLICY "Users can view their own profile" ON public.profiles IS 'Security fix: Replaced public access with user-only access to prevent data theft';
COMMENT ON POLICY "Admins can view all profiles" ON public.profiles IS 'Security fix: Admin access for legitimate administrative purposes only';