
-- Créer la table pour stocker les informations sur les abonnements des utilisateurs
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activer la sécurité au niveau des lignes (RLS) pour la table des abonnés
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Créer une politique RLS pour permettre aux utilisateurs de consulter leurs propres informations d'abonnement
CREATE POLICY "select_own_subscription" ON public.subscribers
FOR SELECT
USING (auth.uid() = user_id);

-- Note : Les politiques d'insertion et de mise à jour ne sont pas accordées directement aux utilisateurs.
-- Ces opérations seront gérées par des fonctions Edge sécurisées utilisant la clé de service qui contourne la RLS.

-- Créer une fonction pour mettre à jour automatiquement le champ `updated_at`
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Créer un déclencheur (trigger) pour exécuter la fonction lors de la mise à jour d'un abonné
CREATE TRIGGER update_subscribers_updated_at
BEFORE UPDATE ON public.subscribers
FOR EACH ROW
EXECUTE PROCEDURE public.update_updated_at_column();
