
-- Créer la table des chapitres de livre
CREATE TABLE public.book_chapters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_interactive BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table des choix interactifs
CREATE TABLE public.interactive_choices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id UUID NOT NULL REFERENCES public.book_chapters(id) ON DELETE CASCADE,
  choice_text TEXT NOT NULL,
  consequence_text TEXT,
  next_chapter_id UUID REFERENCES public.book_chapters(id),
  points_modifier INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table de progression utilisateur par chapitre
CREATE TABLE public.user_chapter_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES public.book_chapters(id) ON DELETE CASCADE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, chapter_id)
);

-- Créer la table des choix utilisateur
CREATE TABLE public.user_story_choices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES public.book_chapters(id) ON DELETE CASCADE,
  choice_id UUID NOT NULL REFERENCES public.interactive_choices(id) ON DELETE CASCADE,
  chosen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, chapter_id)
);

-- Ajouter les colonnes nécessaires à la table books
ALTER TABLE public.books ADD COLUMN has_chapters BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.books ADD COLUMN is_interactive BOOLEAN NOT NULL DEFAULT false;

-- Créer les index pour optimiser les performances
CREATE INDEX idx_book_chapters_book_id ON public.book_chapters(book_id);
CREATE INDEX idx_book_chapters_chapter_number ON public.book_chapters(book_id, chapter_number);
CREATE INDEX idx_interactive_choices_chapter_id ON public.interactive_choices(chapter_id);
CREATE INDEX idx_user_chapter_progress_user_book ON public.user_chapter_progress(user_id, book_id);
CREATE INDEX idx_user_story_choices_user_book ON public.user_story_choices(user_id, book_id);

-- Activer Row Level Security sur toutes les nouvelles tables
ALTER TABLE public.book_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactive_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_chapter_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_story_choices ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour book_chapters
CREATE POLICY "Users can view book chapters" ON public.book_chapters
FOR SELECT USING (true);

CREATE POLICY "Admins can manage book chapters" ON public.book_chapters
FOR ALL USING (user_has_role(auth.uid(), 'admin'::app_role));

-- Politiques RLS pour interactive_choices
CREATE POLICY "Users can view interactive choices" ON public.interactive_choices
FOR SELECT USING (true);

CREATE POLICY "Admins can manage interactive choices" ON public.interactive_choices
FOR ALL USING (user_has_role(auth.uid(), 'admin'::app_role));

-- Politiques RLS pour user_chapter_progress
CREATE POLICY "Users can view their own chapter progress" ON public.user_chapter_progress
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own chapter progress" ON public.user_chapter_progress
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all chapter progress" ON public.user_chapter_progress
FOR SELECT USING (user_has_role(auth.uid(), 'admin'::app_role));

-- Politiques RLS pour user_story_choices
CREATE POLICY "Users can view their own story choices" ON public.user_story_choices
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own story choices" ON public.user_story_choices
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all story choices" ON public.user_story_choices
FOR SELECT USING (user_has_role(auth.uid(), 'admin'::app_role));

-- Trigger pour mettre à jour updated_at sur book_chapters
CREATE TRIGGER update_book_chapters_updated_at
    BEFORE UPDATE ON public.book_chapters
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
