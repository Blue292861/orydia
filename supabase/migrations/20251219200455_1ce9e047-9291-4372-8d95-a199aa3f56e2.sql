-- ============================================
-- GUILD SYSTEM - Step 2: Messages & Announcements
-- ============================================

-- 1. Create guild_messages table for real-time chat
CREATE TABLE public.guild_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'chat' CHECK (message_type IN ('chat', 'system')),
  created_at TIMESTAMPTZ DEFAULT now(),
  is_pinned BOOLEAN DEFAULT false
);

-- 2. Create guild_announcements table for bulletin board
CREATE TABLE public.guild_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create indexes for performance
CREATE INDEX idx_guild_messages_guild_id ON public.guild_messages(guild_id);
CREATE INDEX idx_guild_messages_created_at ON public.guild_messages(created_at DESC);
CREATE INDEX idx_guild_announcements_guild_id ON public.guild_announcements(guild_id);
CREATE INDEX idx_guild_announcements_created_at ON public.guild_announcements(created_at DESC);

-- 4. Enable RLS
ALTER TABLE public.guild_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_announcements ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for guild_messages

-- Members can view messages of their guild
CREATE POLICY "Members can view guild messages"
ON public.guild_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.guild_members gm
    WHERE gm.guild_id = guild_messages.guild_id
    AND gm.user_id = auth.uid()
  )
);

-- Members can send messages to their guild
CREATE POLICY "Members can send guild messages"
ON public.guild_messages
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.guild_members gm
    WHERE gm.guild_id = guild_messages.guild_id
    AND gm.user_id = auth.uid()
  )
);

-- Users can delete their own messages
CREATE POLICY "Users can delete own messages"
ON public.guild_messages
FOR DELETE
USING (auth.uid() = user_id);

-- Admins can manage all messages
CREATE POLICY "Admins can manage guild messages"
ON public.guild_messages
FOR ALL
USING (user_has_role(auth.uid(), 'admin'::app_role));

-- 6. RLS Policies for guild_announcements

-- Members can view announcements of their guild
CREATE POLICY "Members can view guild announcements"
ON public.guild_announcements
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.guild_members gm
    WHERE gm.guild_id = guild_announcements.guild_id
    AND gm.user_id = auth.uid()
  )
);

-- Only guild owners/admins can create announcements
CREATE POLICY "Guild owners can create announcements"
ON public.guild_announcements
FOR INSERT
WITH CHECK (
  auth.uid() = author_id AND
  EXISTS (
    SELECT 1 FROM public.guild_members gm
    WHERE gm.guild_id = guild_announcements.guild_id
    AND gm.user_id = auth.uid()
    AND gm.role IN ('owner', 'admin')
  )
);

-- Only guild owners/admins can update announcements
CREATE POLICY "Guild owners can update announcements"
ON public.guild_announcements
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.guild_members gm
    WHERE gm.guild_id = guild_announcements.guild_id
    AND gm.user_id = auth.uid()
    AND gm.role IN ('owner', 'admin')
  )
);

-- Only guild owners/admins can delete announcements
CREATE POLICY "Guild owners can delete announcements"
ON public.guild_announcements
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.guild_members gm
    WHERE gm.guild_id = guild_announcements.guild_id
    AND gm.user_id = auth.uid()
    AND gm.role IN ('owner', 'admin')
  )
);

-- Admins can manage all announcements
CREATE POLICY "Admins can manage guild announcements"
ON public.guild_announcements
FOR ALL
USING (user_has_role(auth.uid(), 'admin'::app_role));

-- 7. Enable realtime for guild_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.guild_messages;