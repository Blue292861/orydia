-- Insert reward_type for gem fragment (for purchase tracking)
INSERT INTO public.reward_types (id, name, description, category, rarity, image_url, is_active)
VALUES (
  'a1b2c3d4-5678-9012-3456-789012345678',
  'Fragment de joyau',
  'Un fragment de joyau précieux. Collectez-en 12 pour obtenir 1 mois de premium gratuit !',
  'fragment',
  'rare',
  '/lovable-uploads/5e38b74d-d359-40b2-9b2a-fc6a285acb97.png',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Insert shop_item for purchasable gem fragment
INSERT INTO public.shop_items (
  name, 
  description, 
  price, 
  real_price_cents,
  payment_type,
  reward_type_id,
  image_url, 
  category, 
  seller, 
  shop_type,
  slug,
  required_level
)
VALUES (
  'Fragment de joyau',
  'Un fragment de joyau précieux. Collectez-en 12 pour obtenir 1 mois de premium gratuit ! Accélérez votre progression vers le premium.',
  0,
  85,
  'real_money',
  'a1b2c3d4-5678-9012-3456-789012345678',
  '/lovable-uploads/5e38b74d-d359-40b2-9b2a-fc6a285acb97.png',
  'Consommables',
  'Orydia',
  'internal',
  'fragment-de-joyau',
  1
)
ON CONFLICT DO NOTHING;