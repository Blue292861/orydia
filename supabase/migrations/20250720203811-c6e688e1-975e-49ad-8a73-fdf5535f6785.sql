-- Create storage bucket for book covers
INSERT INTO storage.buckets (id, name, public) 
VALUES ('book-covers', 'book-covers', true);

-- Create storage policies for book covers
CREATE POLICY "Les images de couverture sont publiquement accessibles" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'book-covers');

CREATE POLICY "Les utilisateurs authentifiés peuvent uploader des couvertures" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'book-covers' AND auth.uid() IS NOT NULL);

CREATE POLICY "Les utilisateurs authentifiés peuvent mettre à jour des couvertures" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'book-covers' AND auth.uid() IS NOT NULL);

CREATE POLICY "Les utilisateurs authentifiés peuvent supprimer des couvertures" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'book-covers' AND auth.uid() IS NOT NULL);