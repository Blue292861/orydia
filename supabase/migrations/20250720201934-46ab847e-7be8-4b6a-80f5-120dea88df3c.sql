-- Ajouter le champ résumé à la table books
ALTER TABLE public.books 
ADD COLUMN summary text;