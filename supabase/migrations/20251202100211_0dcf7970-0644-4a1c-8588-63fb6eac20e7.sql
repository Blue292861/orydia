-- Ajouter le champ is_rare à la table books
ALTER TABLE books ADD COLUMN is_rare boolean NOT NULL DEFAULT false;

-- Créer la table user_rare_books pour tracker les découvertes
CREATE TABLE user_rare_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  discovered_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- Activer RLS sur user_rare_books
ALTER TABLE user_rare_books ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir leurs propres livres rares
CREATE POLICY "Users can view their own rare books" 
ON user_rare_books
FOR SELECT 
USING (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent ajouter des livres rares à leur collection
CREATE POLICY "Users can add rare books to their collection" 
ON user_rare_books
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Politique : Les admins peuvent voir tous les livres rares découverts
CREATE POLICY "Admins can view all rare books" 
ON user_rare_books
FOR SELECT 
USING (user_has_role(auth.uid(), 'admin'::app_role));