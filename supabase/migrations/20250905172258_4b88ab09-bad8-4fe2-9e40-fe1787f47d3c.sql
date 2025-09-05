-- Fix critical security vulnerability in subscribers table RLS policies
-- Problem: Current policies allow 'public' access instead of 'authenticated' only

-- Drop existing problematic policies
DROP POLICY IF EXISTS "System can insert subscription data" ON public.subscribers;
DROP POLICY IF EXISTS "Users can update only their email" ON public.subscribers;  
DROP POLICY IF EXISTS "Users can view their own subscription data only" ON public.subscribers;

-- Create secure replacement policies that only allow authenticated access
CREATE POLICY "Service role can insert subscription data" 
ON public.subscribers 
FOR INSERT 
TO service_role
WITH CHECK (true);

CREATE POLICY "Edge functions can update subscription data"
ON public.subscribers
FOR UPDATE 
TO service_role
WITH CHECK (true);

CREATE POLICY "Authenticated users can view own subscription data" 
ON public.subscribers 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own email"
ON public.subscribers
FOR UPDATE 
TO authenticated  
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Ensure admin policies are also restricted to authenticated users
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "Only admins can delete subscriptions" ON public.subscribers;

CREATE POLICY "Authenticated admins can manage all subscriptions"
ON public.subscribers
FOR ALL
TO authenticated
USING (user_has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (user_has_role(auth.uid(), 'admin'::app_role));

-- Also fix similar issues in other sensitive tables
-- Fix orders table policies
DROP POLICY IF EXISTS "Users can view their own orders only" ON public.orders;
CREATE POLICY "Authenticated users can view own orders" 
ON public.orders 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Fix profiles table policies  
DROP POLICY IF EXISTS "Users can view only their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent insérer leur propre profil." ON public.profiles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour leur propre profil." ON public.profiles;

CREATE POLICY "Authenticated users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Authenticated users can insert own profile"
ON public.profiles
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can update own profile"
ON public.profiles
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);