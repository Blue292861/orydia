-- Add is_premium_only column to daily_chest_configs for premium-exclusive wheels
ALTER TABLE public.daily_chest_configs 
ADD COLUMN IF NOT EXISTS is_premium_only BOOLEAN DEFAULT false;