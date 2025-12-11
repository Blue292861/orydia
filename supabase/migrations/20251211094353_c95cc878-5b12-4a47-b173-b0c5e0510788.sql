-- Table des récompenses configurées par niveau (admin)
CREATE TABLE public.level_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level INTEGER NOT NULL UNIQUE,
  orydors_reward INTEGER DEFAULT 0,
  xp_bonus INTEGER DEFAULT 0,
  item_rewards JSONB DEFAULT '[]'::jsonb,
  premium_days INTEGER DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des récompenses de niveau en attente pour chaque utilisateur
CREATE TABLE public.pending_level_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  level INTEGER NOT NULL,
  level_reward_id UUID NOT NULL REFERENCES public.level_rewards(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, level)
);

-- Index pour performance
CREATE INDEX idx_pending_level_rewards_user ON public.pending_level_rewards(user_id);
CREATE INDEX idx_level_rewards_level ON public.level_rewards(level);

-- Politiques RLS
ALTER TABLE public.level_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_level_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage level rewards" ON public.level_rewards
  FOR ALL USING (user_has_role(auth.uid(), 'admin'::app_role));
  
CREATE POLICY "Anyone can view active level rewards" ON public.level_rewards
  FOR SELECT USING (is_active = true);
  
CREATE POLICY "Users can view their pending rewards" ON public.pending_level_rewards
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "System can manage pending rewards" ON public.pending_level_rewards
  FOR ALL USING (true);