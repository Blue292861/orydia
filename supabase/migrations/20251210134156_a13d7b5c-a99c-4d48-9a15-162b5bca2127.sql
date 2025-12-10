-- Add target_book_ids column for saga objectives (read any book from a list)
ALTER TABLE public.challenge_objectives 
ADD COLUMN IF NOT EXISTS target_book_ids UUID[] DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.challenge_objectives.target_book_ids IS 'Array of book IDs for saga-type objectives where user can read any one book from the list';