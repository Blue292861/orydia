import { supabase } from '@/integrations/supabase/client';
import { Guild, GuildMember, CreateGuildData, GuildSearchResult } from '@/types/Guild';

const GUILD_CREATION_COST = 13280;

/**
 * Get the current user's guild membership
 */
export const getMyGuild = async (): Promise<{ guild: Guild; membership: GuildMember } | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membershipData, error: memberError } = await supabase
    .from('guild_members')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (memberError) {
    console.error('Error fetching membership:', memberError);
    return null;
  }

  if (!membershipData) return null;

  const { data: guildData, error: guildError } = await supabase
    .from('guilds')
    .select('*')
    .eq('id', membershipData.guild_id)
    .single();

  if (guildError || !guildData) {
    console.error('Error fetching guild:', guildError);
    return null;
  }

  return {
    guild: guildData as Guild,
    membership: {
      ...membershipData,
      role: membershipData.role as 'owner' | 'admin' | 'member'
    }
  };
};

/**
 * Get guild info by ID
 */
export const getGuildById = async (guildId: string): Promise<Guild | null> => {
  const { data, error } = await supabase
    .from('guilds')
    .select('*')
    .eq('id', guildId)
    .single();

  if (error) {
    console.error('Error fetching guild:', error);
    return null;
  }

  return data as Guild;
};

/**
 * Get guild members with profile info
 */
export const getGuildMembers = async (guildId: string): Promise<GuildMember[]> => {
  const { data: membersData, error: membersError } = await supabase
    .from('guild_members')
    .select('*')
    .eq('guild_id', guildId)
    .order('joined_at', { ascending: true });

  if (membersError || !membersData) {
    console.error('Error fetching members:', membersError);
    return [];
  }

  // Fetch profiles for all members
  const userIds = membersData.map(m => m.user_id);
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, first_name, last_name')
    .in('id', userIds);

  const profilesMap = new Map(
    (profilesData || []).map(p => [p.id, p])
  );

  return membersData.map(member => ({
    ...member,
    role: member.role as 'owner' | 'admin' | 'member',
    profile: profilesMap.get(member.user_id) || null
  }));
};

/**
 * Search for guilds by name
 */
export const searchGuilds = async (query: string): Promise<GuildSearchResult[]> => {
  const { data, error } = await supabase
    .from('guilds')
    .select('id, name, slogan, banner_url, member_count, owner_id')
    .eq('is_active', true)
    .ilike('name', `%${query}%`)
    .order('member_count', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error searching guilds:', error);
    return [];
  }

  // Fetch owner usernames
  const ownerIds = data.map(g => g.owner_id);
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('id, username')
    .in('id', ownerIds);

  const profilesMap = new Map(
    (profilesData || []).map(p => [p.id, p.username])
  );

  return data.map(guild => ({
    id: guild.id,
    name: guild.name,
    slogan: guild.slogan,
    banner_url: guild.banner_url,
    member_count: guild.member_count,
    owner_username: profilesMap.get(guild.owner_id) || null
  }));
};

/**
 * Get all guilds (for browsing)
 */
export const getAllGuilds = async (): Promise<GuildSearchResult[]> => {
  const { data, error } = await supabase
    .from('guilds')
    .select('id, name, slogan, banner_url, member_count, owner_id')
    .eq('is_active', true)
    .order('member_count', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching guilds:', error);
    return [];
  }

  // Fetch owner usernames
  const ownerIds = data.map(g => g.owner_id);
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('id, username')
    .in('id', ownerIds);

  const profilesMap = new Map(
    (profilesData || []).map(p => [p.id, p.username])
  );

  return data.map(guild => ({
    id: guild.id,
    name: guild.name,
    slogan: guild.slogan,
    banner_url: guild.banner_url,
    member_count: guild.member_count,
    owner_username: profilesMap.get(guild.owner_id) || null
  }));
};

/**
 * Create a new guild
 */
