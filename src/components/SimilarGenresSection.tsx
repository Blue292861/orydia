import React from 'react';
import { SimilarGenre } from '@/utils/searchRecommendations';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { GENRE_DESCRIPTIONS } from '@/constants/genres';

interface SimilarGenresSectionProps {
  genres: SimilarGenre[];
}

export const SimilarGenresSection: React.FC<SimilarGenresSectionProps> = ({ genres }) => {
  const navigate = useNavigate();

  if (genres.length === 0) return null;

  const handleGenreClick = (genre: string) => {
    const genreSlug = genre.toLowerCase().replace(/\//g, '-');
    navigate(`/genre/${genreSlug}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-amber-600" />
        <h2 className="text-xl font-bold text-forest-900">Genres similaires</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {genres.map((genreData) => (
          <Card
            key={genreData.genre}
            className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 bg-gradient-to-br from-wood-50/95 to-amber-50/95 border border-wood-300/50 hover:border-amber-400/70 overflow-hidden"
            onClick={() => handleGenreClick(genreData.genre)}
          >
            <CardContent className="p-6 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-forest-900 group-hover:text-amber-800 transition-colors mb-2">
                    {genreData.genre}
                  </h3>
                  <p className="text-xs text-forest-600 line-clamp-2">
                    {GENRE_DESCRIPTIONS[genreData.genre]}
                  </p>
                </div>
                
                {/* Score de correspondance */}
                <div className="flex-shrink-0 ml-2">
                  <div className="bg-amber-100 text-amber-800 rounded-full px-2 py-1 text-xs font-bold">
                    {Math.round(genreData.matchScore * 100)}%
                  </div>
                </div>
              </div>
              
              <div className="pt-3 border-t border-wood-200">
                <p className="text-xs text-forest-700 font-medium">
                  {genreData.count} {genreData.count > 1 ? 'œuvres disponibles' : 'œuvre disponible'}
                </p>
              </div>

              {/* Barre de correspondance */}
              <div className="w-full bg-wood-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all duration-500"
                  style={{ width: `${Math.round(genreData.matchScore * 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
