import React from 'react';
import { SimilarTag } from '@/utils/searchRecommendations';
import { Badge } from '@/components/ui/badge';
import { Tag } from 'lucide-react';

interface SimilarTagsSectionProps {
  tags: SimilarTag[];
  onTagClick: (tag: string) => void;
}

export const SimilarTagsSection: React.FC<SimilarTagsSectionProps> = ({ tags, onTagClick }) => {
  if (tags.length === 0) return null;

  // Calculer la taille du badge basée sur la pertinence
  const getBadgeSize = (relevance: number) => {
    if (relevance > 5) return 'text-base px-4 py-2';
    if (relevance > 3) return 'text-sm px-3 py-1.5';
    return 'text-xs px-2 py-1';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Tag className="w-5 h-5 text-amber-600" />
        <h2 className="text-xl font-bold text-forest-900">Tags similaires</h2>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {tags.map((tagData) => (
          <Badge
            key={tagData.tag}
            variant="outline"
            className={`cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-md bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 text-forest-800 hover:from-amber-100 hover:to-orange-100 hover:border-amber-400 ${getBadgeSize(tagData.relevance)}`}
            onClick={() => onTagClick(tagData.tag)}
          >
            #{tagData.tag}
            {tagData.count > 1 && (
              <span className="ml-1 text-amber-600 font-semibold">
                ({tagData.count})
              </span>
            )}
          </Badge>
        ))}
      </div>
    </div>
  );
};
