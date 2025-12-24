-- =====================================================
-- FORTUNE WHEEL MIGRATION
-- =====================================================

-- 1. Create wheel_streaks table
CREATE TABLE IF NOT EXISTS public.wheel_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  current_streak INTEGER DEFAULT 0,
  max_streak INTEGER DEFAULT 0,
  last_spin_date DATE,
  streak_broken_at INTEGER, -- Level where streak was before it broke
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create streak_bonuses table
CREATE TABLE IF NOT EXISTS public.streak_bonuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  streak_level INTEGER NOT NULL UNIQUE,
  bonus_type TEXT NOT NULL, -- 'probability_boost' | 'quantity_boost'
  bonus_value NUMERIC NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Modify daily_chest_claims → wheel_spins
-- First add new columns to daily_chest_claims
ALTER TABLE public.daily_chest_claims 
ADD COLUMN IF NOT EXISTS spin_type TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS xp_won INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reward_type TEXT DEFAULT 'orydors';

-- 4. Modify daily_chest_configs to use wheel_segments instead of item_pool
-- Note: We keep the table name but update the structure
ALTER TABLE public.daily_chest_configs 
ADD COLUMN IF NOT EXISTS wheel_segments JSONB DEFAULT '[]'::jsonb;

-- 5. Enable RLS on new tables
ALTER TABLE public.wheel_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_bonuses ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for wheel_streaks
CREATE POLICY "Users can view own streak" 
ON public.wheel_streaks FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert streaks" 
ON public.wheel_streaks FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update streaks" 
ON public.wheel_streaks FOR UPDATE 
USING (true);

-- 7. RLS Policies for streak_bonuses
CREATE POLICY "Anyone can view streak bonuses" 
ON public.streak_bonuses FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage streak bonuses" 
ON public.streak_bonuses FOR ALL 
USING (user_has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (user_has_role(auth.uid(), 'admin'::app_role));

-- 8. Insert default streak bonuses
INSERT INTO public.streak_bonuses (streak_level, bonus_type, bonus_value, description) VALUES
(3, 'probability_boost', 1.05, '+5% de chances sur les récompenses rares'),
(7, 'quantity_boost', 1.2, '+20% sur les quantités'),
(14, 'probability_boost', 1.1, '+10% de chances sur les récompenses rares'),
(30, 'quantity_boost', 1.5, '+50% sur les quantités'),
(60, 'probability_boost', 1.2, '+20% de chances sur les récompenses rares')
ON CONFLICT (streak_level) DO NOTHING;

-- 9. Update existing daily_chest_configs with wheel_segments format
UPDATE public.daily_chest_configs 
SET wheel_segments = '[
  {"id": "seg1", "type": "orydors", "value": 200, "probability": 50, "color": "#FFD700", "label": "200 Orydors"},
  {"id": "seg2", "type": "orydors", "value": 1000, "probability": 5, "color": "#FF6B00", "label": "1000 Orydors"},
  {"id": "seg3", "type": "item", "rewardTypeId": "550e8400-e29b-41d4-a716-446655440000", "quantity": 1, "probability": 1, "color": "#8B5CF6", "label": "Clé d''Aildor"},
  {"id": "seg4", "type": "item", "rewardTypeId": "a1b2c3d4-5678-9012-3456-789012345678", "quantity": 1, "probability": 1, "color": "#06B6D4", "label": "Fragment"},
  {"id": "seg5", "type": "xp", "value": 40, "probability": 43, "color": "#10B981", "label": "40 XP"}
]'::jsonb
WHERE wheel_segments IS NULL OR wheel_segments = '[]'::jsonb;

-- 10. Create trigger for updating wheel_streaks.updated_at
CREATE OR REPLACE FUNCTION public.update_wheel_streaks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trigger_update_wheel_streaks_updated_at ON public.wheel_streaks;
CREATE TRIGGER trigger_update_wheel_streaks_updated_at
BEFORE UPDATE ON public.wheel_streaks
FOR EACH ROW
EXECUTE FUNCTION public.update_wheel_streaks_updated_at();