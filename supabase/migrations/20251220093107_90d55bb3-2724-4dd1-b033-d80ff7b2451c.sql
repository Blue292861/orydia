-- Create function to dissolve a guild (owner only)
CREATE OR REPLACE FUNCTION public.dissolve_guild(p_guild_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_owner_id UUID;
BEGIN
  -- Verify caller is the guild owner
  SELECT owner_id INTO v_owner_id
  FROM public.guilds
  WHERE id = p_guild_id;
  
  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Guild not found';
  END IF;
  
  IF v_owner_id != auth.uid() THEN
    RAISE EXCEPTION 'Only the guild owner can dissolve the guild';
  END IF;
  
  -- Delete related data in order (foreign keys)
  DELETE FROM public.guild_member_ranks WHERE guild_id = p_guild_id;
  DELETE FROM public.guild_vault_transactions WHERE guild_id = p_guild_id;
  DELETE FROM public.guild_vault_cards WHERE guild_id = p_guild_id;
  DELETE FROM public.guild_vault WHERE guild_id = p_guild_id;
  DELETE FROM public.guild_messages WHERE guild_id = p_guild_id;
  DELETE FROM public.guild_announcements WHERE guild_id = p_guild_id;
  DELETE FROM public.guild_challenge_progress WHERE guild_id = p_guild_id;
  DELETE FROM public.guild_ranks WHERE guild_id = p_guild_id;
  DELETE FROM public.guild_members WHERE guild_id = p_guild_id;
  
  -- Finally delete the guild itself
  DELETE FROM public.guilds WHERE id = p_guild_id;
  
  RETURN TRUE;
END;
$$;