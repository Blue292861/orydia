
-- Create table to track ad views for free Tensens
CREATE TABLE public.ad_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  ad_type TEXT NOT NULL DEFAULT 'tensens',
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  tensens_earned INTEGER NOT NULL DEFAULT 10
);

-- Add Row Level Security (RLS)
ALTER TABLE public.ad_views ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view their own ad history
CREATE POLICY "Users can view their own ad views" 
  ON public.ad_views 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to insert their own ad views
CREATE POLICY "Users can create their own ad views" 
  ON public.ad_views 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows admins to view all ad views
CREATE POLICY "Admins can view all ad views" 
  ON public.ad_views 
  FOR SELECT 
  USING (user_has_role(auth.uid(), 'admin'::app_role));
