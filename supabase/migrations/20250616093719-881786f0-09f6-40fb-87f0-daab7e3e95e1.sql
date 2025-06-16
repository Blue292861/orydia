
-- Create books table
CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  cover_url TEXT NOT NULL,
  content TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  is_premium BOOLEAN NOT NULL DEFAULT false,
  is_month_success BOOLEAN NOT NULL DEFAULT false,
  is_paco_favourite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shop_items table
CREATE TABLE public.shop_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL,
  seller TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for books
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view books" 
  ON public.books 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage books" 
  ON public.books 
  FOR ALL 
  TO authenticated
  USING (public.user_has_role(auth.uid(), 'admin'));

-- Add RLS policies for shop_items
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view shop items" 
  ON public.shop_items 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage shop items" 
  ON public.shop_items 
  FOR ALL 
  TO authenticated
  USING (public.user_has_role(auth.uid(), 'admin'));

-- Add triggers to update updated_at columns
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shop_items_updated_at
  BEFORE UPDATE ON public.shop_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for books
INSERT INTO public.books (title, author, cover_url, content, points, tags, is_premium, is_month_success, is_paco_favourite) VALUES
('Le Mystère de la Forêt Enchantée', 'Luna Silverwind', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2728&auto=format&fit=crop', 'Il était une fois, dans une forêt où les arbres murmurent des secrets anciens, une jeune exploratrice nommée Aria découvrit un sentier lumineux qui n''apparaissait qu''à la pleine lune...

Chapitre 1: La Découverte

Le vent nocturne caressait les feuilles argentées tandis qu''Aria avançait prudemment sur le sentier mystérieux. Chaque pas semblait résonner avec une mélodie oubliée, et les lucioles dansaient autour d''elle comme des esprits bienveillants.

Elle avait entendu parler de cette forêt par sa grand-mère, qui lui racontait des histoires de créatures magiques et de trésors cachés. Mais jamais elle n''avait imaginé que ces contes pouvaient être réels.

Soudain, un éclair de lumière dorée attira son attention. Au cœur d''une clairière, se dressait un arbre gigantesque dont l''écorce scintillait comme des diamants. Ses branches s''étendaient vers le ciel étoilé, et ses racines plongeaient profondément dans une terre qui semblait palpiter de vie.

Chapitre 2: L''Arbre de Sagesse

En s''approchant de l''arbre majestueux, Aria entendit une voix douce et mélodieuse qui semblait émaner des profondeurs de son tronc. "Bienvenue, jeune chercheur de vérité", disait la voix. "Je suis le Gardien de cette forêt, et j''ai attendu ta venue."

L''arbre lui révéla alors les secrets de la nature, lui enseignant comment communiquer avec les animaux, comprendre le langage des plantes, et puiser dans l''énergie vitale qui circule dans toute chose vivante.

Cette nuit-là, Aria ne fut plus jamais la même. Elle était devenue une gardienne de la nature, protectrice des mystères de la forêt enchantée.', 150, ARRAY['fantastique', 'aventure', 'nature'], false, true, false),

('Les Chroniques du Royaume Perdu', 'Eldric Stormborn', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=2730&auto=format&fit=crop', 'Dans un royaume où la magie et la technologie coexistent, le jeune prince Kael doit reconquérir son trône usurpé par un sorcier maléfique...

Chapitre 1: L''Exil

Le prince Kael observait les ruines de son château depuis la colline où il s''était réfugié. Les tours qui autrefois s''élançaient fièrement vers les nuages n''étaient plus que des silhouettes brisées contre le ciel rougeoyant.

Trois mois s''étaient écoulés depuis que Malphas, le sorcier noir, avait pris le contrôle du royaume avec ses créatures des ténèbres. Le peuple vivait désormais dans la terreur, et la lumière semblait avoir déserté ces terres autrefois prospères.

Mais Kael n''était pas seul. À ses côtés se tenaient ses fidèles compagnons : Lyra, l''archère aux flèches enchantées, Marcus, le chevalier au cœur de lion, et Sage, le jeune mage prodige qui maîtrisait les arts anciens.

Chapitre 2: La Quête

Ensemble, ils entreprirent un voyage périlleux à travers les terres désolées, à la recherche des trois Cristaux du Pouvoir, seuls capables de briser la malédiction qui pesait sur le royaume.

Leur première destination était la Montagne de Cristal, où dormait le premier artefact. Mais le chemin était semé d''embûches, et Malphas avait envoyé ses serviteurs les plus redoutables pour les arrêter.

Cette aventure épique allait révéler le véritable destin de Kael et la force qui sommeille en chacun de nous face à l''adversité.', 200, ARRAY['aventure', 'magie', 'héroïque'], true, false, true),

('Secrets de l''Océan Infini', 'Marina Deepwater', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=2742&auto=format&fit=crop', 'Plongez dans les profondeurs mystérieuses de l''océan où vivent des créatures extraordinaires et où se cachent des civilisations perdues...

Chapitre 1: La Plongée

Captain Nemo descendait lentement vers les abysses dans son submersible révolutionnaire. Les rayons du soleil s''estompaient graduellement, laissant place à un monde de ténèbres bleutées où seules les créatures bioluminescentes apportaient de la lumière.

À mesure qu''il s''enfonçait dans les profondeurs, des merveilles insoupçonnées se révélaient à lui. Des jardins de corail aux couleurs chatoyantes, des bancs de poissons aux formes impossibles, et des créatures gigantesques qui glissaient silencieusement dans l''obscurité.

Mais ce qui l''attendait au plus profond de l''océan dépassait tout ce qu''il avait pu imaginer.

Chapitre 2: La Cité Engloutie

À trois mille mètres sous la surface, une lueur dorée perça l''obscurité. En s''approchant, Nemo découvrit les vestiges d''une civilisation antique : une cité magnifique aux architecture impossibles, où les bâtiments semblaient défier les lois de la physique.

Les habitants de cette cité, des êtres aquatiques d''une intelligence supérieure, l''accueillirent avec curiosité. Ils lui révélèrent les secrets de l''océan, lui montrèrent comment communiquer avec les créatures marines, et lui enseignèrent les mystères des courants profonds.

Cette rencontre changea à jamais la perception que Nemo avait du monde sous-marin et de sa place dans l''univers.', 175, ARRAY['océan', 'exploration', 'mystère'], false, false, true);

-- Insert sample data for shop_items
INSERT INTO public.shop_items (name, description, price, image_url, category, seller) VALUES
('Épée de bravoure', 'Une épée forgée dans le coeur d''une étoile.', 500, 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?q=80&w=2748&auto=format&fit=crop', 'Arme', 'Forgeron Jo'),
('Armure de l''Aube', 'Protège contre les ombres les plus sombres.', 750, 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?q=80&w=2787&auto=format&fit=crop', 'Armure', 'Artisane Elara'),
('Grimoire des Arcanes', 'Contient des sorts oubliés depuis des éons.', 1200, 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?q=80&w=2942&auto=format&fit=crop', 'Magie', 'Paco le Bibliothécaire'),
('Potion de vitalité', 'Restaure la santé et la vigueur.', 150, 'https://images.unsplash.com/photo-1493962853295-0fd70327578a?q=80&w=2938&auto=format&fit=crop', 'Consommable', 'Alchimiste Zander'),
('Amulette de perspicacité', 'Augmente l''intelligence et la sagesse du porteur.', 800, 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?q=80&w=2787&auto=format&fit=crop', 'Accessoire', 'Artisane Elara');
