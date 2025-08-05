-- Create enum for UI themes
CREATE TYPE public.ui_theme AS ENUM (
  'medieval_fantasy',
  'science_fiction', 
  'slice_of_life',
  'romance',
  'western',
  'default'
);

-- Create table for user genre preferences tracking
CREATE TABLE public.user_genre_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  genre TEXT NOT NULL,
  read_count INTEGER NOT NULL DEFAULT 0,
  total_time_minutes INTEGER NOT NULL DEFAULT 0,
  last_read_at TIMESTAMP WITH TIME ZONE,
  preference_score DECIMAL(3,2) NOT NULL DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, genre)
);

-- Create table for UI themes configuration
CREATE TABLE public.ui_themes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_key ui_theme NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  primary_color TEXT NOT NULL,
  secondary_color TEXT NOT NULL,
  accent_color TEXT NOT NULL,
  background_color TEXT NOT NULL,
  text_color TEXT NOT NULL,
  font_family TEXT NOT NULL,
  vocabulary JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for user theme preferences
CREATE TABLE public.user_theme_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  current_theme ui_theme NOT NULL DEFAULT 'default',
  auto_theme_enabled BOOLEAN NOT NULL DEFAULT true,
  admin_override_theme ui_theme,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.user_genre_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ui_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_theme_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_genre_preferences
CREATE POLICY "Users can view their own genre preferences" 
ON public.user_genre_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own genre preferences" 
ON public.user_genre_preferences 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all genre preferences" 
ON public.user_genre_preferences 
FOR SELECT 
USING (user_has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for ui_themes
CREATE POLICY "Everyone can view UI themes" 
ON public.ui_themes 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage UI themes" 
ON public.ui_themes 
FOR ALL 
USING (user_has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for user_theme_preferences
CREATE POLICY "Users can view their own theme preferences" 
ON public.user_theme_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own theme preferences" 
ON public.user_theme_preferences 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all theme preferences" 
ON public.user_theme_preferences 
FOR SELECT 
USING (user_has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all theme preferences" 
ON public.user_theme_preferences 
FOR ALL 
USING (user_has_role(auth.uid(), 'admin'::app_role));

-- Insert default UI themes
INSERT INTO public.ui_themes (theme_key, name, description, primary_color, secondary_color, accent_color, background_color, text_color, font_family, vocabulary) VALUES
('default', 'Thème par défaut', 'Le thème standard de l''application', 'hsl(222.2, 84%, 4.9%)', 'hsl(210, 40%, 98%)', 'hsl(222.2, 84%, 4.9%)', 'hsl(0, 0%, 100%)', 'hsl(222.2, 84%, 4.9%)', 'Inter', '{"greeting": "Cher lecteur", "welcome": "Bienvenue", "continue_reading": "Continuer la lecture"}'),

('medieval_fantasy', 'Médiéval Fantaisie', 'Thème inspiré de l''époque médiévale et de la fantasy', 'hsl(30, 50%, 25%)', 'hsl(45, 60%, 85%)', 'hsl(45, 80%, 50%)', 'hsl(30, 30%, 95%)', 'hsl(30, 50%, 15%)', 'Cinzel', '{"greeting": "Noble lecteur", "welcome": "Soyez le bienvenu", "continue_reading": "Poursuivre votre quête"}'),

('science_fiction', 'Science-Fiction', 'Thème futuriste et technologique', 'hsl(200, 80%, 30%)', 'hsl(200, 60%, 90%)', 'hsl(180, 100%, 50%)', 'hsl(200, 20%, 95%)', 'hsl(200, 80%, 10%)', 'Orbitron', '{"greeting": "Citoyen", "welcome": "Accès autorisé", "continue_reading": "Continuer l''exploration"}'),

('slice_of_life', 'Tranche de Vie', 'Thème doux et quotidien', 'hsl(150, 40%, 40%)', 'hsl(150, 30%, 90%)', 'hsl(120, 60%, 60%)', 'hsl(150, 20%, 98%)', 'hsl(150, 40%, 20%)', 'Poppins', '{"greeting": "Cher ami", "welcome": "Que la journée soit belle", "continue_reading": "Reprendre la lecture"}'),

('romance', 'Romance', 'Thème romantique et élégant', 'hsl(330, 60%, 40%)', 'hsl(330, 40%, 90%)', 'hsl(0, 70%, 60%)', 'hsl(330, 20%, 98%)', 'hsl(330, 60%, 20%)', 'Playfair Display', '{"greeting": "Mon cœur", "welcome": "Avec tout mon amour", "continue_reading": "Reprendre cette belle histoire"}'),

('western', 'Western', 'Thème du Far West', 'hsl(25, 60%, 30%)', 'hsl(45, 40%, 85%)', 'hsl(35, 80%, 50%)', 'hsl(35, 20%, 95%)', 'hsl(25, 60%, 15%)', 'Rye', '{"greeting": "Partenaire", "welcome": "Howdy", "continue_reading": "Remonter en selle"}');

-- Create function to update genre preferences
CREATE OR REPLACE FUNCTION public.update_genre_preference(
  p_user_id UUID,
  p_genre TEXT,
  p_reading_time_minutes INTEGER DEFAULT 30
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_genre_preferences (user_id, genre, read_count, total_time_minutes, last_read_at)
  VALUES (p_user_id, p_genre, 1, p_reading_time_minutes, now())
  ON CONFLICT (user_id, genre)
  DO UPDATE SET
    read_count = user_genre_preferences.read_count + 1,
    total_time_minutes = user_genre_preferences.total_time_minutes + p_reading_time_minutes,
    last_read_at = now(),
    updated_at = now();
    
  -- Recalculate preference scores for this user
  UPDATE public.user_genre_preferences 
  SET preference_score = (
    read_count::DECIMAL / GREATEST(1, (
      SELECT SUM(read_count) FROM public.user_genre_preferences WHERE user_id = p_user_id
    ))
  ) * 100
  WHERE user_id = p_user_id;
END;
$$;

-- Create function to get recommended theme for user
CREATE OR REPLACE FUNCTION public.get_recommended_theme(p_user_id UUID)
RETURNS ui_theme
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  top_genre TEXT;
  recommended_theme ui_theme;
BEGIN
  -- Get the user's most read genre
  SELECT genre INTO top_genre
  FROM public.user_genre_preferences
  WHERE user_id = p_user_id
  ORDER BY preference_score DESC, read_count DESC
  LIMIT 1;
  
  -- Map genres to themes
  recommended_theme := CASE
    WHEN top_genre IN ('Fantasy', 'Fantaisie', 'Medieval', 'Magic') THEN 'medieval_fantasy'
    WHEN top_genre IN ('Science Fiction', 'SF', 'Sci-Fi', 'Technology', 'Future') THEN 'science_fiction'
    WHEN top_genre IN ('Romance', 'Love', 'Romantic') THEN 'romance'
    WHEN top_genre IN ('Western', 'Cowboy', 'Far West') THEN 'western'
    WHEN top_genre IN ('Slice of Life', 'Daily Life', 'Contemporary', 'Realistic') THEN 'slice_of_life'
    ELSE 'default'
  END;
  
  RETURN recommended_theme;
END;
$$;