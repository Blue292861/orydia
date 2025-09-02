-- Remove sensitive personal information fields from profiles table
-- Keep only essential data: city and country for regional needs
-- Remove: street_address, postal_code (too sensitive/granular)

ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS street_address,
DROP COLUMN IF EXISTS postal_code;

-- Add indexes for better performance on remaining location fields
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON public.profiles(country);