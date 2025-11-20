import React, { useState, useEffect, useRef } from 'react';
import { useUserStats } from '@/contexts/UserStatsContext';
import { useAuth } from '@/contexts/AuthContext';
import { EditProfileForm } from '@/components/EditProfileForm';
import { PlayerCard } from '@/components/PlayerCard';
import { PremiumStatusCard } from '@/components/PremiumStatusCard';
import { AchievementInventory } from '@/components/AchievementInventory';
import { StatsSummary } from '@/components/StatsSummary';
import { LevelProgressBar } from '@/components/LevelProgressBar';
import { SubscriptionManagement } from '@/components/SubscriptionManagement';
import { ProfileFooter } from '@/components/ProfileFooter';
import { useResponsive } from '@/hooks/useResponsive';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Crown, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Achievement } from '@/types/UserStats';

export const ProfilePage: React.FC = () => {
  const { userStats } = useUserStats();
  const { subscription, checkSubscriptionStatus, user } = useAuth();
  const { isMobile, isTablet } = useResponsive();
  const navigate = useNavigate();
  const [showOnlyPremium, setShowOnlyPremium] = useState(false);
  const [recentlyUnlockedIds, setRecentlyUnlockedIds] = useState<string[]>([]);
  const prevAchievements = useRef<Achievement[]>([]);

  const unlockedAchievements = userStats.achievements.filter(a => a.unlocked);
  const totalAchievementPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);

  // Charger la préférence de filtre depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('showOnlyPremium');
    if (saved !== null) {
      setShowOnlyPremium(saved === 'true');
    }
  }, []);

  // Sauvegarder et diffuser les changements
  useEffect(() => {
    localStorage.setItem('showOnlyPremium', String(showOnlyPremium));
    window.dispatchEvent(new CustomEvent('premiumFilterChanged', { 
      detail: { showOnlyPremium } 
    }));
  }, [showOnlyPremium]);

  // Détecter les nouveaux succès débloqués et les mettre en surbrillance
  useEffect(() => {
    if (prevAchievements.current.length === 0 && userStats.achievements.length > 0) {
      prevAchievements.current = userStats.achievements;
      return;
    }

    const newlyUnlocked = userStats.achievements.filter(
      (ach) => ach.unlocked && !prevAchievements.current.find(prev => prev.id === ach.id)?.unlocked
    );
    
    if (newlyUnlocked.length > 0) {
      setRecentlyUnlockedIds(newlyUnlocked.map(a => a.id));
      
      // Retirer la surbrillance après 10 secondes
      setTimeout(() => {
        setRecentlyUnlockedIds([]);
      }, 10000);
    }
    
    prevAchievements.current = userStats.achievements;
  }, [userStats.achievements]);

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

  // Si non connecté, afficher un message
  if (!user) {
    return (
      <div className={`${getSpacing()} bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen text-white ${getPadding()} max-w-full overflow-x-hidden`}>
        <Card>
          <CardHeader>
            <CardTitle>Connexion requise</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p>Connectez-vous pour accéder à votre profil et voir vos statistiques.</p>
            <Button onClick={() => navigate('/auth')}>
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`${getSpacing()} bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen text-white ${getPadding()} max-w-full overflow-x-hidden`}>
      {/* Edit Profile Button */}
      <div className="flex justify-end mb-4">
        <EditProfileForm />
      </div>

      {/* Premium Content Filter */}
      <Card className="bg-wood-800/60 border-wood-700">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-gold-400" />
              <div>
                <Label htmlFor="premium-filter" className="text-wood-100 font-semibold cursor-pointer">
                  Afficher uniquement le contenu Premium
                </Label>
                <p className="text-wood-400 text-xs mt-1">
                  {showOnlyPremium 
                    ? "Seuls les contenus premium sont affichés"
                    : "Tous les contenus sont affichés"}
                </p>
              </div>
            </div>
            <Switch
              id="premium-filter"
              checked={showOnlyPremium}
              onCheckedChange={setShowOnlyPremium}
              className="data-[state=checked]:bg-gold-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Player Card */}
      <PlayerCard
        totalPoints={userStats.totalPoints}
        booksReadCount={userStats.booksRead.length}
        unlockedAchievementsCount={unlockedAchievements.length}
        totalAchievementsCount={userStats.achievements.length}
        levelInfo={userStats.levelInfo}
      />

      {/* Bouton Oryshop */}
      <Button
        onClick={() => window.open('https://oryshop.neptune-group.fr/', '_blank', 'noopener,noreferrer')}
        className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold py-6 px-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 text-lg"
      >
        <ShoppingBag className="w-6 h-6" />
        <span>Ouvrir l'Oryshop</span>
        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Nouveau !</span>
      </Button>

      {/* Level Progress */}
      {userStats.levelInfo && (
        <LevelProgressBar levelInfo={userStats.levelInfo} />
      )}

      {/* Premium Status */}
      <PremiumStatusCard isPremium={userStats.isPremium} />

      {/* Achievements Inventory */}
      <AchievementInventory
        achievements={userStats.achievements}
        totalAchievementPoints={totalAchievementPoints}
        recentlyUnlockedIds={recentlyUnlockedIds}
        userStats={userStats}
      />

      {/* Stats Summary */}
      <StatsSummary
        totalPoints={userStats.totalPoints}
        totalAchievementPoints={totalAchievementPoints}
        unlockedAchievementsCount={unlockedAchievements.length}
        playerLevel={userStats.levelInfo?.level || 1}
      />

      {/* Subscription Management - Only for Premium Users */}
      {subscription.isPremium && (
        <SubscriptionManagement 
          subscription={subscription}
          onSubscriptionUpdate={checkSubscriptionStatus}
        />
      )}

      {/* Footer avec contact et réseaux sociaux */}
      <ProfileFooter />
    </div>
  );
};
