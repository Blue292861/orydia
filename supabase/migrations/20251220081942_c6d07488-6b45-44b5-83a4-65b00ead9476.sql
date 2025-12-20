-- =============================================
-- GUILD VAULT AND RANKS SYSTEM
-- =============================================

-- Enum for guild rank types
CREATE TYPE public.guild_rank_type AS ENUM (
  'guild_leader',
  'treasurer',
  'reading_champion',
  'genre_champion',
  'lore_keeper',
  'dragon_slayer',
  'veteran',
  'elite',
  'member'
);

-- =============================================
-- TABLE: guild_ranks (rank definitions per guild)
-- =============================================
CREATE TABLE public.guild_ranks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  rank_type guild_rank_type NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '👤',
  color TEXT DEFAULT '#a78bfa',
  permissions JSONB DEFAULT '{"can_withdraw": false, "can_assign_ranks": false, "can_manage_announcements": false}'::jsonb,
  max_holders INTEGER, -- null = unlimited
  priority INTEGER DEFAULT 0, -- higher = more important
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(guild_id, rank_type)
);

-- =============================================
-- TABLE: guild_member_ranks (ranks assigned to members)
-- =============================================
CREATE TABLE public.guild_member_ranks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rank_id UUID NOT NULL REFERENCES public.guild_ranks(id) ON DELETE CASCADE,
  assigned_by UUID,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, rank_id)
);

