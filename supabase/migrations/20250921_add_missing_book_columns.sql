-- Add summary, genres and is_adult_content columns to the books table
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS genres TEXT[];
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS is_adult_content BOOLEAN NOT NULL DEFAULT false;

-- Add has_chapters and is_interactive columns
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS has_chapters BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS is_interactive BOOLEAN NOT NULL DEFAULT false;

-- Vous pouvez également ajouter un trigger pour 'updated_at' si nécessaire,
-- mais votre fichier de migration 20250616093719-881786f0-09f6-40fb-87f0-daab7e3e95e1.sql le fait déjà.

-- Mettez à jour les politiques RLS pour inclure les nouvelles colonnes
-- (Si une politique pour tous les champs n'existe pas déjà, il faut l'ajouter.)
-- La politique suivante est déjà présente dans votre code, elle est donc juste à vérifier.
-- CREATE POLICY "Admins can manage books"
--   ON public.books
--   FOR ALL
--   TO authenticated
--   USING (public.user_has_role(auth.uid(), 'admin'));
