
-- Ajouter les champs d'adresse à la table profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS street_address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT;

-- Mettre à jour la fonction handle_new_user pour inclure les nouveaux champs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
begin
  insert into public.profiles (id, username, first_name, last_name, street_address, city, postal_code, country)
  values (
    new.id, 
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'street_address',
    new.raw_user_meta_data->>'city',
    new.raw_user_meta_data->>'postal_code',
    new.raw_user_meta_data->>'country'
  );
  return new;
end;
$function$;
