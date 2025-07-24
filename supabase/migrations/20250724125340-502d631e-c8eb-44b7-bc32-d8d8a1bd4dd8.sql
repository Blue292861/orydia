-- Add is_adult_content column to books table
ALTER TABLE public.books 
ADD COLUMN is_adult_content BOOLEAN NOT NULL DEFAULT false;