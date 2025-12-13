-- Table de configuration des coffres quotidiens par période
CREATE TABLE public.daily_chest_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  min_orydors INTEGER NOT NULL DEFAULT 10,
  max_orydors INTEGER NOT NULL DEFAULT 100,
  item_pool JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des réclamations de coffres quotidiens
CREATE TABLE public.daily_chest_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  config_id UUID REFERENCES public.daily_chest_configs(id) ON DELETE SET NULL,
  claimed_at TIMESTAMPTZ DEFAULT now(),
  orydors_won INTEGER NOT NULL,
  item_won_id UUID REFERENCES public.reward_types(id) ON DELETE SET NULL,
  item_quantity INTEGER DEFAULT 1,
  claim_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Index pour vérifier rapidement si un utilisateur a réclamé aujourd'hui
CREATE UNIQUE INDEX idx_daily_chest_claims_user_date ON public.daily_chest_claims (user_id, claim_date);

-- Index pour trouver la config active par date
CREATE INDEX idx_daily_chest_configs_dates ON public.daily_chest_configs (start_date, end_date, is_active);

-- Enable RLS
ALTER TABLE public.daily_chest_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_chest_claims ENABLE ROW LEVEL SECURITY;

-- Policies pour daily_chest_configs
CREATE POLICY "Admins can manage daily chest configs"
ON public.daily_chest_configs
FOR ALL
USING (public.user_has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Users can view active daily chest configs"
ON public.daily_chest_configs
FOR SELECT
USING (is_active = true);

-- Policies pour daily_chest_claims
CREATE POLICY "Users can view their own claims"
ON public.daily_chest_claims
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own claims"
ON public.daily_chest_claims
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Trigger pour updated_at
CREATE TRIGGER update_daily_chest_configs_updated_at
BEFORE UPDATE ON public.daily_chest_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();