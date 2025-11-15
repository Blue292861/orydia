-- Enable realtime for chapter_translations table
ALTER TABLE public.chapter_translations REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.chapter_translations;