-- Phase 3: Add month_year column to chest_openings for monthly reclaim
ALTER TABLE public.chest_openings 
ADD COLUMN IF NOT EXISTS month_year TEXT;

-- Create index for efficient monthly queries
CREATE INDEX IF NOT EXISTS idx_chest_openings_month_year 
ON public.chest_openings(user_id, book_id, month_year);

-- Phase 4: Add Magic Chest Key reward type
INSERT INTO public.reward_types (
  id,
  name,
  description,
  category,
  rarity,
  image_url,
  metadata,
  is_active
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Clé de Coffre Magique',
  'Permet de rouvrir un coffre déjà réclamé sans avoir à relire tous les chapitres',
  'item',
  'legendary',
  '/lovable-uploads/c831f469-03da-458d-8428-2f156b930e87.png',
  '{"effect": "bypass_chest_cooldown", "consumable": true}'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;