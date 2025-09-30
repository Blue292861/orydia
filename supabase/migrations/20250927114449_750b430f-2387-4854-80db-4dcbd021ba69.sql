-- Add missing genres column to books table for genre selection support
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'books' AND column_name = 'genres'
  ) THEN
    ALTER TABLE public.books
      ADD COLUMN genres text[] NOT NULL DEFAULT '{}'::text[];
  END IF;
END $$;