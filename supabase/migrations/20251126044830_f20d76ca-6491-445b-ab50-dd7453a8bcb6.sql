-- Update reward_type name and image for Aildor key
UPDATE reward_types
SET 
  name = 'Clé d''Aildor le dragon',
  description = 'Cette clé mystique forgée dans les flammes d''Aildor permet de rouvrir un coffre déjà réclamé sans avoir à relire tous les chapitres.',
  image_url = '/assets/cle-aildor.png'
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Add payment_type column to shop_items (orydors or real_money)
ALTER TABLE shop_items ADD COLUMN IF NOT EXISTS payment_type text DEFAULT 'orydors';

-- Add real_price_cents column for real money purchases
ALTER TABLE shop_items ADD COLUMN IF NOT EXISTS real_price_cents integer;

-- Add reward_type_id column to link shop items to inventory rewards
ALTER TABLE shop_items ADD COLUMN IF NOT EXISTS reward_type_id uuid REFERENCES reward_types(id);

-- Insert the Aildor Key as a purchasable shop item
INSERT INTO shop_items (
  name, 
  slug, 
  description, 
  price, 
  image_url, 
  category, 
  seller, 
  shop_type, 
  payment_type, 
  real_price_cents, 
  reward_type_id
) VALUES (
  'Clé d''Aildor le dragon',
  'cle-aildor-le-dragon',
  'Cette clé mystique forgée dans les flammes d''Aildor permet de rouvrir un coffre déjà réclamé sans avoir à relire tous les chapitres. Utilisez-la pour récupérer à nouveau vos récompenses !',
  0,
  '/assets/cle-aildor.png',
  'Consommables',
  'Orydia',
  'internal',
  'real_money',
  299,
  '550e8400-e29b-41d4-a716-446655440000'
);