
import React, { useState } from 'react';
import { useUserStats } from '@/contexts/UserStatsContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Star, Crown, Trophy, Zap } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { userStats } = useUserStats();
  const { createCheckout } = useAuth();
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

  return (
    <div className="space-y-6 pb-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen text-white p-4">
      {/* Player Card */}
      <Card className="bg-gradient-to-r from-amber-700 to-amber-900 border-2 border-amber-400 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Crown className="h-8 w-8 text-amber-300" />
            <CardTitle className="text-2xl font-bold text-amber-100">
              Profil du Joueur
            </CardTitle>
            <Crown className="h-8 w-8 text-amber-300" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <Badge className="bg-amber-600 text-amber-100 text-lg px-4 py-1">
              Niveau {playerLevel.level}
            </Badge>
            <Badge className="bg-purple-600 text-purple-100 text-lg px-4 py-1">
              {playerLevel.title}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-amber-800/50 rounded-lg p-4 border border-amber-600">
              <div className="flex items-center gap-2 mb-2">
                <img src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" alt="Tensens Icon" className="h-5 w-5" />
                <span className="text-amber-200 font-medium">Tensens Totaux</span>
              </div>
              <div className="text-3xl font-bold text-amber-100">{userStats.totalPoints}</div>
            </div>
            
            <div className="bg-amber-800/50 rounded-lg p-4 border border-amber-600">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-amber-300" />
                <span className="text-amber-200 font-medium">Livres Lus</span>
              </div>
              <div className="text-3xl font-bold text-amber-100">{userStats.booksRead.length}</div>
            </div>
            
            <div className="bg-amber-800/50 rounded-lg p-4 border border-amber-600">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-amber-300" />
                <span className="text-amber-200 font-medium">Succès</span>
              </div>
              <div className="text-3xl font-bold text-amber-100">
                {unlockedAchievements.length}/{userStats.achievements.length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Premium Status */}
      {!userStats.isPremium && (
        <Card className="bg-gradient-to-r from-purple-700 to-pink-700 border-2 border-purple-400">
          <CardContent className="p-6 text-center">
            <Star className="h-12 w-12 text-yellow-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-purple-100 mb-2">Débloquez le Premium !</h3>
            <p className="text-purple-200 mb-4">Obtenez des points bonus et débloquez des succès exclusifs</p>
            <Button 
              onClick={handlePremiumClick}
              disabled={loading}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
            >
              <Crown className="h-4 w-4 mr-2" />
              {loading ? "Chargement..." : "Activer Premium"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Achievements Inventory */}
      <Card className="bg-slate-800 border-2 border-slate-600">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-yellow-400" />
            <CardTitle className="text-slate-100">Inventaire des Succès</CardTitle>
            <Badge className="bg-slate-700 text-slate-300">
              {totalAchievementPoints} Tensens de bonus
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {userStats.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`
                  relative rounded-lg p-4 border-2 transition-all duration-300
                  ${achievement.unlocked 
                    ? `${getRarityBorder(achievement.rarity)} bg-gradient-to-br from-slate-700 to-slate-800 shadow-lg transform hover:scale-105` 
                    : 'border-slate-600 bg-slate-900/50 opacity-50'
                  }
                `}
              >
                {achievement.unlocked && (
                  <div className="absolute -top-2 -right-2">
                    <div className={`w-4 h-4 rounded-full ${getRarityColor(achievement.rarity)} animate-pulse`}></div>
                  </div>
                )}
                
                <div className="text-center">
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <h4 className={`font-bold text-sm mb-1 ${achievement.unlocked ? 'text-white' : 'text-slate-500'}`}>
                    {achievement.name}
                  </h4>
                  <p className={`text-xs mb-2 ${achievement.unlocked ? 'text-slate-300' : 'text-slate-600'}`}>
                    {achievement.description}
                  </p>
                  
                  <div className="flex items-center justify-center gap-1">
                    <Zap className="h-3 w-3 text-yellow-400" />
                    <span className={`text-xs font-bold ${achievement.unlocked ? 'text-yellow-400' : 'text-slate-600'}`}>
                      +{achievement.points} Tensens
                    </span>
                  </div>
                  
                  <Badge 
                    className={`mt-2 text-xs ${getRarityColor(achievement.rarity)} border-0`}
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
          <CardTitle className="text-slate-100 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            Statistiques Détaillées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{userStats.totalPoints}</div>
              <div className="text-sm text-slate-400">Tensens de Lecture</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{totalAchievementPoints}</div>
              <div className="text-sm text-slate-400">Tensens de Succès</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{unlockedAchievements.length}</div>
              <div className="text-sm text-slate-400">Succès Débloqués</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">{playerLevel.level}</div>
              <div className="text-sm text-slate-400">Niveau Actuel</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
