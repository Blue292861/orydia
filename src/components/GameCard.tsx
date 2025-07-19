import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Star } from "lucide-react";
import { Game } from "@/types/Game";

interface GameCardProps {
  game: Game;
  onSelect: (game: Game) => void;
}

export function GameCard({ game, onSelect }: GameCardProps) {
  return (
    <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 min-w-[200px] max-w-[280px]">
      <CardContent className="p-0" onClick={() => onSelect(game)}>
        <div className="aspect-[3/4] relative overflow-hidden rounded-t-lg">
          <img
            src={game.cover_url}
            alt={game.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-2 right-2">
            <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
              {game.name}
            </h3>
            <p className="text-white/80 text-xs">par {game.author}</p>
          </div>
          <div className="absolute top-2 right-2 flex gap-1">
            {game.is_featured && (
              <Badge variant="secondary" className="text-xs">
                <Star className="w-3 h-3 mr-1" />
                À la une
              </Badge>
            )}
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button size="sm" className="bg-primary/90 hover:bg-primary">
              <Play className="w-4 h-4 mr-2" />
              Jouer
            </Button>
          </div>
        </div>
        {game.points_reward > 0 && (
          <div className="p-2">
            <Badge variant="outline" className="text-xs">
              +{game.points_reward} pts
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}