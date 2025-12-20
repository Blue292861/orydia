-- =============================================
-- SERMENT DU LECTEUR (Reader's Oath) System
-- =============================================

-- Table des serments/paris de lecture
CREATE TABLE public.reader_oaths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  book_id TEXT NOT NULL,
  book_title TEXT NOT NULL,
  book_cover_url TEXT,
  
  -- Mise et pourcentages
  stake_amount INTEGER NOT NULL,
  bonus_percentage INTEGER NOT NULL DEFAULT 10,
  
  -- Dates
  deadline TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  
  -- Statut: active, won, lost
  status TEXT NOT NULL DEFAULT 'active',
  
  -- Montant final (positif = gain, négatif = perte)
  payout_amount INTEGER,
  
  -- Contraintes
  CONSTRAINT valid_stake_amount CHECK (stake_amount IN (300, 500, 1000)),
  CONSTRAINT valid_status CHECK (status IN ('active', 'won', 'lost')),
  CONSTRAINT deadline_in_future CHECK (deadline > created_at)
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_reader_oaths_user_active ON reader_oaths(user_id) WHERE status = 'active';
CREATE INDEX idx_reader_oaths_deadline ON reader_oaths(deadline) WHERE status = 'active';
CREATE INDEX idx_reader_oaths_user_book ON reader_oaths(user_id, book_id);

-- Contrainte unique : un seul pari actif par utilisateur par livre
CREATE UNIQUE INDEX idx_one_active_oath_per_book ON reader_oaths(user_id, book_id) WHERE status = 'active';

-- Enable RLS
ALTER TABLE public.reader_oaths ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Users can view their own oaths"
ON public.reader_oaths FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all oaths"
ON public.reader_oaths FOR SELECT
USING (user_has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can manage oaths"
ON public.reader_oaths FOR ALL
USING (true)
WITH CHECK (true);

-- =============================================
-- FONCTION: Placer un serment de lecture
-- =============================================
CREATE OR REPLACE FUNCTION public.place_reader_oath(
  p_book_id TEXT,
  p_book_title TEXT,
  p_book_cover_url TEXT,
  p_stake_amount INTEGER,
  p_deadline TIMESTAMPTZ
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_current_points INTEGER;
  v_oath_id UUID;
BEGIN
  -- Vérifier l'authentification
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Utilisateur non authentifié');
  END IF;
  
  -- Vérifier la mise valide
  IF p_stake_amount NOT IN (300, 500, 1000) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Mise invalide. Choisissez 300, 500 ou 1000 Orydors');
  END IF;
  
  -- Vérifier la deadline (minimum 24h)
  IF p_deadline <= (now() + INTERVAL '24 hours') THEN
    RETURN jsonb_build_object('success', false, 'error', 'La deadline doit être au moins 24h dans le futur');
  END IF;
  
  -- Récupérer le solde actuel
  SELECT total_points INTO v_current_points
  FROM user_stats
  WHERE user_id = v_user_id;
  
  IF v_current_points IS NULL THEN
    v_current_points := 0;
  END IF;
  
  -- Vérifier les fonds suffisants (mise + 10% de pénalité potentielle)
  IF v_current_points < (p_stake_amount * 1.1)::INTEGER THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Orydors insuffisants. Vous devez avoir ' || (p_stake_amount * 1.1)::INTEGER || ' Orydors (mise + pénalité potentielle)'
    );
  END IF;
  
  -- Vérifier qu'il n'y a pas déjà un pari actif sur ce livre
  IF EXISTS (
    SELECT 1 FROM reader_oaths
    WHERE user_id = v_user_id 
    AND book_id = p_book_id 
    AND status = 'active'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Vous avez déjà un serment actif sur ce livre');
  END IF;
  
  -- Débiter la mise
  UPDATE user_stats
  SET total_points = total_points - p_stake_amount
  WHERE user_id = v_user_id;
  
  -- Créer le serment
  INSERT INTO reader_oaths (
    user_id,
    book_id,
    book_title,
    book_cover_url,
    stake_amount,
    deadline
  ) VALUES (
    v_user_id,
    p_book_id,
    p_book_title,
    p_book_cover_url,
    p_stake_amount,
    p_deadline
  )
  RETURNING id INTO v_oath_id;
  
  -- Logger la transaction
  INSERT INTO point_transactions (
    user_id,
    points,
    transaction_type,
    description,
    reference_id
  ) VALUES (
    v_user_id,
    -p_stake_amount,
    'reader_oath_stake',
    'Serment du lecteur: ' || p_book_title,
    v_oath_id::TEXT
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'oath_id', v_oath_id,
    'stake_amount', p_stake_amount,
    'potential_win', (p_stake_amount * 1.1)::INTEGER,
    'potential_loss', (p_stake_amount * 1.1)::INTEGER,
    'deadline', p_deadline
  );
END;
$$;

-- =============================================
-- FONCTION: Résoudre un serment (victoire ou défaite)
-- =============================================
CREATE OR REPLACE FUNCTION public.resolve_reader_oath(p_oath_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_oath RECORD;
  v_book_completed BOOLEAN := false;
  v_payout INTEGER;
  v_new_status TEXT;
BEGIN
  -- Récupérer le serment
  SELECT * INTO v_oath
  FROM reader_oaths
  WHERE id = p_oath_id AND status = 'active';
  
  IF v_oath IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Serment non trouvé ou déjà résolu');
  END IF;
  
  -- Vérifier si le livre a été terminé
  -- On vérifie dans books_read de user_stats ET dans book_completions
  SELECT EXISTS (
    SELECT 1 FROM user_stats 
    WHERE user_id = v_oath.user_id 
    AND v_oath.book_id = ANY(books_read)
  ) OR EXISTS (
    SELECT 1 FROM book_completions
    WHERE user_id = v_oath.user_id
    AND book_id = v_oath.book_id
  ) INTO v_book_completed;
  
  -- Calculer le résultat
  IF v_book_completed THEN
    -- VICTOIRE: récupérer mise + 10% bonus
    v_payout := (v_oath.stake_amount * 1.1)::INTEGER;
    v_new_status := 'won';
    
    -- Créditer le compte
    UPDATE user_stats
    SET total_points = total_points + v_payout
    WHERE user_id = v_oath.user_id;
    
    -- Logger la transaction
    INSERT INTO point_transactions (
      user_id,
      points,
      transaction_type,
      description,
      reference_id
    ) VALUES (
      v_oath.user_id,
      v_payout,
      'reader_oath_win',
      'Serment tenu! ' || v_oath.book_title,
      v_oath.id::TEXT
    );
  ELSE
    -- DÉFAITE: perdre 10% supplémentaire
    v_payout := -(v_oath.stake_amount * 0.1)::INTEGER;
    v_new_status := 'lost';
    
    -- Débiter la pénalité supplémentaire
    UPDATE user_stats
    SET total_points = total_points + v_payout
    WHERE user_id = v_oath.user_id;
    
    -- Logger la transaction
    INSERT INTO point_transactions (
      user_id,
      points,
      transaction_type,
      description,
      reference_id
    ) VALUES (
      v_oath.user_id,
      v_payout,
      'reader_oath_loss',
      'Serment brisé: ' || v_oath.book_title,
      v_oath.id::TEXT
    );
  END IF;
  
  -- Mettre à jour le serment
  UPDATE reader_oaths
  SET 
    status = v_new_status,
    resolved_at = now(),
    payout_amount = v_payout
  WHERE id = p_oath_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'status', v_new_status,
    'payout_amount', v_payout,
    'book_title', v_oath.book_title
  );
END;
$$;

-- =============================================
-- FONCTION: Vérifier et résoudre automatiquement à la complétion d'un livre
-- =============================================
CREATE OR REPLACE FUNCTION public.check_reader_oath_on_completion(
  p_user_id UUID,
  p_book_id TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_oath RECORD;
  v_result jsonb;
BEGIN
  -- Chercher un serment actif pour ce livre
  SELECT * INTO v_oath
  FROM reader_oaths
  WHERE user_id = p_user_id
  AND book_id = p_book_id
  AND status = 'active';
  
  IF v_oath IS NULL THEN
    RETURN jsonb_build_object('has_oath', false);
  END IF;
  
  -- Résoudre le serment (victoire car livre terminé)
  SELECT resolve_reader_oath(v_oath.id) INTO v_result;
  
  RETURN jsonb_build_object(
    'has_oath', true,
    'result', v_result
  );
END;
$$;

-- =============================================
-- FONCTION: Obtenir les serments actifs d'un utilisateur
-- =============================================
CREATE OR REPLACE FUNCTION public.get_user_active_oaths(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  book_id TEXT,
  book_title TEXT,
  book_cover_url TEXT,
  stake_amount INTEGER,
  bonus_percentage INTEGER,
  potential_win INTEGER,
  potential_loss INTEGER,
  deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  time_remaining INTERVAL
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := COALESCE(p_user_id, auth.uid());
BEGIN
  RETURN QUERY
  SELECT 
    ro.id,
    ro.book_id,
    ro.book_title,
    ro.book_cover_url,
    ro.stake_amount,
    ro.bonus_percentage,
    (ro.stake_amount * 1.1)::INTEGER as potential_win,
    (ro.stake_amount * 1.1)::INTEGER as potential_loss,
    ro.deadline,
    ro.created_at,
    ro.deadline - now() as time_remaining
  FROM reader_oaths ro
  WHERE ro.user_id = v_user_id
  AND ro.status = 'active'
  ORDER BY ro.deadline ASC;
END;
$$;

-- =============================================
-- FONCTION: Obtenir l'historique des serments
-- =============================================
CREATE OR REPLACE FUNCTION public.get_user_oath_history(p_user_id UUID DEFAULT NULL, p_limit INTEGER DEFAULT 20)
RETURNS TABLE (
  id UUID,
  book_id TEXT,
  book_title TEXT,
  book_cover_url TEXT,
  stake_amount INTEGER,
  payout_amount INTEGER,
  status TEXT,
  deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := COALESCE(p_user_id, auth.uid());
BEGIN
  RETURN QUERY
  SELECT 
    ro.id,
    ro.book_id,
    ro.book_title,
    ro.book_cover_url,
    ro.stake_amount,
    ro.payout_amount,
    ro.status,
    ro.deadline,
    ro.created_at,
    ro.resolved_at
  FROM reader_oaths ro
  WHERE ro.user_id = v_user_id
  AND ro.status IN ('won', 'lost')
  ORDER BY ro.resolved_at DESC
  LIMIT p_limit;
END;
$$;

-- =============================================
-- FONCTION: Statistiques des serments
-- =============================================
CREATE OR REPLACE FUNCTION public.get_user_oath_stats(p_user_id UUID DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := COALESCE(p_user_id, auth.uid());
  v_total_oaths INTEGER;
  v_won_oaths INTEGER;
  v_lost_oaths INTEGER;
  v_active_oaths INTEGER;
  v_total_wagered INTEGER;
  v_total_won INTEGER;
  v_total_lost INTEGER;
  v_net_profit INTEGER;
BEGIN
  SELECT 
    COUNT(*) FILTER (WHERE status IN ('won', 'lost')),
    COUNT(*) FILTER (WHERE status = 'won'),
    COUNT(*) FILTER (WHERE status = 'lost'),
    COUNT(*) FILTER (WHERE status = 'active'),
    COALESCE(SUM(stake_amount), 0),
    COALESCE(SUM(CASE WHEN status = 'won' THEN payout_amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN status = 'lost' THEN ABS(payout_amount) ELSE 0 END), 0)
  INTO v_total_oaths, v_won_oaths, v_lost_oaths, v_active_oaths, v_total_wagered, v_total_won, v_total_lost
  FROM reader_oaths
  WHERE user_id = v_user_id;
  
  v_net_profit := v_total_won - v_total_lost - (v_total_wagered - (SELECT COALESCE(SUM(stake_amount), 0) FROM reader_oaths WHERE user_id = v_user_id AND status = 'active'));
  
  RETURN jsonb_build_object(
    'total_oaths', COALESCE(v_total_oaths, 0),
    'won_oaths', COALESCE(v_won_oaths, 0),
    'lost_oaths', COALESCE(v_lost_oaths, 0),
    'active_oaths', COALESCE(v_active_oaths, 0),
    'win_rate', CASE WHEN v_total_oaths > 0 THEN ROUND((v_won_oaths::DECIMAL / v_total_oaths) * 100, 1) ELSE 0 END,
    'total_wagered', COALESCE(v_total_wagered, 0),
    'total_won', COALESCE(v_total_won, 0),
    'total_lost', COALESCE(v_total_lost, 0),
    'net_profit', COALESCE(v_net_profit, 0)
  );
END;
$$;