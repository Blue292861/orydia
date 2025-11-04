-- Problem 1: Allow anonymous users to view books
DROP POLICY IF EXISTS "Users can view books" ON public.books;

CREATE POLICY "Anyone can view books"
ON public.books FOR SELECT
TO authenticated, anon
USING (true);

-- Problem 1: Allow anonymous users to view audiobooks
DROP POLICY IF EXISTS "Users can view audiobooks" ON public.audiobooks;

CREATE POLICY "Anyone can view audiobooks"
ON public.audiobooks FOR SELECT
TO authenticated, anon
USING (true);

-- Problem 1: Allow anonymous users to view shop items
DROP POLICY IF EXISTS "Users can view shop items" ON public.shop_items;
DROP POLICY IF EXISTS "Public users can view shop items" ON public.shop_items;

CREATE POLICY "Anyone can view shop items"
ON public.shop_items FOR SELECT
TO authenticated, anon
USING (true);

-- Problem 3: Create premium codes tables
CREATE TABLE public.premium_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  subscription_type TEXT NOT NULL CHECK (subscription_type IN ('monthly', 'annual')),
  duration_months INTEGER NOT NULL DEFAULT 1,
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_single_use BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.premium_code_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id UUID NOT NULL REFERENCES public.premium_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  subscription_type TEXT NOT NULL,
  months_granted INTEGER NOT NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.premium_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_code_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for premium_codes
CREATE POLICY "Admins can manage premium codes"
ON public.premium_codes FOR ALL
TO authenticated
USING (user_has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (user_has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view valid premium codes"
ON public.premium_codes FOR SELECT
TO authenticated
USING (
  (expires_at IS NULL OR expires_at > now())
  AND (max_uses IS NULL OR current_uses < max_uses)
);

-- RLS Policies for premium_code_redemptions
CREATE POLICY "Admins can view all premium redemptions"
ON public.premium_code_redemptions FOR SELECT
TO authenticated
USING (user_has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own premium redemptions"
ON public.premium_code_redemptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own premium redemptions"
ON public.premium_code_redemptions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_premium_codes_updated_at
BEFORE UPDATE ON public.premium_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();