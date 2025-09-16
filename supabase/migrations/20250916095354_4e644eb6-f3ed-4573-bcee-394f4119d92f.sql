-- Add rating fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN has_rated_app BOOLEAN DEFAULT FALSE,
ADD COLUMN app_rating INTEGER CHECK (app_rating >= 1 AND app_rating <= 5),
ADD COLUMN rated_at TIMESTAMP WITH TIME ZONE;