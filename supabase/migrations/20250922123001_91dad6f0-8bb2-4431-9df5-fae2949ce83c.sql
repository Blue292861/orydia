-- Create table for EPUB reading progress
CREATE TABLE public.epub_reading_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  book_id TEXT NOT NULL,
  location TEXT,
  progress INTEGER DEFAULT 0,
  current_page INTEGER DEFAULT 1,
  total_pages INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- Enable Row Level Security
ALTER TABLE public.epub_reading_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own reading progress" 
ON public.epub_reading_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reading progress" 
ON public.epub_reading_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading progress" 
ON public.epub_reading_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Admins can manage all reading progress
CREATE POLICY "Admins can manage all reading progress" 
ON public.epub_reading_progress 
FOR ALL 
USING (user_has_role(auth.uid(), 'admin'::app_role));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_epub_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_epub_progress_updated_at
    BEFORE UPDATE ON public.epub_reading_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.update_epub_progress_updated_at();