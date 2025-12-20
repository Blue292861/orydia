-- ==============================================
-- SKILL TREE SYSTEM
-- ==============================================

-- Table des chemins de compétences
CREATE TABLE public.skill_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🌳',
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.skill_paths ENABLE ROW LEVEL SECURITY;

-- RLS Policies for skill_paths
CREATE POLICY "Anyone can view active skill paths" 
ON public.skill_paths FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage skill paths" 
ON public.skill_paths FOR ALL 
USING (user_has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (user_has_role(auth.uid(), 'admin'::app_role));

-- Table des compétences
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id UUID NOT NULL REFERENCES public.skill_paths(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '⭐',
  position INTEGER NOT NULL, -- Rang dans le chemin (1, 2, 3...)
  skill_point_cost INTEGER NOT NULL DEFAULT 1,
  
  -- Type de bonus: day_orydors, genre_orydors, chest_drop
  bonus_type TEXT NOT NULL CHECK (bonus_type IN ('day_orydors', 'genre_orydors', 'chest_drop')),
  
  -- Configuration du bonus (JSONB pour flexibilité)
  -- day_orydors: {"days": [0, 6], "percentage": 2} (0=dimanche, 6=samedi)
  -- genre_orydors: {"genre": "Policier", "percentage": 1}
  -- chest_drop: {"reward_type_id": "uuid...", "percentage": 1}
  bonus_config JSONB NOT NULL,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(path_id, position)
);

-- Enable RLS
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

-- RLS Policies for skills
CREATE POLICY "Anyone can view active skills" 
ON public.skills FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage skills" 
ON public.skills FOR ALL 
USING (user_has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (user_has_role(auth.uid(), 'admin'::app_role));

-- Table des compétences débloquées par utilisateur
CREATE TABLE public.user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, skill_id)
);

-- Enable RLS
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_skills
CREATE POLICY "Users can view their own skills" 
ON public.user_skills FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own skills via function" 
ON public.user_skills FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all user skills" 
ON public.user_skills FOR ALL 
USING (user_has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (user_has_role(auth.uid(), 'admin'::app_role));

-- Ajouter skill_points à user_stats
ALTER TABLE public.user_stats ADD COLUMN IF NOT EXISTS skill_points INTEGER NOT NULL DEFAULT 0;

-- ==============================================
-- FUNCTIONS
-- ==============================================

-- Fonction pour débloquer une compétence
CREATE OR REPLACE FUNCTION public.unlock_skill(p_user_id UUID, p_skill_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_skill RECORD;
  v_user_skill_points INTEGER;
  v_previous_skill_unlocked BOOLEAN;
  v_skill_bonus JSONB;
BEGIN
  -- Récupérer la compétence
  SELECT s.*, sp.id as path_identifier, sp.name as path_name
  INTO v_skill 
  FROM skills s
  JOIN skill_paths sp ON sp.id = s.path_id
  WHERE s.id = p_skill_id AND s.is_active = true AND sp.is_active = true;
  
  IF v_skill IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Compétence non trouvée ou inactive');
  END IF;
  
  -- Vérifier que l'utilisateur a assez de points
  SELECT skill_points INTO v_user_skill_points
  FROM user_stats WHERE user_id = p_user_id;
  
  IF v_user_skill_points IS NULL THEN
    v_user_skill_points := 0;
  END IF;
  
  IF v_user_skill_points < v_skill.skill_point_cost THEN
    RETURN jsonb_build_object('success', false, 'error', 'Points de compétences insuffisants');
  END IF;
  
  -- Vérifier que la compétence précédente est débloquée (si position > 1)
  IF v_skill.position > 1 THEN
    SELECT EXISTS(
      SELECT 1 FROM user_skills us
      JOIN skills s ON s.id = us.skill_id
      WHERE us.user_id = p_user_id
        AND s.path_id = v_skill.path_id
        AND s.position = v_skill.position - 1
    ) INTO v_previous_skill_unlocked;
    
    IF NOT v_previous_skill_unlocked THEN
      RETURN jsonb_build_object('success', false, 'error', 'La compétence précédente doit être débloquée');
    END IF;
  END IF;
  
  -- Vérifier que la compétence n'est pas déjà débloquée
  IF EXISTS(SELECT 1 FROM user_skills WHERE user_id = p_user_id AND skill_id = p_skill_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Compétence déjà débloquée');
  END IF;
  
  -- Débiter les points
  UPDATE user_stats SET skill_points = skill_points - v_skill.skill_point_cost
  WHERE user_id = p_user_id;
  
  -- Ajouter la compétence
  INSERT INTO user_skills (user_id, skill_id) VALUES (p_user_id, p_skill_id);
  
  -- Construire le bonus pour la réponse
  v_skill_bonus := jsonb_build_object(
    'bonus_type', v_skill.bonus_type,
    'bonus_config', v_skill.bonus_config
  );
  
  RETURN jsonb_build_object(
    'success', true, 
    'skill_name', v_skill.name,
    'skill_cost', v_skill.skill_point_cost,
    'remaining_points', v_user_skill_points - v_skill.skill_point_cost,
    'bonus', v_skill_bonus
  );
END;
$$;

-- Fonction pour récupérer les bonus actifs de l'utilisateur
-- Retourne uniquement le bonus de la compétence la plus haute par chemin
CREATE OR REPLACE FUNCTION public.get_user_active_skill_bonuses(p_user_id UUID)
RETURNS TABLE(
  path_id UUID,
  path_name TEXT,
  skill_name TEXT,
  skill_position INTEGER,
  bonus_type TEXT,
  bonus_config JSONB
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Pour chaque chemin, retourner uniquement le bonus de la compétence la plus haute débloquée
  RETURN QUERY
  SELECT DISTINCT ON (s.path_id) 
    s.path_id,
    sp.name as path_name,
    s.name as skill_name,
    s.position as skill_position,
    s.bonus_type,
    s.bonus_config
  FROM user_skills us
  JOIN skills s ON s.id = us.skill_id
  JOIN skill_paths sp ON sp.id = s.path_id
  WHERE us.user_id = p_user_id
    AND s.is_active = true
    AND sp.is_active = true
  ORDER BY s.path_id, s.position DESC;
END;
$$;

-- Fonction pour obtenir les stats de compétences d'un utilisateur
CREATE OR REPLACE FUNCTION public.get_user_skill_stats(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_skill_points INTEGER;
  v_unlocked_skills INTEGER;
  v_total_skills INTEGER;
BEGIN
  -- Récupérer les points de compétences
  SELECT COALESCE(skill_points, 0) INTO v_skill_points
  FROM user_stats WHERE user_id = p_user_id;
  
  -- Compter les compétences débloquées
  SELECT COUNT(*) INTO v_unlocked_skills
  FROM user_skills WHERE user_id = p_user_id;
  
  -- Compter le total des compétences actives
  SELECT COUNT(*) INTO v_total_skills
  FROM skills WHERE is_active = true;
  
  RETURN jsonb_build_object(
    'skill_points', COALESCE(v_skill_points, 0),
    'unlocked_skills', COALESCE(v_unlocked_skills, 0),
    'total_skills', COALESCE(v_total_skills, 0)
  );
END;
$$;

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_skill_paths_updated_at
BEFORE UPDATE ON public.skill_paths
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_skills_updated_at
BEFORE UPDATE ON public.skills
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();