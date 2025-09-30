export const LITERARY_GENRES = [
  'Fantaisie',
  'Science-Fiction',
  'Romance',
  'Western',
  'Slice of Life',
  'Mystère/Thriller',
  'Horreur',
  'Aventure',
  'Comédie',
  'Drame',
  'Historique',
  'Biographie',
  'Policier',
  'Fantasy Urbaine',
  'Dystopie'
] as const;

export type LiteraryGenre = typeof LITERARY_GENRES[number];

export const GENRE_DESCRIPTIONS: Record<LiteraryGenre, string> = {
  'Fantaisie': 'Mondes magiques et créatures fantastiques',
  'Science-Fiction': 'Futur, technologie et exploration spatiale',
  'Romance': 'Histoires d\'amour et relations sentimentales',
  'Western': 'Far West américain et cowboys',
  'Slice of Life': 'Vie quotidienne et réalisme contemporain',
  'Mystère/Thriller': 'Enquêtes et suspense',
  'Horreur': 'Peur, surnaturel et atmosphère terrifiante',
  'Aventure': 'Explorations et quêtes épiques',
  'Comédie': 'Humour et situations comiques',
  'Drame': 'Émotions intenses et tragédies',
  'Historique': 'Récits du passé et époques révolues',
  'Biographie': 'Vies réelles de personnalités',
  'Policier': 'Crimes et investigations',
  'Fantasy Urbaine': 'Magie dans le monde moderne',
  'Dystopie': 'Sociétés futures oppressives'
};