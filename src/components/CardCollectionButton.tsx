import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface CardCollectionButtonProps {
  cardCount: number;
  onClick: () => void;
}

export const CardCollectionButton: React.FC<CardCollectionButtonProps> = ({ cardCount, onClick }) => {
  return (
    <Card className="bg-gradient-to-br from-amber-900/40 to-orange-950/60 border-2 border-amber-700/50 hover:border-amber-500/70 transition-all duration-300 cursor-pointer group" onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-amber-50 mb-1">
                🃏 Ma Collection de Cartes
              </h3>
              <p className="text-amber-200/80 text-sm">
                {cardCount} {cardCount > 1 ? 'cartes collectionnées' : 'carte collectionnée'}
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="bg-amber-600/20 hover:bg-amber-600/40 border-amber-500/50 text-amber-100"
          >
            Voir la collection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
