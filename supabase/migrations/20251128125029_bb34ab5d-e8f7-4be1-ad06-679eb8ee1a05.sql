-- Create bucket for waypoint assets if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-assets', 'book-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for book-assets bucket
CREATE POLICY "Public can view book assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'book-assets');

CREATE POLICY "Admins can upload book assets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'book-assets' 
    AND user_has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can update book assets" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'book-assets' 
    AND user_has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can delete book assets" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'book-assets' 
    AND user_has_role(auth.uid(), 'admin'::app_role)
  );