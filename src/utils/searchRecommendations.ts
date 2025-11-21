import { Book } from '@/types/Book';
import { Audiobook } from '@/types/Audiobook';
import { Game } from '@/types/Game';
import { LiteraryGenre } from '@/constants/genres';

export interface SimilarAuthor {
  name: string;
  count: number;
  works: Array<Book | Audiobook | Game>;
}

export interface SimilarTag {
  tag: string;
  count: number;
  relevance: number;
}

export interface SimilarGenre {
  genre: LiteraryGenre;
  count: number;
  matchScore: number;
}

export interface SearchRecommendations {
  similarAuthors: SimilarAuthor[];
  similarTags: SimilarTag[];
  similarGenres: SimilarGenre[];
}

// Matrice de similarité des genres
const GENRE_SIMILARITY: Record<string, LiteraryGenre[]> = {
  'Fantaisie': ['Science-Fiction', 'Aventure', 'Dystopie', 'Fantastique'],
  'Science-Fiction': ['Fantaisie', 'Dystopie', 'Aventure', 'Fantastique'],
  'Romance': ['Slice of Life', 'Drame', 'Comédie', 'Historique'],
  'Horreur': ['Mystère/Thriller', 'Dystopie', 'Fantastique', 'Policier'],
  'Mystère/Thriller': ['Policier', 'Horreur', 'Fantastique', 'Dystopie'],
  'Aventure': ['Fantaisie', 'Science-Fiction', 'Historique', 'Western'],
  'Comédie': ['Slice of Life', 'Romance', 'Drame', 'Aventure'],
  'Drame': ['Romance', 'Historique', 'Biographie', 'Slice of Life'],
  'Historique': ['Biographie', 'Drame', 'Aventure', 'Romance'],
  'Dystopie': ['Science-Fiction', 'Horreur', 'Mystère/Thriller', 'Fantaisie'],
  'Policier': ['Mystère/Thriller', 'Horreur', 'Drame', 'Historique'],
  'Fantastique': ['Fantaisie', 'Horreur', 'Mystère/Thriller', 'Science-Fiction'],
  'Western': ['Aventure', 'Historique', 'Drame', 'Policier'],
  'Slice of Life': ['Romance', 'Comédie', 'Drame', 'Biographie'],
  'Biographie': ['Historique', 'Drame', 'Slice of Life', 'Romance'],
  'Érotisme': ['Romance', 'Drame', 'Fantaisie', 'Slice of Life']
};

/**
 * Calcule les recommandations basées sur les résultats de recherche
 */
export const calculateRecommendations = (
  searchResults: { books: Book[]; audiobooks: Audiobook[]; games: Game[] },
  allData: { books: Book[]; audiobooks: Audiobook[]; games: Game[] }
): SearchRecommendations => {
  const allResults = [
    ...searchResults.books,
    ...searchResults.audiobooks,
    ...searchResults.games
  ];

  const allWorks = [
    ...allData.books,
    ...allData.audiobooks,
    ...allData.games
  ];

  // Extraire les auteurs des résultats
  const resultAuthors = new Set(allResults.map(w => w.author.toLowerCase()));
  
  // Extraire les genres des résultats
  const resultGenres = new Set<string>();
  allResults.forEach(work => {
    const genres = 'genres' in work ? work.genres : [];
    genres.forEach(g => resultGenres.add(g));
  });

  // Extraire les tags des résultats
  const resultTags = new Set<string>();
  allResults.forEach(work => {
    const tags = 'tags' in work ? work.tags : [];
    if (tags) {
      tags.forEach(t => resultTags.add(t.toLowerCase()));
    }
  });

  // 1. Trouver les auteurs similaires
  const similarAuthors = findSimilarAuthors(
    allWorks,
    Array.from(resultAuthors),
    Array.from(resultGenres),
    Array.from(resultTags)
  );

  // 2. Trouver les tags similaires
  const similarTags = findSimilarTags(
    allWorks,
    Array.from(resultTags)
  );

  // 3. Trouver les genres similaires
  const similarGenres = findSimilarGenres(
    allWorks,
    Array.from(resultGenres)
  );

  return {
    similarAuthors: similarAuthors.slice(0, 6),
    similarTags: similarTags.slice(0, 12),
    similarGenres: similarGenres.slice(0, 4)
  };
};

/**
 * Trouve les auteurs similaires basés sur les genres et tags partagés
 */
