-- Ajouter la colonne genre à la table loot_tables
ALTER TABLE public.loot_tables ADD COLUMN genre TEXT NULL;

-- Créer un index pour les performances des requêtes par genre
CREATE INDEX idx_loot_tables_genre ON public.loot_tables(genre) WHERE genre IS NOT NULL;

-- Commentaire pour documentation
COMMENT ON COLUMN public.loot_tables.genre IS 'Genre de livre pour les loot tables par genre (ex: Fantasy, Romance). NULL = global ou book-specific';