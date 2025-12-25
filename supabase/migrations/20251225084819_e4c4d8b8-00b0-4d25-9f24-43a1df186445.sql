-- Create a function to add XP to user stats for reader oaths
CREATE OR REPLACE FUNCTION public.add_user_xp(p_user_id UUID, p_xp_amount INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE user_stats
  SET total_points = total_points + p_xp_amount
  WHERE user_id = p_user_id;
  
  -- If no row was updated, the user might not have stats yet
  IF NOT FOUND THEN
    INSERT INTO user_stats (user_id, total_points)
    VALUES (p_user_id, p_xp_amount)
    ON CONFLICT (user_id) DO UPDATE
    SET total_points = user_stats.total_points + p_xp_amount;
  END IF;
END;
$$;