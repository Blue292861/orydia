-- Table des cadeaux créés par les admins
CREATE TABLE public.admin_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  rewards JSONB NOT NULL DEFAULT '{"orydors": 0, "xp": 0, "items": []}'::jsonb,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('all', 'premium', 'specific')),
  recipient_user_ids UUID[] DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table de suivi des cadeaux réclamés par les utilisateurs
CREATE TABLE public.user_gift_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  gift_id UUID NOT NULL REFERENCES public.admin_gifts(id) ON DELETE CASCADE,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, gift_id)
);

-- Activer RLS
ALTER TABLE public.admin_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gift_claims ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour admin_gifts
CREATE POLICY "Admins can manage all gifts"
ON public.admin_gifts
FOR ALL
USING (user_has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (user_has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view gifts destined to them"
ON public.admin_gifts
FOR SELECT
USING (
  expires_at > now() AND
  (
    recipient_type = 'all' OR
    (recipient_type = 'premium' AND EXISTS (
      SELECT 1 FROM public.subscribers 
      WHERE user_id = auth.uid() AND subscribed = true
    )) OR
    (recipient_type = 'specific' AND auth.uid() = ANY(recipient_user_ids))
  ) AND
  NOT EXISTS (
    SELECT 1 FROM public.user_gift_claims 
    WHERE gift_id = admin_gifts.id AND user_id = auth.uid()
  )
);

-- Politiques RLS pour user_gift_claims
CREATE POLICY "Users can view their own claims"
ON public.user_gift_claims
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own claims"
ON public.user_gift_claims
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all claims"
ON public.user_gift_claims
FOR SELECT
USING (user_has_role(auth.uid(), 'admin'::app_role));

-- Index pour les performances
CREATE INDEX idx_admin_gifts_expires_at ON public.admin_gifts(expires_at);
CREATE INDEX idx_admin_gifts_recipient_type ON public.admin_gifts(recipient_type);
CREATE INDEX idx_user_gift_claims_user_id ON public.user_gift_claims(user_id);
CREATE INDEX idx_user_gift_claims_gift_id ON public.user_gift_claims(gift_id);