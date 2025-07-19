
-- Create games table
CREATE TABLE public.games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  cover_url TEXT NOT NULL,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  points_reward INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create game_chapters table
CREATE TABLE public.game_chapters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_ending BOOLEAN NOT NULL DEFAULT false,
  ending_reward_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(game_id, chapter_number)
);

-- Create game_choices table
CREATE TABLE public.game_choices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id UUID REFERENCES public.game_chapters(id) ON DELETE CASCADE NOT NULL,
  choice_text TEXT NOT NULL,
  next_chapter_id UUID REFERENCES public.game_chapters(id) ON DELETE SET NULL,
  points_reward INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for games
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view games" 
  ON public.games 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage games" 
  ON public.games 
  FOR ALL 
  TO authenticated
  USING (public.user_has_role(auth.uid(), 'admin'));

-- Add RLS policies for game_chapters
ALTER TABLE public.game_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view game chapters" 
  ON public.game_chapters 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage game chapters" 
  ON public.game_chapters 
  FOR ALL 
  TO authenticated
  USING (public.user_has_role(auth.uid(), 'admin'));

-- Add RLS policies for game_choices
ALTER TABLE public.game_choices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view game choices" 
  ON public.game_choices 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage game choices" 
  ON public.game_choices 
  FOR ALL 
  TO authenticated
  USING (public.user_has_role(auth.uid(), 'admin'));

-- Add triggers to update updated_at columns
CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON public.games
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_game_chapters_updated_at
  BEFORE UPDATE ON public.game_chapters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add is_featured column to audiobooks table
ALTER TABLE public.audiobooks ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT false;
