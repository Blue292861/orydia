-- Create table for chapter-based EPUB system
CREATE TABLE IF NOT EXISTS public.book_chapter_epubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  illustration_url TEXT,
  epub_url TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(book_id, chapter_number)
);

-- Create index for fast ordering
CREATE INDEX idx_book_chapter_epubs_book_position ON public.book_chapter_epubs(book_id, position);

-- Enable RLS
ALTER TABLE public.book_chapter_epubs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view book chapters"
ON public.book_chapter_epubs
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage book chapters"
ON public.book_chapter_epubs
FOR ALL
USING (user_has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (user_has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_book_chapter_epubs_updated_at
BEFORE UPDATE ON public.book_chapter_epubs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();