export const LITERARY_GENRES = [
  'Fantaisie',
  'Fantastique',
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
  'Érotisme',
  'Dystopie'
] as const;

export type LiteraryGenre = typeof LITERARY_GENRES[number];

export const GENRE_DESCRIPTIONS: Record<LiteraryGenre, string> = {
  'Fantaisie': 'Mondes magiques et créatures fantastiques',
  'Fantastique': 'Surnaturel et paranormal',
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
  'Érotisme': 'Contenu pour adultes et sensuel',
  'Dystopie': 'Sociétés futures oppressives'
};