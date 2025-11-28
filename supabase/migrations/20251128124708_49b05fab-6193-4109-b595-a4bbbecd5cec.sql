-- Create chapter_waypoints table for storing waypoint data
CREATE TABLE public.chapter_waypoints (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id uuid REFERENCES public.book_chapter_epubs(id) ON DELETE CASCADE NOT NULL,
  
  -- Location in EPUB
  cfi_range text NOT NULL,
  word_text text NOT NULL,
  word_index integer,
  
  -- Type and content
  waypoint_type text NOT NULL CHECK (waypoint_type IN ('text', 'image', 'audio', 'link')),
  
  -- Content based on type
  content_text text,
  content_image_url text,
  content_audio_url text,
  content_link_url text,
  content_link_label text,
  
  -- Metadata
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id)
);

-- Index for fast chapter lookup
CREATE INDEX idx_chapter_waypoints_chapter_id ON public.chapter_waypoints(chapter_id);

-- Enable RLS
ALTER TABLE public.chapter_waypoints ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can manage waypoints" ON public.chapter_waypoints
  FOR ALL USING (user_has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (user_has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view waypoints" ON public.chapter_waypoints
  FOR SELECT USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_chapter_waypoints_updated_at
  BEFORE UPDATE ON public.chapter_waypoints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();