import React from 'react';
import { Audiobook } from '@/types/Audiobook';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Zap, Play } from 'lucide-react';

interface AudiobookCardProps {
  audiobook: Audiobook;
  onClick: (audiobook: Audiobook) => void;
}

export const AudiobookCard: React.FC<AudiobookCardProps> = ({ audiobook, onClick }) => {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 max-w-[220px] ${
        audiobook.is_premium ? "ring-2 ring-yellow-500" : ""
      }`}
      onClick={() => onClick(audiobook)}
    >
      <div className="relative">
        <img 
          src={audiobook.cover_url} 
          alt={audiobook.name}
          className="w-full h-36 object-cover rounded-t-lg" 
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center rounded-t-lg">
          <Play className="h-8 w-8 text-white opacity-0 hover:opacity-100 transition-opacity" />
        </div>
        {audiobook.is_premium && (
          <Crown className="absolute top-2 right-2 h-4 w-4 text-yellow-500" />
        )}
        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
          <img src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" alt="Tensens Icon" className="h-3 w-3" />
          <span className="font-medium text-white text-xs">{audiobook.points}</span>
        </div>
      </div>
      
      <CardContent className="p-3 space-y-2">
        <div>
          <h3 className="font-bold text-sm line-clamp-2">{audiobook.name}</h3>
          <p className="text-muted-foreground text-xs">{audiobook.author}</p>
          {audiobook.genre && (
            <p className="text-primary text-xs font-medium mt-1">{audiobook.genre}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          {audiobook.is_premium && (
            <Badge variant="default" className="bg-yellow-500 text-white text-xs">
              <Crown className="h-3 w-3 mr-1" /> Premium
            </Badge>
          )}
          {audiobook.is_featured && (
            <Badge variant="default" className="bg-purple-500 text-white text-xs">
              <Star className="h-3 w-3 mr-1" /> À la Une
            </Badge>
          )}
          {audiobook.is_month_success && (
            <Badge variant="default" className="bg-blue-500 text-white text-xs">
              <Star className="h-3 w-3 mr-1" /> Succès du mois
            </Badge>
          )}
          {audiobook.is_paco_favourite && (
            <Badge variant="default" className="bg-green-500 text-white text-xs">
              <Zap className="h-3 w-3 mr-1" /> Coup de cœur
            </Badge>
          )}
        </div>

        {audiobook.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {audiobook.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};