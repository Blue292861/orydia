-- Phase 1: Critical Security Fix - Restrict subscribers table RLS policies
-- Remove overly permissive policies that allow unrestricted access

DROP POLICY IF EXISTS "Edge functions can update subscription data" ON public.subscribers;
DROP POLICY IF EXISTS "Service role can insert subscription data" ON public.subscribers;

-- Create secure policy for edge function updates - only for authenticated users
CREATE POLICY "Secure edge function updates" 
ON public.subscribers 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create secure policy for system inserts with validation
CREATE POLICY "Secure system inserts" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (
  user_id IS NOT NULL AND 
  email IS NOT NULL AND 
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- Ensure only users can see their own data or admins can see all
DROP POLICY IF EXISTS "Authenticated users can view own subscription data" ON public.subscribers;

CREATE POLICY "Users can view own subscription data only" 
ON public.subscribers 
FOR SELECT 
USING (auth.uid() = user_id OR user_has_role(auth.uid(), 'admin'::app_role));