-- Fix remaining RLS policy security issues

-- Fix orders table - remove public access for system role
DROP POLICY IF EXISTS "System can manage orders" ON public.orders;

-- Create secure admin-only policy for orders management
CREATE POLICY "Authenticated admins can manage orders"
ON public.orders
FOR ALL
TO authenticated
USING (user_has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (user_has_role(auth.uid(), 'admin'::app_role));

-- Fix profiles table - restrict admin access to authenticated users only  
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Authenticated admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (user_has_role(auth.uid(), 'admin'::app_role));