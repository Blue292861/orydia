-- Modifier la table audiobooks pour ajouter le champ genre
ALTER TABLE public.audiobooks ADD COLUMN genre text;

-- Créer la table audiobook_chapters pour gérer les chapitres multiples
CREATE TABLE public.audiobook_chapters (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audiobook_id uuid NOT NULL REFERENCES public.audiobooks(id) ON DELETE CASCADE,
  title text NOT NULL,
  audio_url text NOT NULL,
  chapter_number integer NOT NULL,
  duration_seconds integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Créer la table audiobook_progress pour sauvegarder la progression
CREATE TABLE public.audiobook_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  audiobook_id uuid NOT NULL REFERENCES public.audiobooks(id) ON DELETE CASCADE,
  chapter_id uuid NOT NULL REFERENCES public.audiobook_chapters(id) ON DELETE CASCADE,
  current_time_seconds integer NOT NULL DEFAULT 0,
  is_completed boolean NOT NULL DEFAULT false,
  last_played_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, audiobook_id, chapter_id)
);

-- Activer RLS sur les nouvelles tables
ALTER TABLE public.audiobook_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audiobook_progress ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour audiobook_chapters
CREATE POLICY "Admins can manage audiobook chapters"
ON public.audiobook_chapters
FOR ALL
USING (user_has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view audiobook chapters"
ON public.audiobook_chapters
FOR SELECT
USING (true);

-- Politiques RLS pour audiobook_progress
CREATE POLICY "Users can manage their own audiobook progress"
ON public.audiobook_progress
FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all audiobook progress"
ON public.audiobook_progress
FOR SELECT
USING (user_has_role(auth.uid(), 'admin'::app_role));

-- Trigger pour updated_at sur audiobook_chapters
CREATE TRIGGER update_audiobook_chapters_updated_at
BEFORE UPDATE ON public.audiobook_chapters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger pour updated_at sur audiobook_progress
CREATE TRIGGER update_audiobook_progress_updated_at
BEFORE UPDATE ON public.audiobook_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index pour améliorer les performances
CREATE INDEX idx_audiobook_chapters_audiobook_id ON public.audiobook_chapters(audiobook_id);
CREATE INDEX idx_audiobook_chapters_number ON public.audiobook_chapters(audiobook_id, chapter_number);
CREATE INDEX idx_audiobook_progress_user_id ON public.audiobook_progress(user_id);
CREATE INDEX idx_audiobook_progress_audiobook_id ON public.audiobook_progress(audiobook_id);
CREATE INDEX idx_audiobook_progress_last_played ON public.audiobook_progress(user_id, last_played_at DESC);