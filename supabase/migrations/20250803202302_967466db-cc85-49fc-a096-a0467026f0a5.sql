-- Add new column is_paco_chronicle to audiobooks table
ALTER TABLE public.audiobooks 
ADD COLUMN is_paco_chronicle boolean NOT NULL DEFAULT false;