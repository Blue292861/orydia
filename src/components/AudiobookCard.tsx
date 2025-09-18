import React from 'react';
import { Audiobook } from '@/types/Audiobook';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Zap, Play } from 'lucide-react';
import { ShareButton } from '@/components/ShareButton';

interface AudiobookCardProps {
  audiobook: Audiobook;
  onClick: (audiobook: Audiobook) => void;
}

export const AudiobookCard: React.FC<AudiobookCardProps> = ({ audiobook, onClick }) => {
  return (
    <Card 
      className={`group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-105 max-w-[220px] overflow-hidden bg-gradient-to-br from-wood-100 via-stone-50 to-wood-50 border-2 border-wood-300 hover:border-gold-400 ${
        audiobook.is_premium ? "ring-2 ring-gold-500/60" : ""
      }`}
      onClick={() => onClick(audiobook)}
    >
      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-4 h-4 bg-gradient-to-br from-gold-400 to-transparent opacity-30 rounded-br-full z-10"></div>
      <div className="absolute top-0 right-0 w-4 h-4 bg-gradient-to-bl from-gold-400 to-transparent opacity-30 rounded-bl-full z-10"></div>
      
      <div className="relative overflow-hidden">
        <img 
          src={audiobook.cover_url} 
          alt={audiobook.name}
          className="w-full h-36 object-cover transition-transform duration-500 group-hover:scale-110" 
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-forest-900/60 via-transparent to-transparent"></div>
        
        {/* Play button overlay */}
        <div className="absolute inset-0 bg-forest-800/0 group-hover:bg-forest-800/40 transition-all duration-500 flex items-center justify-center">
          <div className="bg-gradient-to-br from-gold-400 to-gold-600 rounded-full p-3 opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-500 shadow-lg">
            <Play className="h-6 w-6 text-forest-900 fill-current ml-0.5" />
          </div>
        </div>
        
        {audiobook.is_premium && (
          <div className="absolute top-2 right-2 bg-gradient-to-br from-gold-400 via-gold-500 to-gold-600 rounded-full p-1 shadow-lg">
            <Crown className="h-4 w-4 text-gold-900 fill-current" />
          </div>
        )}
        
        {/* Enhanced Tensens display */}
        <div className="absolute bottom-2 left-2 bg-gradient-to-r from-forest-800/90 to-forest-700/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1 border border-gold-400/30">
          <img src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" alt="Tensens Icon" className="h-3 w-3 drop-shadow-sm" />
          <span className="font-bold text-gold-200 text-xs drop-shadow-sm">{audiobook.points}</span>
        </div>
        
        {/* Hover shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-gold-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
      
      <CardContent className="p-3 space-y-2 bg-gradient-to-br from-wood-50 to-stone-100 relative">
        {/* Decorative border */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-300 to-transparent"></div>
        
        <div>
          <h3 className="font-display font-bold text-sm line-clamp-2 text-forest-800 group-hover:text-forest-900 transition-colors duration-300">{audiobook.name}</h3>
          <p className="text-forest-600 text-xs font-nature italic">{audiobook.author}</p>
          {audiobook.genre && (
            <p className="text-primary text-xs font-medium mt-1 font-luxury">{audiobook.genre}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          {audiobook.is_premium && (
            <Badge variant="default" className="bg-gradient-to-r from-gold-400 to-gold-500 text-gold-900 text-xs border-gold-600 font-medium">
              <Crown className="h-3 w-3 mr-1" /> Premium
            </Badge>
          )}
          {audiobook.is_featured && (
            <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs">
              <Star className="h-3 w-3 mr-1" /> À la Une
            </Badge>
          )}
          {audiobook.is_month_success && (
            <Badge variant="default" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs">
              <Star className="h-3 w-3 mr-1" /> Succès du mois
            </Badge>
          )}
          {audiobook.is_paco_favourite && (
            <Badge variant="default" className="bg-gradient-to-r from-forest-500 to-forest-600 text-white text-xs">
              <Zap className="h-3 w-3 mr-1" /> Coup de cœur
            </Badge>
          )}
        </div>

        {audiobook.description && (
          <p className="text-xs text-forest-600 line-clamp-2 font-nature">
            {audiobook.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};