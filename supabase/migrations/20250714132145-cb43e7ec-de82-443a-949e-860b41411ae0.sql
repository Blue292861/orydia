-- Phase 1: Centralisation du système de points
-- Créer la table pour stocker les stats des utilisateurs
CREATE TABLE public.user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER NOT NULL DEFAULT 0,
  books_read TEXT[] NOT NULL DEFAULT '{}',
  level INTEGER NOT NULL DEFAULT 1,
  experience_points INTEGER NOT NULL DEFAULT 0,
  pending_premium_months INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Créer la table pour les transactions de points
CREATE TABLE public.point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- 'book_completion', 'purchase_reward', 'admin_adjustment', etc.
  reference_id TEXT, -- ID du livre, commande, etc.
  description TEXT,
  source_app TEXT NOT NULL DEFAULT 'main_app', -- 'main_app', 'ecommerce_app', etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Créer la table pour les achievements persistants
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  points INTEGER NOT NULL,
  icon TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary', 'ultra-legendary')),
  premium_months INTEGER DEFAULT 0,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Créer la table pour les clés API externes
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name TEXT NOT NULL UNIQUE,
  key_hash TEXT NOT NULL UNIQUE,
  app_name TEXT NOT NULL,
  permissions TEXT[] NOT NULL DEFAULT '{}', -- 'award_points', 'view_stats', etc.
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER NOT NULL DEFAULT 0
);

-- Enable RLS sur toutes les tables
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Policies pour user_stats
CREATE POLICY "Users can view their own stats" ON public.user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON public.user_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats" ON public.user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all stats" ON public.user_stats
  FOR ALL USING (user_has_role(auth.uid(), 'admin'::app_role));

-- Policies pour point_transactions
CREATE POLICY "Users can view their own transactions" ON public.point_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" ON public.point_transactions
  FOR SELECT USING (user_has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert transactions" ON public.point_transactions
  FOR INSERT WITH CHECK (true);

-- Policies pour user_achievements
CREATE POLICY "Users can view their own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own achievements" ON public.user_achievements
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all achievements" ON public.user_achievements
  FOR ALL USING (user_has_role(auth.uid(), 'admin'::app_role));

-- Policies pour api_keys (admin seulement)
CREATE POLICY "Admins can manage API keys" ON public.api_keys
  FOR ALL USING (user_has_role(auth.uid(), 'admin'::app_role));

-- Fonction pour mettre à jour updated_at
CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON public.user_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction pour calculer le niveau basé sur les points d'expérience
CREATE OR REPLACE FUNCTION public.calculate_level(experience_points INTEGER)
RETURNS INTEGER
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE 
    WHEN experience_points < 100 THEN 1
    WHEN experience_points < 300 THEN 2
    WHEN experience_points < 600 THEN 3
    WHEN experience_points < 1000 THEN 4
    WHEN experience_points < 1500 THEN 5
    ELSE LEAST(50, 5 + (experience_points - 1500) / 500)
  END;
$$;