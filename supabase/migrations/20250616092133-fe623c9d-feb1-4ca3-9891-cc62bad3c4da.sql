
-- Create a table for audiobooks
CREATE TABLE public.audiobooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  cover_url TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  points INTEGER NOT NULL DEFAULT 0,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  is_month_success BOOLEAN NOT NULL DEFAULT false,
  is_paco_favourite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for audiobooks (similar to books)
ALTER TABLE public.audiobooks ENABLE ROW LEVEL SECURITY;

-- Create policies that allow authenticated users to read audiobooks
CREATE POLICY "Users can view audiobooks" 
  ON public.audiobooks 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Create policies that allow admin users to manage audiobooks
CREATE POLICY "Admins can manage audiobooks" 
  ON public.audiobooks 
  FOR ALL 
  TO authenticated
  USING (public.user_has_role(auth.uid(), 'admin'));

-- Add trigger to update updated_at column
CREATE TRIGGER update_audiobooks_updated_at
  BEFORE UPDATE ON public.audiobooks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
