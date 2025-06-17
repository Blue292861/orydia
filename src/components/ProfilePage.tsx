
import React, { useState } from 'react';
import { useUserStats } from '@/contexts/UserStatsContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Star, Crown, Trophy, Zap } from 'lucide-react';
import { EditProfileForm } from '@/components/EditProfileForm';
import { useResponsive } from '@/hooks/useResponsive';

export const ProfilePage: React.FC = () => {
  const { userStats } = useUserStats();
  const { createCheckout } = useAuth();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [loading, setLoading] = useState(false);

  const handlePremiumClick = async () => {
    setLoading(true);
    await createCheckout();
    setLoading(false);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400';
      case 'rare': return 'border-blue-400';
      case 'epic': return 'border-purple-400';
      case 'legendary': return 'border-yellow-400';
      default: return 'border-gray-400';
    }
  };

  const getPlayerLevel = () => {
    if (userStats.booksRead.length < 5) return { level: 1, title: 'Apprenti Lecteur' };
    if (userStats.booksRead.length < 15) return { level: 2, title: 'Lecteur Confirmé' };
    if (userStats.booksRead.length < 30) return { level: 3, title: 'Maître Lecteur' };
    return { level: 4, title: 'Grand Maître' };
  };

  const playerLevel = getPlayerLevel();
  const unlockedAchievements = userStats.achievements.filter(a => a.unlocked);
  const totalAchievementPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);

  const getGridCols = () => {
    if (isMobile) return 'grid-cols-1';
    if (isTablet) return 'grid-cols-1 md:grid-cols-2';
    return 'grid-cols-1 md:grid-cols-3';
  };

  const getAchievementGridCols = () => {
    if (isMobile) return 'grid-cols-2';
    if (isTablet) return 'grid-cols-3';
    return 'grid-cols-2 md:grid-cols-4';
  };

  const getStatsGridCols = () => {
    if (isMobile) return 'grid-cols-2';
    if (isTablet) return 'grid-cols-2 md:grid-cols-4';
    return 'grid-cols-2 md:grid-cols-4';
  };

  const getSpacing = () => {
    if (isMobile) return 'space-y-4 pb-20';
    if (isTablet) return 'space-y-5 pb-20';
    return 'space-y-6 pb-20';
  };

  const getPadding = () => {
    if (isMobile) return 'p-2';
    if (isTablet) return 'p-3';
    return 'p-4';
  };

  return (
    <div className={`${getSpacing()} bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen text-white ${getPadding()} max-w-full overflow-x-hidden`}>
      {/* Edit Profile Button */}
      <div className="flex justify-end mb-4">
        <EditProfileForm />
      </div>

      {/* Player Card */}
      <Card className="bg-gradient-to-r from-amber-700 to-amber-900 border-2 border-amber-400 shadow-xl">
        <CardHeader className={`text-center ${isMobile ? 'pb-1' : 'pb-2'}`}>
          <div className={`flex items-center justify-center gap-3 mb-2 ${
            isMobile ? 'flex-col gap-2' : ''
          }`}>
            <Crown className={`text-amber-300 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`} />
            <CardTitle className={`font-bold text-amber-100 ${
              isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl'
            }`}>
              Profil du Joueur
            </CardTitle>
            {!isMobile && <Crown className="h-8 w-8 text-amber-300" />}
          </div>
          <div className={`flex items-center justify-center gap-2 ${
            isMobile ? 'flex-col gap-1' : ''
          }`}>
            <Badge className={`bg-amber-600 text-amber-100 ${
              isMobile ? 'text-sm px-3 py-1' : 'text-lg px-4 py-1'
            }`}>
              Niveau {playerLevel.level}
            </Badge>
            <Badge className={`bg-purple-600 text-purple-100 ${
              isMobile ? 'text-sm px-3 py-1' : 'text-lg px-4 py-1'
            }`}>
              {playerLevel.title}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className={`grid gap-4 ${getGridCols()}`}>
            <div className={`bg-amber-800/50 rounded-lg border border-amber-600 ${
              isMobile ? 'p-3' : 'p-4'
            }`}>
              <div className={`flex items-center gap-2 mb-2 ${
                isMobile ? 'flex-col text-center gap-1' : ''
              }`}>
                <img src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" alt="Tensens Icon" className={`${
                  isMobile ? 'h-4 w-4' : 'h-5 w-5'
                }`} />
                <span className={`text-amber-200 font-medium ${
                  isMobile ? 'text-sm' : 'text-base'
                }`}>
                  Tensens Totaux
                </span>
              </div>
              <div className={`font-bold text-amber-100 ${
                isMobile ? 'text-2xl' : 'text-3xl'
              }`}>
                {userStats.totalPoints}
              </div>
            </div>
            
            <div className={`bg-amber-800/50 rounded-lg border border-amber-600 ${
              isMobile ? 'p-3' : 'p-4'
            }`}>
              <div className={`flex items-center gap-2 mb-2 ${
                isMobile ? 'flex-col text-center gap-1' : ''
              }`}>
                <BookOpen className={`text-amber-300 ${
                  isMobile ? 'h-4 w-4' : 'h-5 w-5'
                }`} />
                <span className={`text-amber-200 font-medium ${
                  isMobile ? 'text-sm' : 'text-base'
                }`}>
                  Livres Lus
                </span>
              </div>
              <div className={`font-bold text-amber-100 ${
                isMobile ? 'text-2xl' : 'text-3xl'
              }`}>
                {userStats.booksRead.length}
              </div>
            </div>
            
            <div className={`bg-amber-800/50 rounded-lg border border-amber-600 ${
              isMobile ? 'p-3' : 'p-4'
            }`}>
              <div className={`flex items-center gap-2 mb-2 ${
                isMobile ? 'flex-col text-center gap-1' : ''
              }`}>
                <Trophy className={`text-amber-300 ${
                  isMobile ? 'h-4 w-4' : 'h-5 w-5'
                }`} />
                <span className={`text-amber-200 font-medium ${
                  isMobile ? 'text-sm' : 'text-base'
                }`}>
                  Succès
                </span>
              </div>
              <div className={`font-bold text-amber-100 ${
                isMobile ? 'text-2xl' : 'text-3xl'
              }`}>
                {unlockedAchievements.length}/{userStats.achievements.length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Premium Status */}
      {!userStats.isPremium && (
        <Card className="bg-gradient-to-r from-purple-700 to-pink-700 border-2 border-purple-400">
          <CardContent className={`text-center ${isMobile ? 'p-4' : 'p-6'}`}>
            <Star className={`text-yellow-300 mx-auto mb-4 ${
              isMobile ? 'h-8 w-8' : 'h-12 w-12'
            }`} />
            <h3 className={`font-bold text-purple-100 mb-2 ${
              isMobile ? 'text-lg' : 'text-xl'
            }`}>
              Débloquez le Premium !
            </h3>
            <p className={`text-purple-200 mb-4 ${
              isMobile ? 'text-sm' : 'text-base'
            }`}>
              Obtenez des points bonus et débloquez des succès exclusifs
            </p>
            <Button 
              onClick={handlePremiumClick}
              disabled={loading}
              className={`bg-yellow-500 hover:bg-yellow-600 text-black font-bold ${
                isMobile ? 'text-sm px-4 py-2' : ''
              }`}
            >
              <Crown className={`mr-2 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
              {loading ? "Chargement..." : "Activer Premium"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Achievements Inventory */}
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
            {userStats.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`
                  relative rounded-lg border-2 transition-all duration-300 ${
                    isMobile ? 'p-3' : 'p-4'
                  }
                  ${achievement.unlocked 
                    ? `${getRarityBorder(achievement.rarity)} bg-gradient-to-br from-slate-700 to-slate-800 shadow-lg transform hover:scale-105` 
                    : 'border-slate-600 bg-slate-900/50 opacity-50'
                  }
                `}
              >
                {achievement.unlocked && (
                  <div className="absolute -top-2 -right-2">
                    <div className={`rounded-full ${getRarityColor(achievement.rarity)} animate-pulse ${
                      isMobile ? 'w-3 h-3' : 'w-4 h-4'
                    }`}></div>
                  </div>
                )}
                
                <div className="text-center">
                  <div className={`mb-2 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
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
                  
                  <Badge 
                    className={`mt-2 border-0 ${getRarityColor(achievement.rarity)} ${
                      isMobile ? 'text-[9px]' : 'text-xs'
                    }`}
                  >
                    {achievement.rarity}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <Card className="bg-slate-800 border-2 border-slate-600">
        <CardHeader>
          <CardTitle className={`text-slate-100 flex items-center gap-2 ${
            isMobile ? 'text-lg' : 'text-xl'
          }`}>
            <Star className={`text-yellow-400 ${
              isMobile ? 'h-4 w-4' : 'h-5 w-5'
            }`} />
            Statistiques Détaillées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid gap-4 ${getStatsGridCols()}`}>
            <div className="text-center">
              <div className={`font-bold text-blue-400 ${
                isMobile ? 'text-xl' : 'text-2xl'
              }`}>
                {userStats.totalPoints}
              </div>
              <div className={`text-slate-400 ${
                isMobile ? 'text-xs' : 'text-sm'
              }`}>
                Tensens de Lecture
              </div>
            </div>
            <div className="text-center">
              <div className={`font-bold text-green-400 ${
                isMobile ? 'text-xl' : 'text-2xl'
              }`}>
                {totalAchievementPoints}
              </div>
              <div className={`text-slate-400 ${
                isMobile ? 'text-xs' : 'text-sm'
              }`}>
                Tensens de Succès
              </div>
            </div>
            <div className="text-center">
              <div className={`font-bold text-purple-400 ${
                isMobile ? 'text-xl' : 'text-2xl'
              }`}>
                {unlockedAchievements.length}
              </div>
              <div className={`text-slate-400 ${
                isMobile ? 'text-xs' : 'text-sm'
              }`}>
                Succès Débloqués
              </div>
            </div>
            <div className="text-center">
              <div className={`font-bold text-amber-400 ${
                isMobile ? 'text-xl' : 'text-2xl'
              }`}>
                {playerLevel.level}
              </div>
              <div className={`text-slate-400 ${
                isMobile ? 'text-xs' : 'text-sm'
              }`}>
                Niveau Actuel
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
