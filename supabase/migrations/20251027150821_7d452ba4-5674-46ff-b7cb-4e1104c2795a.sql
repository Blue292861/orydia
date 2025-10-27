-- Ajouter la colonne postal_code à la table profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS postal_code text;

-- Mettre à jour le trigger pour inclure le code postal
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public 
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, first_name, last_name, address, postal_code, city, country)
  VALUES (
    new.id, 
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'address',
    new.raw_user_meta_data ->> 'postal_code',
    new.raw_user_meta_data ->> 'city',
    new.raw_user_meta_data ->> 'country'
  );
  RETURN new;
END;
$$;