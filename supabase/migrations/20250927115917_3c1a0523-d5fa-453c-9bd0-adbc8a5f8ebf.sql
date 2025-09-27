-- Update audiobooks table to ensure it has genres column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'audiobooks' AND column_name = 'genres'
  ) THEN
    ALTER TABLE public.audiobooks
      ADD COLUMN genres text[] NOT NULL DEFAULT '{}'::text[];
  END IF;
END $$;