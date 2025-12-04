import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { UserCollectionProgress } from '@/types/Collection';
import { Gift, Check, ChevronRight } from 'lucide-react';

interface CollectionCardProps {
  progress: UserCollectionProgress;
  onClick: () => void;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({ progress, onClick }) => {
  const { collection, totalCards, collectedCards, isComplete, chestClaimed } = progress;

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
        isComplete && !chestClaimed ? 'ring-2 ring-amber-500 animate-pulse' : ''
      } ${isComplete && chestClaimed ? 'opacity-75' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="relative">
            <img 
              src={collection.icon_url} 
              alt={collection.name} 
              className="w-14 h-14 object-contain rounded-lg bg-muted p-1"
            />
            {isComplete && (
              <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${
                chestClaimed ? 'bg-green-500' : 'bg-amber-500'
              }`}>
                {chestClaimed ? (
                  <Check className="w-3 h-3 text-white" />
                ) : (
                  <Gift className="w-3 h-3 text-white" />
                )}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-sm truncate">{collection.name}</h3>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </div>
            
            <div className="space-y-2">
              <Progress 
                value={progress.progress} 
                className={`h-2 ${isComplete ? 'bg-amber-200' : ''}`}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{collectedCards}/{totalCards} cartes</span>
                <span>{Math.round(progress.progress)}%</span>
              </div>
            </div>

            {isComplete && !chestClaimed && (
              <Badge className="mt-2 bg-amber-500 text-white animate-bounce">
                <Gift className="w-3 h-3 mr-1" />
                Coffre disponible !
              </Badge>
            )}

            {chestClaimed && (
              <Badge variant="secondary" className="mt-2">
                <Check className="w-3 h-3 mr-1" />
                Complète
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
