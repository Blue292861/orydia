
-- Création de la table pour les commandes
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  price INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' ou 'processed'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activation de la sécurité au niveau des lignes (RLS) pour les commandes
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Politique RLS: Les administrateurs peuvent gérer toutes les commandes
CREATE POLICY "Admins can manage all orders"
ON public.orders FOR ALL
USING (public.user_has_role(auth.uid(), 'admin'))
WITH CHECK (public.user_has_role(auth.uid(), 'admin'));

-- Politique RLS: Les utilisateurs peuvent voir leurs propres commandes
CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT
USING (auth.uid() = user_id);

-- Politique RLS: Les utilisateurs peuvent créer leurs propres commandes (lors d'un achat)
CREATE POLICY "Users can create their own orders"
ON public.orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Création de la table pour le suivi des lectures achevées
CREATE TABLE public.book_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activation de la sécurité au niveau des lignes (RLS) pour les lectures
ALTER TABLE public.book_completions ENABLE ROW LEVEL SECURITY;

-- Politique RLS: Les administrateurs peuvent lire toutes les données pour les statistiques
CREATE POLICY "Admins can read all book completions"
ON public.book_completions FOR SELECT
USING (public.user_has_role(auth.uid(), 'admin'));

-- Politique RLS: Les utilisateurs peuvent gérer leurs propres données de lecture
CREATE POLICY "Users can manage their own book completions"
ON public.book_completions FOR ALL
USING (auth.uid() = user_id);

