-- Table principale des défis
CREATE TABLE public.challenges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  icon text DEFAULT '🎯',
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  is_active boolean DEFAULT true,
  orydors_reward integer DEFAULT 0,
  xp_reward integer DEFAULT 0,
  item_rewards jsonb DEFAULT '[]'::jsonb,
  premium_months_reward integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid
);

-- Table des objectifs de défi
CREATE TABLE public.challenge_objectives (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id uuid REFERENCES public.challenges(id) ON DELETE CASCADE,
  objective_type text NOT NULL,
  objective_name text NOT NULL,
  target_count integer DEFAULT 1,
  target_book_id uuid REFERENCES public.books(id) ON DELETE SET NULL,
  target_genre text,
  target_reward_type_id uuid REFERENCES public.reward_types(id) ON DELETE SET NULL,
  position integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Table de progression des utilisateurs
CREATE TABLE public.user_challenge_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  challenge_id uuid REFERENCES public.challenges(id) ON DELETE CASCADE,
  objective_id uuid REFERENCES public.challenge_objectives(id) ON DELETE CASCADE,
  current_progress integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, objective_id)
);

-- Table pour les défis terminés
CREATE TABLE public.user_challenge_completions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  challenge_id uuid REFERENCES public.challenges(id) ON DELETE CASCADE,
  completed_at timestamp with time zone DEFAULT now(),
  rewards_claimed boolean DEFAULT false,
  rewards_claimed_at timestamp with time zone,
  UNIQUE(user_id, challenge_id)
);

-- Table pour suivre les notifications vues
CREATE TABLE public.user_challenge_notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  challenge_id uuid REFERENCES public.challenges(id) ON DELETE CASCADE,
  seen_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Index pour les performances
CREATE INDEX idx_challenges_dates ON public.challenges(start_date, end_date, is_active);
CREATE INDEX idx_challenge_objectives_challenge ON public.challenge_objectives(challenge_id);
CREATE INDEX idx_user_challenge_progress_user ON public.user_challenge_progress(user_id);
CREATE INDEX idx_user_challenge_progress_challenge ON public.user_challenge_progress(challenge_id);

-- Enable RLS
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_notifications ENABLE ROW LEVEL SECURITY;

-- Policies pour challenges
CREATE POLICY "Anyone can view active challenges" ON public.challenges
  FOR SELECT USING (is_active = true AND start_date <= now() AND end_date >= now());

CREATE POLICY "Admins can manage challenges" ON public.challenges
  FOR ALL USING (user_has_role(auth.uid(), 'admin'::app_role));

-- Policies pour challenge_objectives
CREATE POLICY "Anyone can view challenge objectives" ON public.challenge_objectives
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.challenges 
    WHERE challenges.id = challenge_objectives.challenge_id 
    AND is_active = true AND start_date <= now() AND end_date >= now()
  ));

CREATE POLICY "Admins can manage challenge objectives" ON public.challenge_objectives
  FOR ALL USING (user_has_role(auth.uid(), 'admin'::app_role));

-- Policies pour user_challenge_progress
CREATE POLICY "Users can view their own progress" ON public.user_challenge_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own progress" ON public.user_challenge_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress" ON public.user_challenge_progress
  FOR SELECT USING (user_has_role(auth.uid(), 'admin'::app_role));

-- Policies pour user_challenge_completions
CREATE POLICY "Users can view their own completions" ON public.user_challenge_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own completions" ON public.user_challenge_completions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all completions" ON public.user_challenge_completions
  FOR SELECT USING (user_has_role(auth.uid(), 'admin'::app_role));

-- Policies pour user_challenge_notifications
CREATE POLICY "Users can view their own notifications" ON public.user_challenge_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own notifications" ON public.user_challenge_notifications
  FOR ALL USING (auth.uid() = user_id);

-- Trigger pour updated_at
CREATE TRIGGER update_challenges_updated_at
  BEFORE UPDATE ON public.challenges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_challenge_progress_updated_at
  BEFORE UPDATE ON public.user_challenge_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();