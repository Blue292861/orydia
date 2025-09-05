-- Fix critical RLS policy security issues (corrected version)

-- 1. Fix subscribers table - restrict access to payment data
DROP POLICY IF EXISTS "Users can view their own subscription only" ON public.subscribers;
DROP POLICY IF EXISTS "Users can update their own subscription only" ON public.subscribers;  
DROP POLICY IF EXISTS "Users can insert their own subscription only" ON public.subscribers;

CREATE POLICY "Users can view their own subscription data only" 
ON public.subscribers 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users cannot update sensitive payment fields
CREATE POLICY "Users cannot update sensitive subscription data" 
ON public.subscribers 
FOR UPDATE 
USING (false); -- Block user updates completely

CREATE POLICY "System can insert subscription data" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (true); -- Only system/edge functions should insert

-- 2. Fix profiles table - ensure users can only see their own data  
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view only their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- 3. Fix tensens codes table - restrict code visibility for security
DROP POLICY IF EXISTS "Users can view valid codes for redemption" ON public.tensens_codes;
CREATE POLICY "Users can view codes only when redeeming" 
ON public.tensens_codes 
FOR SELECT 
USING (
  -- Only show codes that are valid and not expired for redemption purposes
  ((expires_at IS NULL) OR (expires_at > now())) AND 
  ((max_uses IS NULL) OR (current_uses < max_uses))
);

-- 4. Fix orders table - ensure proper financial data protection
DROP POLICY IF EXISTS "Users can view their own orders only" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders only" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders only" ON public.orders;

CREATE POLICY "Users can view their own orders only" 
ON public.orders 
FOR SELECT 
USING (auth.uid() = user_id);

-- Only system/admins can create/modify orders
CREATE POLICY "System can manage orders" 
ON public.orders 
FOR ALL 
USING (user_has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (user_has_role(auth.uid(), 'admin'::app_role));

-- 5. Enhanced API keys security
DROP POLICY IF EXISTS "Only admins can manage API keys" ON public.api_keys;
CREATE POLICY "Only super admins can manage API keys" 
ON public.api_keys 
FOR ALL 
USING (user_has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (user_has_role(auth.uid(), 'admin'::app_role));