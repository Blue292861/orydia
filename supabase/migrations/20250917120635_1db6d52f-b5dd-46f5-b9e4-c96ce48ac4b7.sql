-- Fix critical security issue: Restrict access to subscribers table
-- Only allow users to see their own subscription data and admins to see all

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "Admins can manage subscriptions" ON public.subscribers;

-- Enable RLS if not already enabled
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Policy for users to view only their own subscription data
CREATE POLICY "Users can view their own subscription" 
ON public.subscribers 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy for admins to view all subscriptions
CREATE POLICY "Admins can view all subscriptions" 
ON public.subscribers 
FOR SELECT 
USING (user_has_role(auth.uid(), 'admin'::app_role));

-- Policy for admins to manage subscriptions
CREATE POLICY "Admins can manage subscriptions" 
ON public.subscribers 
FOR ALL 
USING (user_has_role(auth.uid(), 'admin'::app_role));