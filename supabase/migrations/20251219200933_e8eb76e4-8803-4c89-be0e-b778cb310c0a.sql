-- Ajouter le support des défis de guilde
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS is_guild_challenge BOOLEAN DEFAULT false;

-- Table pour la progression collective des guildes sur les défis
CREATE TABLE public.guild_challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  objective_id UUID NOT NULL REFERENCES public.challenge_objectives(id) ON DELETE CASCADE,
  current_progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(guild_id, objective_id)
);

-- Enable RLS
ALTER TABLE public.guild_challenge_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Les membres de la guilde peuvent voir la progression
CREATE POLICY "Guild members can view their guild challenge progress"
  ON public.guild_challenge_progress
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.guild_members gm
      WHERE gm.guild_id = guild_challenge_progress.guild_id
      AND gm.user_id = auth.uid()
    )
  );

-- Policy: Authenticated users can insert progress (via service)
CREATE POLICY "Authenticated users can insert guild challenge progress"
  ON public.guild_challenge_progress
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Authenticated users can update progress
CREATE POLICY "Authenticated users can update guild challenge progress"
  ON public.guild_challenge_progress
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Créer le bucket avatars s'il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policies pour le bucket avatars
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Index pour la performance
CREATE INDEX IF NOT EXISTS idx_guild_challenge_progress_guild ON public.guild_challenge_progress(guild_id);
CREATE INDEX IF NOT EXISTS idx_guild_challenge_progress_objective ON public.guild_challenge_progress(objective_id);
CREATE INDEX IF NOT EXISTS idx_challenges_is_guild ON public.challenges(is_guild_challenge) WHERE is_guild_challenge = true;