-- =============================================
-- TABLE: guild_vault (main vault resources)
-- =============================================
CREATE TABLE public.guild_vault (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  orydors INTEGER DEFAULT 0 CHECK (orydors >= 0),
  aildor_keys INTEGER DEFAULT 0 CHECK (aildor_keys >= 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(guild_id)
);

-- =============================================
-- TABLE: guild_vault_cards (cards in vault)
-- =============================================
CREATE TABLE public.guild_vault_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  reward_type_id UUID NOT NULL REFERENCES public.reward_types(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1 CHECK (quantity >= 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(guild_id, reward_type_id)
);

-- =============================================
-- TABLE: guild_vault_transactions (audit log)
-- =============================================
CREATE TABLE public.guild_vault_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('deposit', 'withdraw', 'assign')),
  resource_type TEXT NOT NULL CHECK (resource_type IN ('orydors', 'aildor_key', 'card')),
  resource_id UUID, -- For cards, references reward_type_id
  quantity INTEGER NOT NULL,
  recipient_id UUID, -- For 'assign' action
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_guild_ranks_guild ON public.guild_ranks(guild_id);
CREATE INDEX idx_guild_member_ranks_guild ON public.guild_member_ranks(guild_id);
CREATE INDEX idx_guild_member_ranks_user ON public.guild_member_ranks(user_id);
CREATE INDEX idx_guild_vault_cards_guild ON public.guild_vault_cards(guild_id);
CREATE INDEX idx_guild_vault_transactions_guild ON public.guild_vault_transactions(guild_id);
CREATE INDEX idx_guild_vault_transactions_user ON public.guild_vault_transactions(user_id);
CREATE INDEX idx_guild_vault_transactions_created ON public.guild_vault_transactions(created_at DESC);

-- =============================================
-- FUNCTION: Check if user has a specific guild permission
-- =============================================
CREATE OR REPLACE FUNCTION public.has_guild_permission(
  p_user_id UUID,
  p_guild_id UUID,
  p_permission TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_owner BOOLEAN;
  v_has_permission BOOLEAN;
BEGIN
  -- Check if user is the guild owner (always has all permissions)
  SELECT owner_id = p_user_id INTO v_is_owner
  FROM public.guilds
  WHERE id = p_guild_id;
  
  IF v_is_owner THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user has a rank with the specified permission
  SELECT EXISTS (
    SELECT 1
    FROM public.guild_member_ranks gmr
    JOIN public.guild_ranks gr ON gr.id = gmr.rank_id
    WHERE gmr.user_id = p_user_id
      AND gmr.guild_id = p_guild_id
      AND gr.is_active = true
      AND (gr.permissions->>p_permission)::boolean = true
  ) INTO v_has_permission;
  
  RETURN COALESCE(v_has_permission, FALSE);
END;
$$;

-- =============================================
-- FUNCTION: Check if user is guild leader
-- =============================================
CREATE OR REPLACE FUNCTION public.is_guild_leader(p_user_id UUID, p_guild_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.guilds
    WHERE id = p_guild_id AND owner_id = p_user_id
  );
END;
$$;

-- =============================================
-- FUNCTION: Initialize guild ranks when guild is created
-- =============================================
CREATE OR REPLACE FUNCTION public.initialize_guild_ranks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create default ranks for the guild
  INSERT INTO public.guild_ranks (guild_id, rank_type, display_name, description, icon, color, permissions, max_holders, priority)
  VALUES
    (NEW.id, 'guild_leader', 'Chef de Guilde', 'Leader suprême de la guilde', '👑', '#fbbf24', 
     '{"can_withdraw": true, "can_assign_ranks": true, "can_manage_announcements": true}'::jsonb, 1, 100),
    (NEW.id, 'treasurer', 'Gardien des Trésors', 'Gestionnaire du coffre de guilde', '🔐', '#60a5fa',
     '{"can_withdraw": true, "can_assign_ranks": false, "can_manage_announcements": false}'::jsonb, 2, 90),
    (NEW.id, 'reading_champion', 'Champion de Lecture', 'Le lecteur le plus assidu', '📚', '#4ade80',
     '{"can_withdraw": false, "can_assign_ranks": false, "can_manage_announcements": false}'::jsonb, 1, 80),
    (NEW.id, 'genre_champion', 'Champion de Genre', 'Expert d''un genre littéraire', '🎭', '#f472b6',
     '{"can_withdraw": false, "can_assign_ranks": false, "can_manage_announcements": false}'::jsonb, 5, 70),
    (NEW.id, 'lore_keeper', 'Gardien du Savoir', 'Historien et érudit de la guilde', '📜', '#a78bfa',
     '{"can_withdraw": false, "can_assign_ranks": false, "can_manage_announcements": true}'::jsonb, 2, 60),
    (NEW.id, 'dragon_slayer', 'Pourfendeur de Dragons', 'Héros légendaire ayant accompli de grands exploits', '🐉', '#ef4444',
     '{"can_withdraw": false, "can_assign_ranks": false, "can_manage_announcements": false}'::jsonb, 3, 50),
    (NEW.id, 'veteran', 'Vétéran', 'Membre expérimenté de la guilde', '⚔️', '#6b7280',
     '{"can_withdraw": false, "can_assign_ranks": false, "can_manage_announcements": false}'::jsonb, NULL, 30),
    (NEW.id, 'elite', 'Élite', 'Membre d''élite reconnu pour sa contribution', '⭐', '#eab308',
     '{"can_withdraw": false, "can_assign_ranks": false, "can_manage_announcements": false}'::jsonb, 10, 40),
    (NEW.id, 'member', 'Membre', 'Membre de la guilde', '👤', '#9ca3af',
     '{"can_withdraw": false, "can_assign_ranks": false, "can_manage_announcements": false}'::jsonb, NULL, 10);

  -- Create the guild vault
  INSERT INTO public.guild_vault (guild_id, orydors, aildor_keys)
  VALUES (NEW.id, 0, 0);

  -- Assign guild_leader rank to the owner
  INSERT INTO public.guild_member_ranks (guild_id, user_id, rank_id, assigned_by)
  SELECT NEW.id, NEW.owner_id, gr.id, NEW.owner_id
  FROM public.guild_ranks gr
  WHERE gr.guild_id = NEW.id AND gr.rank_type = 'guild_leader';

  RETURN NEW;
END;
$$;

-- Trigger to initialize ranks when guild is created
CREATE TRIGGER trigger_initialize_guild_ranks
  AFTER INSERT ON public.guilds
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_guild_ranks();

-- =============================================
-- FUNCTION: Transfer guild leadership
-- =============================================
CREATE OR REPLACE FUNCTION public.transfer_guild_leadership(
  p_guild_id UUID,
  p_new_leader_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_leader_id UUID;
  v_leader_rank_id UUID;
BEGIN
  -- Get current leader
  SELECT owner_id INTO v_old_leader_id
  FROM public.guilds
  WHERE id = p_guild_id;
  
  -- Verify caller is current leader
  IF v_old_leader_id != auth.uid() THEN
    RAISE EXCEPTION 'Only the current leader can transfer leadership';
  END IF;
  
  -- Verify new leader is a guild member
  IF NOT EXISTS (
    SELECT 1 FROM public.guild_members
    WHERE guild_id = p_guild_id AND user_id = p_new_leader_id
  ) THEN
    RAISE EXCEPTION 'New leader must be a guild member';
  END IF;
  
  -- Get leader rank id
  SELECT id INTO v_leader_rank_id
  FROM public.guild_ranks
  WHERE guild_id = p_guild_id AND rank_type = 'guild_leader';
  
  -- Remove leader rank from old leader
  DELETE FROM public.guild_member_ranks
  WHERE guild_id = p_guild_id AND user_id = v_old_leader_id AND rank_id = v_leader_rank_id;
  
  -- Assign leader rank to new leader
  INSERT INTO public.guild_member_ranks (guild_id, user_id, rank_id, assigned_by)
  VALUES (p_guild_id, p_new_leader_id, v_leader_rank_id, v_old_leader_id)
  ON CONFLICT (user_id, rank_id) DO NOTHING;
  
  -- Update guild owner
  UPDATE public.guilds
  SET owner_id = p_new_leader_id, updated_at = now()
  WHERE id = p_guild_id;
  
  RETURN TRUE;
END;
$$;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.guild_ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_member_ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_vault_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_vault_transactions ENABLE ROW LEVEL SECURITY;

-- guild_ranks policies
CREATE POLICY "Anyone can view active guild ranks"
  ON public.guild_ranks FOR SELECT
  USING (is_active = true);

CREATE POLICY "Guild leaders can manage ranks"
  ON public.guild_ranks FOR ALL
  USING (is_guild_leader(auth.uid(), guild_id))
  WITH CHECK (is_guild_leader(auth.uid(), guild_id));

CREATE POLICY "Admins can manage all guild ranks"
  ON public.guild_ranks FOR ALL
  USING (user_has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (user_has_role(auth.uid(), 'admin'::app_role));

-- guild_member_ranks policies
CREATE POLICY "Anyone can view member ranks"
  ON public.guild_member_ranks FOR SELECT
  USING (true);

CREATE POLICY "Guild leaders can assign ranks"
  ON public.guild_member_ranks FOR INSERT
  WITH CHECK (is_guild_leader(auth.uid(), guild_id));

CREATE POLICY "Guild leaders can remove ranks"
  ON public.guild_member_ranks FOR DELETE
  USING (is_guild_leader(auth.uid(), guild_id));

CREATE POLICY "Admins can manage all member ranks"
  ON public.guild_member_ranks FOR ALL
  USING (user_has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (user_has_role(auth.uid(), 'admin'::app_role));

-- guild_vault policies
CREATE POLICY "Guild members can view their vault"
  ON public.guild_vault FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.guild_members
      WHERE guild_members.guild_id = guild_vault.guild_id
        AND guild_members.user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage vault"
  ON public.guild_vault FOR ALL
  USING (true)
  WITH CHECK (true);

-- guild_vault_cards policies
CREATE POLICY "Guild members can view vault cards"
  ON public.guild_vault_cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.guild_members
      WHERE guild_members.guild_id = guild_vault_cards.guild_id
        AND guild_members.user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage vault cards"
  ON public.guild_vault_cards FOR ALL
  USING (true)
  WITH CHECK (true);

-- guild_vault_transactions policies
CREATE POLICY "Guild members can view transactions"
  ON public.guild_vault_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.guild_members
      WHERE guild_members.guild_id = guild_vault_transactions.guild_id
        AND guild_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can insert transactions"
  ON public.guild_vault_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all transactions"
  ON public.guild_vault_transactions FOR ALL
  USING (user_has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (user_has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- UPDATED_AT TRIGGERS
-- =============================================
CREATE TRIGGER update_guild_ranks_updated_at
  BEFORE UPDATE ON public.guild_ranks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_guild_updated_at();

CREATE TRIGGER update_guild_vault_updated_at
  BEFORE UPDATE ON public.guild_vault
  FOR EACH ROW
  EXECUTE FUNCTION public.update_guild_updated_at();

CREATE TRIGGER update_guild_vault_cards_updated_at
  BEFORE UPDATE ON public.guild_vault_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_guild_updated_at();