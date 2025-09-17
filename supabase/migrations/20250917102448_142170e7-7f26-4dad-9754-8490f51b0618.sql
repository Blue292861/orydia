-- Update all existing shop items to be external (Oryshop) instead of internal (Orydia)
-- This moves all current items from the internal Orydia shop to the external Oryshop
UPDATE public.shop_items 
SET shop_type = 'external'::shop_type 
WHERE shop_type = 'internal';