export const createGuild = async (
  guildData: CreateGuildData,
  currentPoints: number
): Promise<{ success: boolean; error?: string; guild?: Guild }> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Non authentifié' };
  }

  // Check if user already has a guild
  const existingMembership = await getMyGuild();
  if (existingMembership) {
    return { success: false, error: 'Vous êtes déjà membre d\'une guilde' };
  }

  // Check if user has enough points
  if (currentPoints < GUILD_CREATION_COST) {
    return { success: false, error: `Vous avez besoin de ${GUILD_CREATION_COST} Orydors pour créer une guilde` };
  }

  // Check if name is already taken
  const { data: existingGuild } = await supabase
    .from('guilds')
    .select('id')
    .eq('name', guildData.name)
    .maybeSingle();

  if (existingGuild) {
    return { success: false, error: 'Ce nom de guilde est déjà pris' };
  }

  let bannerUrl: string | null = null;

  // Upload banner if provided
  if (guildData.bannerFile) {
    const fileExt = guildData.bannerFile.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('guilds')
      .upload(`banners/${fileName}`, guildData.bannerFile);

    if (uploadError) {
      console.error('Error uploading banner:', uploadError);
    } else if (uploadData) {
      const { data: { publicUrl } } = supabase.storage
        .from('guilds')
        .getPublicUrl(`banners/${fileName}`);
      bannerUrl = publicUrl;
    }
  }

  // Create the guild
  const { data: newGuild, error: createError } = await supabase
    .from('guilds')
    .insert({
      name: guildData.name,
      slogan: guildData.slogan || null,
      banner_url: bannerUrl,
      owner_id: user.id
    })
    .select()
    .single();

  if (createError || !newGuild) {
    console.error('Error creating guild:', createError);
    return { success: false, error: 'Erreur lors de la création de la guilde' };
  }

  // Add owner as member
  const { error: memberError } = await supabase
    .from('guild_members')
    .insert({
      guild_id: newGuild.id,
      user_id: user.id,
      role: 'owner'
    });

  if (memberError) {
    console.error('Error adding owner as member:', memberError);
    // Rollback guild creation
    await supabase.from('guilds').delete().eq('id', newGuild.id);
    return { success: false, error: 'Erreur lors de la création de la guilde' };
  }

  // Deduct points via edge function
  const { error: pointsError } = await supabase.functions.invoke('award-points', {
    body: {
      user_id: user.id,
      points: -GUILD_CREATION_COST,
      transaction_type: 'guild_creation',
      reference_id: newGuild.id,
      description: `Création de la guilde "${guildData.name}"`,
      source_app: 'main_app'
    }
  });

  if (pointsError) {
    console.error('Error deducting points:', pointsError);
    // Note: Guild is created but points weren't deducted - may need admin intervention
  }

  return { success: true, guild: newGuild as Guild };
};

/**
 * Join an existing guild
 */
export const joinGuild = async (guildId: string): Promise<{ success: boolean; error?: string }> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Non authentifié' };
  }

  // Check if user already has a guild
  const existingMembership = await getMyGuild();
  if (existingMembership) {
    return { success: false, error: 'Vous êtes déjà membre d\'une guilde. Quittez-la d\'abord.' };
  }

  // Join the guild
  const { error } = await supabase
    .from('guild_members')
    .insert({
      guild_id: guildId,
      user_id: user.id,
      role: 'member'
    });

  if (error) {
    console.error('Error joining guild:', error);
    if (error.code === '23505') { // Unique violation
      return { success: false, error: 'Vous êtes déjà membre d\'une guilde' };
    }
    return { success: false, error: 'Erreur lors de l\'adhésion à la guilde' };
  }

  return { success: true };
};

/**
 * Leave current guild
 */
export const leaveGuild = async (): Promise<{ success: boolean; error?: string }> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Non authentifié' };
  }

  // Check if user is owner
  const membership = await getMyGuild();
  if (!membership) {
    return { success: false, error: 'Vous n\'êtes membre d\'aucune guilde' };
  }

  if (membership.membership.role === 'owner') {
    // Check if there are other members
    const members = await getGuildMembers(membership.guild.id);
    if (members.length > 1) {
      return { success: false, error: 'Transférez la propriété à un autre membre avant de quitter' };
    }
    
    // If owner is alone, delete the guild
    const { error: deleteError } = await supabase
      .from('guilds')
      .delete()
      .eq('id', membership.guild.id);

    if (deleteError) {
      console.error('Error deleting guild:', deleteError);
      return { success: false, error: 'Erreur lors de la suppression de la guilde' };
    }

    return { success: true };
  }

  // Regular member - just leave
  const { error } = await supabase
    .from('guild_members')
    .delete()
    .eq('user_id', user.id);

  if (error) {
    console.error('Error leaving guild:', error);
    return { success: false, error: 'Erreur lors du départ de la guilde' };
  }

  return { success: true };
};

/**
 * Update guild info (owner only)
 */
export const updateGuild = async (
  guildId: string,
  updates: { name?: string; slogan?: string; bannerFile?: File }
): Promise<{ success: boolean; error?: string }> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Non authentifié' };
  }

  const updateData: Partial<Guild> = {};
  
  if (updates.name) updateData.name = updates.name;
  if (updates.slogan !== undefined) updateData.slogan = updates.slogan;

  // Upload new banner if provided
  if (updates.bannerFile) {
    const fileExt = updates.bannerFile.name.split('.').pop();
    const fileName = `${guildId}-${Date.now()}.${fileExt}`;
    
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('guilds')
      .upload(`banners/${fileName}`, updates.bannerFile);

    if (!uploadError && uploadData) {
      const { data: { publicUrl } } = supabase.storage
        .from('guilds')
        .getPublicUrl(`banners/${fileName}`);
      updateData.banner_url = publicUrl;
    }
  }

  const { error } = await supabase
    .from('guilds')
    .update(updateData)
    .eq('id', guildId)
    .eq('owner_id', user.id); // Ensure only owner can update

  if (error) {
    console.error('Error updating guild:', error);
    return { success: false, error: 'Erreur lors de la mise à jour' };
  }

  return { success: true };
};

export const GUILD_COST = GUILD_CREATION_COST;