const findSimilarAuthors = (
  allWorks: Array<Book | Audiobook | Game>,
  resultAuthors: string[],
  resultGenres: string[],
  resultTags: string[]
): SimilarAuthor[] => {
  const authorMap = new Map<string, { works: Array<Book | Audiobook | Game>; score: number }>();

  allWorks.forEach(work => {
    const authorLower = work.author.toLowerCase();
    
    // Exclure les auteurs déjà dans les résultats
    if (resultAuthors.includes(authorLower)) return;

    const workGenres = 'genres' in work ? work.genres : [];
    const workTags = 'tags' in work && work.tags ? work.tags.map(t => t.toLowerCase()) : [];

    // Calculer le score de similarité
    const genreMatch = workGenres.filter(g => resultGenres.includes(g)).length / Math.max(resultGenres.length, 1);
    const tagMatch = workTags.filter(t => resultTags.includes(t)).length / Math.max(resultTags.length, 1);
    const points = 'points' in work ? work.points : 0;
    const popularityScore = Math.min(points / 1000, 1);

    const score = (genreMatch * 0.4) + (tagMatch * 0.3) + (popularityScore * 0.3);

    if (score > 0.1) {
      const existing = authorMap.get(work.author);
      if (existing) {
        existing.works.push(work);
        existing.score = Math.max(existing.score, score);
      } else {
        authorMap.set(work.author, { works: [work], score });
      }
    }
  });

  return Array.from(authorMap.entries())
    .map(([name, data]) => ({
      name,
      count: data.works.length,
      works: data.works.slice(0, 3)
    }))
    .sort((a, b) => {
      const scoreA = authorMap.get(a.name)!.score;
      const scoreB = authorMap.get(b.name)!.score;
      return scoreB - scoreA;
    });
};

/**
 * Trouve les tags similaires basés sur la co-occurrence
 */
const findSimilarTags = (
  allWorks: Array<Book | Audiobook | Game>,
  resultTags: string[]
): SimilarTag[] => {
  const tagMap = new Map<string, { count: number; coOccurrence: number }>();

  allWorks.forEach(work => {
    const workTags = 'tags' in work && work.tags ? work.tags.map(t => t.toLowerCase()) : [];
    
    workTags.forEach(tag => {
      // Exclure les tags déjà dans les résultats
      if (resultTags.includes(tag)) return;

      const hasResultTag = workTags.some(t => resultTags.includes(t));
      
      const existing = tagMap.get(tag);
      if (existing) {
        existing.count++;
        if (hasResultTag) existing.coOccurrence++;
      } else {
        tagMap.set(tag, { count: 1, coOccurrence: hasResultTag ? 1 : 0 });
      }
    });
  });

  return Array.from(tagMap.entries())
    .map(([tag, data]) => ({
      tag,
      count: data.count,
      relevance: (data.count * 0.5) + (data.coOccurrence * 0.5)
    }))
    .filter(t => t.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance);
};

/**
 * Trouve les genres similaires basés sur la matrice de similarité
 */
const findSimilarGenres = (
  allWorks: Array<Book | Audiobook | Game>,
  resultGenres: string[]
): SimilarGenre[] => {
  const genreScoreMap = new Map<string, number>();

  // Pour chaque genre dans les résultats, ajouter les genres similaires
  resultGenres.forEach(genre => {
    const similarGenres = GENRE_SIMILARITY[genre] || [];
    similarGenres.forEach((simGenre, index) => {
      // Score décroissant selon la position dans la liste de similarité
      const similarityScore = 1 - (index * 0.2);
      const current = genreScoreMap.get(simGenre) || 0;
      genreScoreMap.set(simGenre, current + similarityScore);
    });
  });

  // Compter le nombre d'œuvres par genre
  const genreCountMap = new Map<string, number>();
  allWorks.forEach(work => {
    const workGenres = 'genres' in work ? work.genres : [];
    workGenres.forEach(g => {
      genreCountMap.set(g, (genreCountMap.get(g) || 0) + 1);
    });
  });

  return Array.from(genreScoreMap.entries())
    .filter(([genre]) => !resultGenres.includes(genre))
    .map(([genre, score]) => ({
      genre: genre as LiteraryGenre,
      count: genreCountMap.get(genre) || 0,
      matchScore: score
    }))
    .filter(g => g.count > 0)
    .sort((a, b) => b.matchScore - a.matchScore);
};
