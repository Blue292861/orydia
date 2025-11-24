-- Phase 1: Create reward system tables

-- Table: reward_types (types de récompenses configurables)
CREATE TABLE IF NOT EXISTS public.reward_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('currency', 'fragment', 'card', 'item')),
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  image_url TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: loot_tables (configuration des drops par livre)
CREATE TABLE IF NOT EXISTS public.loot_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
  chest_type TEXT NOT NULL CHECK (chest_type IN ('silver', 'gold')),
  reward_type_id UUID REFERENCES public.reward_types(id),
  drop_chance_percentage NUMERIC(5,2) NOT NULL CHECK (drop_chance_percentage >= 0 AND drop_chance_percentage <= 100),
  min_quantity INTEGER DEFAULT 1 CHECK (min_quantity >= 1),
  max_quantity INTEGER DEFAULT 1 CHECK (max_quantity >= min_quantity),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: user_inventory (inventaire utilisateur)
CREATE TABLE IF NOT EXISTS public.user_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  reward_type_id UUID REFERENCES public.reward_types(id),
  quantity INTEGER DEFAULT 0 CHECK (quantity >= 0),
  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, reward_type_id)
);

-- Table: chest_openings (historique des coffres ouverts)
CREATE TABLE IF NOT EXISTS public.chest_openings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  book_id UUID REFERENCES public.books(id),
  chest_type TEXT NOT NULL CHECK (chest_type IN ('silver', 'gold')),
  rewards_obtained JSONB NOT NULL,
  opened_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: gem_fragments (fragments de joyaux pour premium)
CREATE TABLE IF NOT EXISTS public.gem_fragments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  fragment_count INTEGER DEFAULT 0 CHECK (fragment_count >= 0),
  premium_months_claimed INTEGER DEFAULT 0 CHECK (premium_months_claimed >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.reward_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loot_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chest_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gem_fragments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reward_types
CREATE POLICY "Anyone can view reward types" 
  ON public.reward_types FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage reward types" 
  ON public.reward_types FOR ALL 
  USING (user_has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for loot_tables
CREATE POLICY "Admins can view loot tables" 
  ON public.loot_tables FOR SELECT 
  USING (user_has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage loot tables" 
  ON public.loot_tables FOR ALL 
  USING (user_has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_inventory
CREATE POLICY "Users can view own inventory" 
  ON public.user_inventory FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage inventory" 
  ON public.user_inventory FOR ALL 
  USING (true);

-- RLS Policies for chest_openings
CREATE POLICY "Users can view own chest history" 
  ON public.chest_openings FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert chest openings" 
  ON public.chest_openings FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can view all chest openings" 
  ON public.chest_openings FOR SELECT 
  USING (user_has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for gem_fragments
CREATE POLICY "Users can view own gem fragments" 
  ON public.gem_fragments FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage gem fragments" 
  ON public.gem_fragments FOR ALL 
  USING (true);

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reward_types_updated_at
    BEFORE UPDATE ON public.reward_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_inventory_updated_at
    BEFORE UPDATE ON public.user_inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gem_fragments_updated_at
    BEFORE UPDATE ON public.gem_fragments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert base reward types
INSERT INTO public.reward_types (name, description, category, rarity, image_url, metadata) VALUES
  ('Orydors', 'Monnaie du royaume d''Orydia', 'currency', 'common', '/lovable-uploads/c831f469-03da-458d-8428-2f156b930e87.png', '{"base_reward": true}'),
  ('Fragment de Joyau Commun', '1 fragment de joyau précieux', 'fragment', 'common', '/lovable-uploads/e4ca1c2e-eeba-4149-b13f-50ac08071650.png', '{"fragment_value": 1}'),
  ('Fragment de Joyau Rare', '2 fragments de joyau précieux', 'fragment', 'rare', '/lovable-uploads/e4ca1c2e-eeba-4149-b13f-50ac08071650.png', '{"fragment_value": 2}'),
  ('Fragment de Joyau Épique', '5 fragments de joyau précieux', 'fragment', 'epic', '/lovable-uploads/e4ca1c2e-eeba-4149-b13f-50ac08071650.png', '{"fragment_value": 5}'),
  ('Carte Paco le Corbeau', 'Carte légendaire du sage corbeau', 'card', 'legendary', '/lovable-uploads/42bd291d-6f9c-4dbe-a698-7260960f8687.png', '{"collection": "characters"}'),
  ('Carte Royaume d''Orydia', 'Carte épique du royaume', 'card', 'epic', '/lovable-uploads/5e38b74d-d359-40b2-9b2a-fc6a285acb97.png', '{"collection": "places"}'),
  ('Marque-page Vintage', 'Marque-page de collection ancien', 'item', 'rare', '/lovable-uploads/4cdcc1d9-fc57-4952-8ec9-3648454f9852.png', '{"collection": "accessories"}'),
  ('Lampe de Lecture', 'Lampe magique pour lire la nuit', 'item', 'epic', '/lovable-uploads/9318a8b9-7fe4-43c9-8aea-a49486e5baac.png', '{"collection": "accessories"}'
);