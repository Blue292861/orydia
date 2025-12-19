-- Recréer les vues avec SECURITY INVOKER explicite pour que les RLS s'appliquent
DROP VIEW IF EXISTS public.leaderboard_general;
DROP VIEW IF EXISTS public.leaderboard_guild;

-- Vue pour le classement général avec SECURITY INVOKER
CREATE VIEW public.leaderboard_general 
WITH (security_invoker = true)
AS
SELECT 
  us.user_id,
  p.username,
  p.avatar_url,
  p.first_name,
  p.last_name,
  us.total_points,
  COALESCE(array_length(us.books_read, 1), 0) AS books_read_count,
  us.level,
  us.experience_points,
  gm.guild_id,
  g.name AS guild_name,
  ROW_NUMBER() OVER (ORDER BY us.total_points DESC, us.experience_points DESC) AS rank
FROM user_stats us
JOIN profiles p ON p.id = us.user_id
LEFT JOIN guild_members gm ON gm.user_id = us.user_id
LEFT JOIN guilds g ON g.id = gm.guild_id AND g.is_active = true
WHERE p.username IS NOT NULL;

-- Vue pour le classement par guilde avec SECURITY INVOKER
CREATE VIEW public.leaderboard_guild 
WITH (security_invoker = true)
AS
SELECT 
  us.user_id,
  p.username,
  p.avatar_url,
  p.first_name,
  p.last_name,
  us.total_points,
  COALESCE(array_length(us.books_read, 1), 0) AS books_read_count,
  us.level,
  us.experience_points,
  gm.guild_id,
  g.name AS guild_name,
  ROW_NUMBER() OVER (PARTITION BY gm.guild_id ORDER BY us.total_points DESC, us.experience_points DESC) AS guild_rank
FROM user_stats us
JOIN profiles p ON p.id = us.user_id
JOIN guild_members gm ON gm.user_id = us.user_id
JOIN guilds g ON g.id = gm.guild_id AND g.is_active = true
WHERE p.username IS NOT NULL;

-- Permissions pour les utilisateurs authentifiés
GRANT SELECT ON public.leaderboard_general TO authenticated;
GRANT SELECT ON public.leaderboard_guild TO authenticated;