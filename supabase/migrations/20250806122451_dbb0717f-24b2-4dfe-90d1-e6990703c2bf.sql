-- Modifier la table shop_items pour ajouter un niveau minimum requis
ALTER TABLE shop_items ADD COLUMN IF NOT EXISTS required_level integer DEFAULT 1;

-- Ajouter des commentaires pour documenter les nouveaux champs
COMMENT ON COLUMN shop_items.required_level IS 'Niveau minimum requis pour acheter cet article';

-- Créer une fonction pour calculer le niveau basé sur l'XP avec progression exponentielle
CREATE OR REPLACE FUNCTION calculate_exponential_level(xp_points integer)
RETURNS TABLE(level integer, current_xp integer, next_level_xp integer, level_title text)
LANGUAGE sql
IMMUTABLE
AS $$
  WITH level_calc AS (
    SELECT 
      CASE 
        WHEN xp_points < 100 THEN 1
        WHEN xp_points < 250 THEN 2
        WHEN xp_points < 450 THEN 3
        WHEN xp_points < 700 THEN 4
        WHEN xp_points < 1000 THEN 5
        WHEN xp_points < 1350 THEN 6
        WHEN xp_points < 1750 THEN 7
        WHEN xp_points < 2200 THEN 8
        WHEN xp_points < 2700 THEN 9
        WHEN xp_points < 3250 THEN 10
        WHEN xp_points < 3850 THEN 11
        WHEN xp_points < 4500 THEN 12
        WHEN xp_points < 5200 THEN 13
        WHEN xp_points < 5950 THEN 14
        WHEN xp_points < 6750 THEN 15
        WHEN xp_points < 7600 THEN 16
        WHEN xp_points < 8500 THEN 17
        WHEN xp_points < 9450 THEN 18
        WHEN xp_points < 10450 THEN 19
        ELSE LEAST(50, 20 + (xp_points - 10450) / 1000)
      END as calculated_level
  )
  SELECT 
    calculated_level,
    CASE calculated_level
      WHEN 1 THEN xp_points
      WHEN 2 THEN xp_points - 100
      WHEN 3 THEN xp_points - 250
      WHEN 4 THEN xp_points - 450
      WHEN 5 THEN xp_points - 700
      WHEN 6 THEN xp_points - 1000
      WHEN 7 THEN xp_points - 1350
      WHEN 8 THEN xp_points - 1750
      WHEN 9 THEN xp_points - 2200
      WHEN 10 THEN xp_points - 2700
      WHEN 11 THEN xp_points - 3250
      WHEN 12 THEN xp_points - 3850
      WHEN 13 THEN xp_points - 4500
      WHEN 14 THEN xp_points - 5200
      WHEN 15 THEN xp_points - 5950
      WHEN 16 THEN xp_points - 6750
      WHEN 17 THEN xp_points - 7600
      WHEN 18 THEN xp_points - 8500
      WHEN 19 THEN xp_points - 9450
      ELSE xp_points - (10450 + (calculated_level - 20) * 1000)
    END as current_level_xp,
    CASE calculated_level
      WHEN 1 THEN 100
      WHEN 2 THEN 150
      WHEN 3 THEN 200
      WHEN 4 THEN 250
      WHEN 5 THEN 300
      WHEN 6 THEN 350
      WHEN 7 THEN 400
      WHEN 8 THEN 450
      WHEN 9 THEN 500
      WHEN 10 THEN 550
      WHEN 11 THEN 600
      WHEN 12 THEN 650
      WHEN 13 THEN 700
      WHEN 14 THEN 750
      WHEN 15 THEN 800
      WHEN 16 THEN 850
      WHEN 17 THEN 900
      WHEN 18 THEN 950
      WHEN 19 THEN 1000
      ELSE 1000
    END as xp_for_next_level,
    CASE calculated_level
      WHEN 1 THEN 'Apprenti Lecteur'
      WHEN 2 THEN 'Lecteur Novice'
      WHEN 3 THEN 'Lecteur en Herbe'
      WHEN 4 THEN 'Passionné de Lecture'
      WHEN 5 THEN 'Dévoreur de Livres'
      WHEN 6 THEN 'Rat de Bibliothèque'
      WHEN 7 THEN 'Érudit Littéraire'
      WHEN 8 THEN 'Maître Lecteur'
      WHEN 9 THEN 'Sage des Mots'
      WHEN 10 THEN 'Bibliothécaire'
      WHEN 11 THEN 'Gardien du Savoir'
      WHEN 12 THEN 'Archiviste Légendaire'
      WHEN 13 THEN 'Maître des Récits'
      WHEN 14 THEN 'Oracle Littéraire'
      WHEN 15 THEN 'Seigneur des Livres'
      WHEN 16 THEN 'Titan de la Lecture'
      WHEN 17 THEN 'Légende Vivante'
      WHEN 18 THEN 'Divinité Littéraire'
      WHEN 19 THEN 'Empereur des Mots'
      ELSE 'Maître Absolu'
    END as title
  FROM level_calc;
$$;

-- Modifier la fonction calculate_level existante pour utiliser la nouvelle logique
CREATE OR REPLACE FUNCTION public.calculate_level(experience_points integer)
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT level FROM calculate_exponential_level(experience_points);
$$;

-- Créer une vue pour faciliter l'accès aux informations de niveau
CREATE OR REPLACE VIEW user_level_info AS
SELECT 
  us.user_id,
  us.experience_points,
  us.total_points,
  cl.level,
  cl.current_xp,
  cl.next_level_xp,
  cl.level_title
FROM user_stats us
CROSS JOIN LATERAL calculate_exponential_level(us.experience_points) cl;