import { supabase } from '@/integrations/supabase/client';

export interface GuildMessage {
  id: string;
  guild_id: string;
  user_id: string;
  content: string;
  message_type: 'chat' | 'system';
  created_at: string;
  is_pinned: boolean;
  // Joined profile data
  profile?: {
    username: string | null;
    avatar_url: string | null;
    first_name: string | null;
  } | null;
}

export interface GuildAnnouncement {
  id: string;
  guild_id: string;
  author_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  // Joined profile data
  author_profile?: {
    username: string | null;
    avatar_url: string | null;
  } | null;
}

/**
 * Get messages for a guild
 */
export const getGuildMessages = async (guildId: string, limit = 50): Promise<GuildMessage[]> => {
  const { data: messagesData, error } = await supabase
    .from('guild_messages')
    .select('*')
    .eq('guild_id', guildId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !messagesData) {
    console.error('Error fetching messages:', error);
    return [];
  }

  // Fetch profiles
  const userIds = [...new Set(messagesData.map(m => m.user_id))];
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, first_name')
    .in('id', userIds);

  const profilesMap = new Map(
    (profilesData || []).map(p => [p.id, p])
  );

  return messagesData.map(msg => ({
    ...msg,
    message_type: msg.message_type as 'chat' | 'system',
    profile: profilesMap.get(msg.user_id) || null
  })).reverse(); // Return in chronological order
};

/**
 * Send a message to a guild
 */
export const sendGuildMessage = async (guildId: string, content: string): Promise<{ success: boolean; error?: string }> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Non authentifié' };
  }

  if (!content.trim()) {
    return { success: false, error: 'Message vide' };
  }

  if (content.length > 1000) {
    return { success: false, error: 'Message trop long (max 1000 caractères)' };
  }

  const { error } = await supabase
    .from('guild_messages')
    .insert({
      guild_id: guildId,
      user_id: user.id,
      content: content.trim(),
      message_type: 'chat'
    });

  if (error) {
    console.error('Error sending message:', error);
    return { success: false, error: 'Erreur lors de l\'envoi' };
  }

  return { success: true };
};

/**
 * Subscribe to real-time messages for a guild
 */
export const subscribeToGuildMessages = (
  guildId: string,
  onNewMessage: (message: GuildMessage) => void,
  onDeleteMessage?: (messageId: string) => void
) => {
  const channel = supabase
    .channel(`guild_messages:${guildId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'guild_messages',
        filter: `guild_id=eq.${guildId}`
      },
      async (payload) => {
        const newMessage = payload.new as any;
        
        // Fetch profile for the new message
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, first_name')
          .eq('id', newMessage.user_id)
          .single();

        onNewMessage({
          ...newMessage,
          message_type: newMessage.message_type as 'chat' | 'system',
          profile: profile || null
        });
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'guild_messages',
        filter: `guild_id=eq.${guildId}`
      },
      (payload) => {
        if (onDeleteMessage) {
          onDeleteMessage((payload.old as any).id);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Get announcements for a guild
 */
export const getGuildAnnouncements = async (guildId: string): Promise<GuildAnnouncement[]> => {
  const { data: announcementsData, error } = await supabase
    .from('guild_announcements')
    .select('*')
    .eq('guild_id', guildId)
    .order('created_at', { ascending: false });

  if (error || !announcementsData) {
    console.error('Error fetching announcements:', error);
    return [];
  }

  // Fetch author profiles
  const authorIds = [...new Set(announcementsData.map(a => a.author_id))];
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .in('id', authorIds);

  const profilesMap = new Map(
    (profilesData || []).map(p => [p.id, p])
  );

  return announcementsData.map(announcement => ({
    ...announcement,
    author_profile: profilesMap.get(announcement.author_id) || null
  }));
};

/**
 * Create an announcement (owner/admin only)
 */
export const createGuildAnnouncement = async (
  guildId: string,
  title: string,
  content: string
): Promise<{ success: boolean; error?: string }> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Non authentifié' };
  }

  if (!title.trim() || !content.trim()) {
    return { success: false, error: 'Titre et contenu requis' };
  }

  const { error } = await supabase
    .from('guild_announcements')
    .insert({
      guild_id: guildId,
      author_id: user.id,
      title: title.trim(),
      content: content.trim()
    });

  if (error) {
    console.error('Error creating announcement:', error);
    return { success: false, error: 'Erreur lors de la création' };
  }

  return { success: true };
};

/**
 * Delete an announcement
 */
export const deleteGuildAnnouncement = async (announcementId: string): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase
    .from('guild_announcements')
    .delete()
    .eq('id', announcementId);

  if (error) {
    console.error('Error deleting announcement:', error);
    return { success: false, error: 'Erreur lors de la suppression' };
  }

  return { success: true };
};

/**
 * Delete a message
 */
export const deleteGuildMessage = async (messageId: string): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase
    .from('guild_messages')
    .delete()
    .eq('id', messageId);

  if (error) {
    console.error('Error deleting message:', error);
    return { success: false, error: 'Erreur lors de la suppression' };
  }

  return { success: true };
};
