-- Create collections table
CREATE TABLE public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT NOT NULL,
  orydors_reward INTEGER DEFAULT 0,
  xp_reward INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create collection_item_rewards table (items given on completion)
CREATE TABLE public.collection_item_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  reward_type_id UUID NOT NULL REFERENCES public.reward_types(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_collection_completions table
CREATE TABLE public.user_collection_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT now(),
  chest_claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMPTZ,
  UNIQUE(user_id, collection_id)
);

-- Add collection_id to reward_types
ALTER TABLE public.reward_types 
  ADD COLUMN collection_id UUID REFERENCES public.collections(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_item_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_collection_completions ENABLE ROW LEVEL SECURITY;

-- RLS policies for collections
CREATE POLICY "Anyone can view active collections" ON public.collections
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage collections" ON public.collections
  FOR ALL USING (user_has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for collection_item_rewards
CREATE POLICY "Anyone can view collection rewards" ON public.collection_item_rewards
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage collection rewards" ON public.collection_item_rewards
  FOR ALL USING (user_has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for user_collection_completions
CREATE POLICY "Users can view own completions" ON public.user_collection_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions" ON public.user_collection_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own completions" ON public.user_collection_completions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all completions" ON public.user_collection_completions
  FOR SELECT USING (user_has_role(auth.uid(), 'admin'::app_role));