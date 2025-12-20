-- Fix member_count: change default from 1 to 0
ALTER TABLE public.guilds 
ALTER COLUMN member_count SET DEFAULT 0;

-- Recalculate member_count for all existing guilds based on actual member count
UPDATE public.guilds g
SET member_count = (
  SELECT COUNT(*) 
  FROM public.guild_members gm 
  WHERE gm.guild_id = g.id
);