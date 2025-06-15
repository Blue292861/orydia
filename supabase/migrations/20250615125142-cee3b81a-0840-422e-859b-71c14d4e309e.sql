
-- Créer une table pour les profils publics des utilisateurs
create table public.profiles (
  id uuid not null primary key,
  username text,
  avatar_url text,
  updated_at timestamp with time zone,

  constraint "profiles_id_fkey" foreign key (id) references auth.users (id) on delete cascade,
  constraint username_length check (char_length(username) >= 3)
);

-- Définir les autorisations au niveau des lignes
alter table public.profiles enable row level security;

create policy "Les profils publics sont visibles par tous."
  on profiles for select
  using ( true );

create policy "Les utilisateurs peuvent insérer leur propre profil."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Les utilisateurs peuvent mettre à jour leur propre profil."
  on profiles for update
  using ( auth.uid() = id );

-- Cette fonction s'exécute chaque fois qu'un utilisateur est créé
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$;

-- Déclencheur pour exécuter la fonction lors de la création d'un nouvel utilisateur
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

