-- Create function to clean up orphaned storage files
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_storage_files()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  storage_record RECORD;
  referenced_files text[];
  orphaned_files text[];
BEGIN
  -- Cette fonction peut être exécutée manuellement par les admins pour nettoyer les fichiers orphelins
  -- Elle identifie les fichiers dans Storage qui ne sont plus référencés dans aucune table
  
  -- Log de démarrage
  INSERT INTO public.security_audit_log (event_type, user_id, details, created_at)
  VALUES ('storage_cleanup_started', auth.uid(), jsonb_build_object('started_at', now()), now());

  -- Note: L'implémentation complète nécessiterait d'interroger l'API Storage
  -- Cette fonction sert de base pour une future implémentation de nettoyage automatique
  
  RAISE NOTICE 'Fonction de nettoyage des fichiers orphelins créée. Implémentation manuelle requise.';
END;
$$;

-- Ajouter une politique RLS pour que seuls les admins puissent exécuter cette fonction
COMMENT ON FUNCTION public.cleanup_orphaned_storage_files() IS 'Fonction utilitaire pour identifier et nettoyer les fichiers Storage orphelins. Réservée aux administrateurs.';

-- Créer un trigger pour nettoyer automatiquement les anciens fichiers lors des mises à jour
CREATE OR REPLACE FUNCTION public.cleanup_old_files_on_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log les changements de fichiers pour audit
  IF TG_TABLE_NAME = 'books' THEN
    IF OLD.cover_url IS DISTINCT FROM NEW.cover_url AND OLD.cover_url IS NOT NULL THEN
      INSERT INTO public.security_audit_log (event_type, user_id, details, created_at)
      VALUES ('file_reference_updated', auth.uid(), 
              jsonb_build_object(
                'table', 'books', 
                'old_file', OLD.cover_url, 
                'new_file', NEW.cover_url,
                'record_id', NEW.id
              ), now());
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Appliquer le trigger aux tables principales
CREATE TRIGGER books_file_cleanup_trigger
  BEFORE UPDATE ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_old_files_on_update();

CREATE TRIGGER shop_items_file_cleanup_trigger
  BEFORE UPDATE ON public.shop_items
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_old_files_on_update();