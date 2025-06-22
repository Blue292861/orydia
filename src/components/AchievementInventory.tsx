
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Zap, Crown } from 'lucide-react';
import { useResponsive } from '@/hooks/useResponsive';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  points: number;
  unlocked: boolean;
  premiumMonths?: number;
}

interface AchievementInventoryProps {
  achievements: Achievement[];
  totalAchievementPoints: number;
}

export const AchievementInventory: React.FC<AchievementInventoryProps> = ({
  achievements,
  totalAchievementPoints
}) => {
  const { isMobile, isTablet } = useResponsive();

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      case 'ultra-legendary': return 'bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400';
      case 'rare': return 'border-blue-400';
      case 'epic': return 'border-purple-400';
      case 'legendary': return 'border-yellow-400';
      case 'ultra-legendary': return 'border-2 border-gradient-to-r from-pink-400 via-purple-400 to-yellow-400';
      default: return 'border-gray-400';
    }
  };

  const getAchievementGridCols = () => {
    if (isMobile) return 'grid-cols-2';
    if (isTablet) return 'grid-cols-3';
    return 'grid-cols-2 md:grid-cols-4';
  };

  return (
    <Card className="bg-slate-800 border-2 border-slate-600">
      <CardHeader>
        <div className={`flex items-center gap-3 ${
          isMobile ? 'flex-col text-center gap-2' : ''
        }`}>
          <Trophy className={`text-yellow-400 ${
            isMobile ? 'h-5 w-5' : 'h-6 w-6'
          }`} />
          <CardTitle className={`text-slate-100 ${
            isMobile ? 'text-lg' : 'text-xl'
          }`}>
            Inventaire des Succès
          </CardTitle>
          <Badge className={`bg-slate-700 text-slate-300 ${
            isMobile ? 'text-xs' : 'text-sm'
          }`}>
            {totalAchievementPoints} Tensens de bonus
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`grid gap-4 ${getAchievementGridCols()}`}>
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`
                relative rounded-lg border-2 transition-all duration-300 ${
                  isMobile ? 'p-3' : 'p-4'
                }
                ${achievement.unlocked 
                  ? `${getRarityBorder(achievement.rarity)} bg-gradient-to-br from-slate-700 to-slate-800 shadow-lg transform hover:scale-105 ${
                      achievement.rarity === 'ultra-legendary' ? 'animate-pulse shadow-pink-500/50' : ''
                    }` 
                  : 'border-slate-600 bg-slate-900/50 opacity-50'
                }
              `}
            >
              {achievement.unlocked && (
                <div className="absolute -top-2 -right-2">
                  <div className={`rounded-full ${
                    achievement.rarity === 'ultra-legendary' 
                      ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500' 
                      : getRarityColor(achievement.rarity)
                  } animate-pulse ${
                    isMobile ? 'w-3 h-3' : 'w-4 h-4'
                  }`}></div>
                </div>
              )}
              
              <div className="text-center">
                <div className={`mb-2 ${isMobile ? 'text-2xl' : 'text-3xl'} ${
                  achievement.rarity === 'ultra-legendary' && achievement.unlocked ? 'animate-bounce' : ''
                }`}>
                  {achievement.icon}
                </div>
                <h4 className={`font-bold mb-1 ${
                  achievement.unlocked ? 'text-white' : 'text-slate-500'
                } ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  {achievement.name}
                </h4>
                <p className={`mb-2 ${
                  achievement.unlocked ? 'text-slate-300' : 'text-slate-600'
                } ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                  {achievement.description}
                </p>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1">
                    <Zap className={`text-yellow-400 ${
                      isMobile ? 'h-2 w-2' : 'h-3 w-3'
                    }`} />
                    <span className={`font-bold ${
                      achievement.unlocked ? 'text-yellow-400' : 'text-slate-600'
                    } ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                      +{achievement.points} Tensens
                    </span>
                  </div>
                  
                  {achievement.premiumMonths && achievement.premiumMonths > 0 && (
                    <div className="flex items-center justify-center gap-1">
                      <Crown className={`text-amber-400 ${
                        isMobile ? 'h-2 w-2' : 'h-3 w-3'
                      }`} />
                      <span className={`font-bold ${
                        achievement.unlocked ? 'text-amber-400' : 'text-slate-600'
                      } ${isMobile ? 'text-[9px]' : 'text-xs'}`}>
                        +{achievement.premiumMonths} mois premium
                      </span>
                    </div>
                  )}
                </div>
                
                <Badge 
                  className={`mt-2 border-0 ${
                    achievement.rarity === 'ultra-legendary' 
                      ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 text-white' 
                      : getRarityColor(achievement.rarity) + ' text-white'
                  } ${isMobile ? 'text-[9px]' : 'text-xs'}`}
                >
                  {achievement.rarity === 'ultra-legendary' ? (
                    <span className="flex items-center gap-1">
                      <Crown className="h-2 w-2" />
                      Ultra-Légendaire
                    </span>
                  ) : (
                    achievement.rarity
                  )}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
