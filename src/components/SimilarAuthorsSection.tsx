import React from 'react';
import { SimilarAuthor } from '@/utils/searchRecommendations';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SimilarAuthorsSectionProps {
  authors: SimilarAuthor[];
  onAuthorClick: (authorName: string) => void;
}

export const SimilarAuthorsSection: React.FC<SimilarAuthorsSectionProps> = ({ authors, onAuthorClick }) => {
  if (authors.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <User className="w-5 h-5 text-amber-600" />
        <h2 className="text-xl font-bold text-forest-900">Auteurs similaires</h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {authors.map((author) => (
          <Card
            key={author.name}
            className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 bg-wood-50/95 border border-wood-300/50 hover:border-amber-400/70"
            onClick={() => onAuthorClick(author.name)}
          >
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-center w-full h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg">
                <User className="w-10 h-10 text-amber-700" />
              </div>
              
              <div className="text-center">
                <h3 className="font-semibold text-sm text-forest-900 line-clamp-2 group-hover:text-amber-800 transition-colors">
                  {author.name}
                </h3>
                <p className="text-xs text-forest-600 mt-1">
                  {author.count} {author.count > 1 ? 'œuvres' : 'œuvre'}
                </p>
              </div>

              {/* Miniatures des couvertures */}
              <div className="flex justify-center gap-1 flex-wrap">
                {author.works.slice(0, 3).map((work, idx) => {
                  const coverUrl = 'coverUrl' in work ? work.coverUrl : work.cover_url;
                  return (
                    <div key={idx} className="w-8 h-12 rounded overflow-hidden shadow-sm">
                      <img
                        src={coverUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
