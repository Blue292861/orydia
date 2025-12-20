-- Update leaderboard views to include premium status
DROP VIEW IF EXISTS public.leaderboard_general;
CREATE VIEW public.leaderboard_general AS
SELECT 
  us.user_id,
  p.username,
  p.avatar_url,
  p.first_name,
  p.last_name,
  us.total_points,
  us.books_read as books_read_count,
  us.level,
  us.experience_points,
  gm.guild_id,
  g.name as guild_name,
  COALESCE(s.subscribed, false) as is_premium,
  ROW_NUMBER() OVER (ORDER BY us.total_points DESC, us.experience_points DESC) AS rank
FROM user_stats us
JOIN profiles p ON p.id = us.user_id
LEFT JOIN guild_members gm ON gm.user_id = us.user_id
LEFT JOIN guilds g ON g.id = gm.guild_id
LEFT JOIN subscribers s ON s.user_id = us.user_id
WHERE p.username IS NOT NULL
  AND NOT public.is_admin(us.user_id);

DROP VIEW IF EXISTS public.leaderboard_guild;
CREATE VIEW public.leaderboard_guild AS
SELECT 
  us.user_id,
  p.username,
  p.avatar_url,
  p.first_name,
  p.last_name,
  us.total_points,
  us.books_read as books_read_count,
  us.level,
  us.experience_points,
  gm.guild_id,
  g.name as guild_name,
  COALESCE(s.subscribed, false) as is_premium,
  ROW_NUMBER() OVER (PARTITION BY gm.guild_id ORDER BY us.total_points DESC, us.experience_points DESC) AS guild_rank
FROM user_stats us
JOIN profiles p ON p.id = us.user_id
JOIN guild_members gm ON gm.user_id = us.user_id
JOIN guilds g ON g.id = gm.guild_id
LEFT JOIN subscribers s ON s.user_id = us.user_id
WHERE p.username IS NOT NULL
  AND NOT public.is_admin(us.user_id);