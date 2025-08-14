-- Create table for Tensens codes
CREATE TABLE public.tensens_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  points_value INTEGER NOT NULL,
  max_uses INTEGER DEFAULT NULL, -- NULL = unlimited uses, number = limited uses
  current_uses INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL, -- NULL = never expires
  is_single_use BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL, -- admin who created the code
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for tracking code redemptions
CREATE TABLE public.tensens_code_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code_id UUID NOT NULL REFERENCES public.tensens_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  points_awarded INTEGER NOT NULL,
  redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tensens_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tensens_code_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for tensens_codes
CREATE POLICY "Admins can manage all Tensens codes" 
ON public.tensens_codes 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Users can view valid codes for redemption" 
ON public.tensens_codes 
FOR SELECT 
TO authenticated
USING (
  (expires_at IS NULL OR expires_at > now()) AND
  (max_uses IS NULL OR current_uses < max_uses)
);

-- RLS policies for tensens_code_redemptions
CREATE POLICY "Admins can view all code redemptions" 
ON public.tensens_code_redemptions 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Users can view their own redemptions" 
ON public.tensens_code_redemptions 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own redemptions" 
ON public.tensens_code_redemptions 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Add update trigger for tensens_codes
CREATE TRIGGER update_tensens_codes_updated_at
  BEFORE UPDATE ON public.tensens_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_tensens_codes_code ON public.tensens_codes(code);
CREATE INDEX idx_tensens_codes_expires_at ON public.tensens_codes(expires_at);
CREATE INDEX idx_tensens_code_redemptions_user_id ON public.tensens_code_redemptions(user_id);
CREATE INDEX idx_tensens_code_redemptions_code_id ON public.tensens_code_redemptions(code_id);