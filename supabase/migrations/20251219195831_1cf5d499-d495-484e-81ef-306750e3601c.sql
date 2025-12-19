-- ============================================
-- GUILD SYSTEM - Step 1
-- ============================================

-- 1. Create guilds table
CREATE TABLE public.guilds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slogan TEXT,
  banner_url TEXT,
  owner_id UUID NOT NULL,
  member_count INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  creation_cost INTEGER DEFAULT 13280,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create guild_members table
CREATE TABLE public.guild_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id) -- Un utilisateur ne peut être que dans une seule guilde
);

-- 3. Create index for faster lookups
CREATE INDEX idx_guild_members_guild_id ON public.guild_members(guild_id);
CREATE INDEX idx_guild_members_user_id ON public.guild_members(user_id);
CREATE INDEX idx_guilds_name ON public.guilds(name);
CREATE INDEX idx_guilds_owner ON public.guilds(owner_id);

-- 4. Enable RLS
ALTER TABLE public.guilds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_members ENABLE ROW LEVEL SECURITY;

-- 5. Create storage bucket for guild banners
INSERT INTO storage.buckets (id, name, public) VALUES ('guilds', 'guilds', true)
ON CONFLICT (id) DO NOTHING;

-- 6. RLS Policies for guilds table

-- Anyone can view active guilds (for searching/joining)
CREATE POLICY "Anyone can view active guilds"
ON public.guilds
FOR SELECT
USING (is_active = true);

-- Admins can manage all guilds
CREATE POLICY "Admins can manage all guilds"
ON public.guilds
FOR ALL
USING (user_has_role(auth.uid(), 'admin'::app_role));

-- Guild owners can update their own guild
CREATE POLICY "Owners can update their guild"
ON public.guilds
FOR UPDATE
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Authenticated users can create a guild
CREATE POLICY "Authenticated users can create guilds"
ON public.guilds
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- 7. RLS Policies for guild_members table

-- Anyone can view guild members (to see who is in a guild)
CREATE POLICY "Anyone can view guild members"
ON public.guild_members
FOR SELECT
USING (true);

-- Admins can manage all members
CREATE POLICY "Admins can manage all guild members"
ON public.guild_members
FOR ALL
USING (user_has_role(auth.uid(), 'admin'::app_role));

-- Users can insert themselves as members
CREATE POLICY "Users can join guilds"
ON public.guild_members
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can remove themselves from a guild
CREATE POLICY "Users can leave guilds"
ON public.guild_members
FOR DELETE
USING (auth.uid() = user_id);

-- Guild owners/admins can remove members
CREATE POLICY "Guild owners can remove members"
ON public.guild_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.guild_members gm
    WHERE gm.guild_id = guild_members.guild_id
    AND gm.user_id = auth.uid()
    AND gm.role IN ('owner', 'admin')
  )
);

-- 8. Storage policies for guilds bucket
CREATE POLICY "Authenticated users can upload guild banners"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'guilds' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view guild banners"
ON storage.objects FOR SELECT
USING (bucket_id = 'guilds');

CREATE POLICY "Guild owners can update their banners"
ON storage.objects FOR UPDATE
USING (bucket_id = 'guilds' AND auth.role() = 'authenticated');

CREATE POLICY "Guild owners can delete their banners"
ON storage.objects FOR DELETE
USING (bucket_id = 'guilds' AND auth.role() = 'authenticated');

-- 9. Function to update member count
CREATE OR REPLACE FUNCTION public.update_guild_member_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.guilds SET member_count = member_count + 1, updated_at = now()
    WHERE id = NEW.guild_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.guilds SET member_count = GREATEST(0, member_count - 1), updated_at = now()
    WHERE id = OLD.guild_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- 10. Trigger to auto-update member count
CREATE TRIGGER trigger_update_guild_member_count
AFTER INSERT OR DELETE ON public.guild_members
FOR EACH ROW
EXECUTE FUNCTION public.update_guild_member_count();

-- 11. Function to update guild updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_guild_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_guild_updated_at
BEFORE UPDATE ON public.guilds
FOR EACH ROW
EXECUTE FUNCTION public.update_guild_updated_at();