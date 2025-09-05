-- Fonction pour marquer un utilisateur comme premium manuellement (pour les admins)
CREATE OR REPLACE FUNCTION public.grant_manual_premium(
  p_user_id UUID,
  p_months INTEGER DEFAULT 1
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Récupérer l'email de l'utilisateur
  SELECT email INTO user_email 
  FROM auth.users 
  WHERE id = p_user_id;
  
  IF user_email IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non trouvé';
  END IF;
  
  -- Insérer ou mettre à jour l'abonnement manuel
  INSERT INTO public.subscribers (
    user_id, 
    email, 
    subscribed, 
    subscription_tier, 
    subscription_end,
    stripe_customer_id,
    updated_at
  ) VALUES (
    p_user_id,
    user_email,
    true,
    'Premium Manual',
    now() + (p_months || ' months')::INTERVAL,
    NULL, -- Pas de Stripe pour les abonnements manuels
    now()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    subscribed = true,
    subscription_tier = 'Premium Manual',
    subscription_end = now() + (p_months || ' months')::INTERVAL,
    stripe_customer_id = NULL,
    updated_at = now();
END;
$$;

-- Fonction pour révoquer le premium manuel
CREATE OR REPLACE FUNCTION public.revoke_manual_premium(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.subscribers 
  SET 
    subscribed = false,
    subscription_tier = NULL,
    subscription_end = NULL,
    updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;