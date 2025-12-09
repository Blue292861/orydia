-- Ajouter la colonne is_persistent à admin_gifts
ALTER TABLE admin_gifts ADD COLUMN is_persistent BOOLEAN NOT NULL DEFAULT false;

-- Rendre expires_at nullable (les cadeaux persistants n'expirent pas)
ALTER TABLE admin_gifts ALTER COLUMN expires_at DROP NOT NULL;

-- Supprimer l'ancienne politique RLS
DROP POLICY IF EXISTS "Users can view gifts destined to them" ON admin_gifts;

-- Nouvelle politique : les cadeaux persistants restent visibles même réclamés
CREATE POLICY "Users can view gifts destined to them" ON admin_gifts
  FOR SELECT
  USING (
    -- Conditions d'éligibilité selon recipient_type
    (
      (recipient_type = 'all') OR 
      ((recipient_type = 'premium') AND (EXISTS (
        SELECT 1 FROM subscribers 
        WHERE subscribers.user_id = auth.uid() AND subscribers.subscribed = true
      ))) OR 
      ((recipient_type = 'specific') AND (auth.uid() = ANY(recipient_user_ids)))
    )
    AND
    -- Visible si : persistant OU (non expiré ET non réclamé)
    (
      is_persistent = true 
      OR 
      (
        (expires_at IS NULL OR expires_at > now()) 
        AND NOT EXISTS (
          SELECT 1 FROM user_gift_claims 
          WHERE user_gift_claims.gift_id = admin_gifts.id 
          AND user_gift_claims.user_id = auth.uid()
        )
      )
    )
  );