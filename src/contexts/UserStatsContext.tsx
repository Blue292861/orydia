// src/contexts/UserStatsContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { UserStats, Achievement } from '@/types/UserStats';
import { UserStatsContextType } from '@/types/UserStatsContext';
import { PendingLevelReward, ClaimedLevelRewards } from '@/types/LevelReward';
import { SoundEffects } from '@/utils/soundEffects';
import { toast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';
import { initialAchievements } from '@/data/initialAchievements';
import { checkAndUnlockAchievements } from '@/utils/achievementChecker';
import { supabase } from '@/integrations/supabase/client';
import { calculateLevelInfo } from '@/utils/levelCalculations';
import { getPendingLevelRewards, claimAllLevelRewards } from '@/services/levelRewardService';

const UserStatsContext = createContext<UserStatsContextType | undefined>(undefined);

export const useUserStats = () => {
  const context = useContext(UserStatsContext);
  if (!context) {
    throw new Error('useUserStats must be used within a UserStatsProvider');
  }
  return context;
};

interface UserStatsProviderProps {
  children: ReactNode;
}

export const UserStatsProvider: React.FC<UserStatsProviderProps> = ({ children }) => {
  const { subscription, session } = useAuth();
  const [userStats, setUserStats] = useState<UserStats>({
    totalPoints: 0,
    booksRead: [],
    achievements: initialAchievements,
    isPremium: false,
    level: 1,
    experiencePoints: 0,
    pendingPremiumMonths: 0,
    tutorialsSeen: [],
    isAdmin: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [pendingLevelRewards, setPendingLevelRewards] = useState<PendingLevelReward[]>([]);

  // Charger les stats depuis la base de données
  const loadUserStats = async () => {
    if (!session?.user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('get-user-stats');
      if (error) throw error;

      if (data?.user_stats) {
        const dbStats = data.user_stats;
        const dbAchievements = data.achievements || [];
        const isAdmin = dbStats.is_admin || false;
        
        // Convertir les achievements de la DB au format attendu
        const achievements = dbAchievements.map((ach: any) => ({
          id: ach.achievement_id,
          name: ach.name,
          description: ach.description,
          points: ach.points,
          unlocked: true,
          icon: ach.icon,
          rarity: ach.rarity,
          premiumMonths: ach.premium_months
        }));

        // Ajouter les achievements non débloqués
        const unlockedIds = achievements.map((a: Achievement) => a.id);
        const remainingAchievements = initialAchievements.filter(
          (a: Achievement) => !unlockedIds.includes(a.id)
        );

        // Utiliser les données de niveau de la vue user_level_info
        const levelInfo = {
          level: dbStats.level || 1,
          currentXp: dbStats.current_xp || 0,
          nextLevelXp: dbStats.next_level_xp || 100,
          levelTitle: dbStats.level_title || 'Apprenti Lecteur',
          progressPercentage: Math.round(((dbStats.current_xp || 0) / (dbStats.next_level_xp || 100)) * 100)
        };
        
        // Les admins ont toujours le premium actif
        const isPremium = isAdmin ? true : subscription.isPremium;
        
        setUserStats({
          totalPoints: dbStats.total_points || 0,
          booksRead: dbStats.books_read || [],
          achievements: [...achievements, ...remainingAchievements],
          isPremium,
          level: dbStats.level || 1,
          experiencePoints: dbStats.experience_points || 0,
          levelInfo,
          pendingPremiumMonths: dbStats.pending_premium_months || 0,
          tutorialsSeen: dbStats.tutorials_seen || [],
          isAdmin
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load pending level rewards
  const loadPendingLevelRewards = async () => {
    if (!session?.user?.id) return;
    
    try {
      const rewards = await getPendingLevelRewards(session.user.id);
      setPendingLevelRewards(rewards);
    } catch (error) {
      console.error('Error loading pending level rewards:', error);
    }
  };

  // Claim all pending level rewards
  const claimLevelRewards = async (): Promise<ClaimedLevelRewards | null> => {
    if (!session?.user?.id || pendingLevelRewards.length === 0) return null;
    
    try {
      const result = await claimAllLevelRewards();
      
      if (result.rewards) {
        SoundEffects.playPoints();
        
        // Clear pending rewards
        setPendingLevelRewards([]);
        
        // Reload stats
        await loadUserStats();
        
        return result.rewards;
      }
      
      return null;
    } catch (error) {
      console.error('Error claiming level rewards:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de réclamer les récompenses',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const markTutorialAsSeen = async (tutorialId: string) => {
    if (!session?.user?.id || userStats.tutorialsSeen.includes(tutorialId)) return;

    const updatedTutorialsSeen = [...userStats.tutorialsSeen, tutorialId];

    setUserStats(prev => ({
      ...prev,
      tutorialsSeen: updatedTutorialsSeen
    }));

    try {
      // Convertir en JSON string car le champ est de type text en DB
      const { error } = await supabase
        .from('profiles')
        .update({ tutorials_seen: JSON.stringify(updatedTutorialsSeen) })
        .eq('id', session.user.id);

      if (error) {
        console.error('Error updating tutorials seen:', error);
      }
    } catch (error) {
      console.error('Error updating tutorials seen:', error);
    }
  };

  const completeTutorial = async () => {
    if (!session?.user?.id) return;
    
    // Marquer le tutoriel comme complété
    await markTutorialAsSeen('guided-tutorial-complete');
    
    // Recharger les stats pour déclencher le déblocage de l'achievement
    await loadUserStats();
  };

  // Charger les stats au montage et quand la session change
  useEffect(() => {
    loadUserStats();
    loadPendingLevelRewards();
  }, [session?.user?.id]);

  useEffect(() => {
    if (userStats.isPremium !== subscription.isPremium) {
      setUserStats(prev => checkAndUnlockAchievements({ ...prev, isPremium: subscription.isPremium }));
    }
  }, [subscription.isPremium]);

  const checkDailyAdLimit = async (): Promise<boolean> => {
    if (!session?.user?.id) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabase
      .from('ad_views')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('ad_type', 'tensens')
      .gte('viewed_at', today.toISOString())
      .lt('viewed_at', tomorrow.toISOString());

    if (error) {
      console.error('Error checking ad limit:', error);
      return false;
    }

    return (data?.length || 0) < 5;
  };

  const recordAdView = async (): Promise<boolean> => {
    if (!session?.user?.id) return false;

    const { error } = await supabase
      .from('ad_views')
      .insert({
        user_id: session.user.id,
        ad_type: 'tensens',
        tensens_earned: 10
      });

    if (error) {
      console.error('Error recording ad view:', error);
      return false;
    }

    return true;
  };

  const addPointsForBook = async (bookId: string, points: number) => {
    if (!session?.user?.id) return;
    
    // Vérifier si le livre a déjà été lu
    if (userStats.booksRead.includes(bookId)) {
      return;
    }
    
    try {
      SoundEffects.playPoints();
      
      // Attribuer les points via l'API
      const { data, error } = await supabase.functions.invoke('award-points', {
        body: {
          user_id: session.user.id,
          points,
          transaction_type: 'book_completion',
          reference_id: bookId,
          description: `Points gagnés pour la lecture du livre ID: ${bookId}`,
          source_app: 'main_app'
        }
      });
      
      if (error) throw error;

      // Mettre à jour l'état local immédiatement
      setUserStats(prev => {
        const newExperiencePoints = prev.experiencePoints + points;
        const levelInfo = calculateLevelInfo(newExperiencePoints);
        const newStats = {
          ...prev,
          totalPoints: data.new_total_points,
          level: data.new_level,
          booksRead: [...prev.booksRead, bookId],
          experiencePoints: newExperiencePoints,
          levelInfo
        };
        return checkAndUnlockAchievements(newStats);
      });

      // Recharger les stats complètes depuis la DB
      await loadUserStats();
      
    } catch (error) {
      console.error('Erreur lors de l\'attribution des points:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'attribuer les points. Veuillez réessayer.',
        variant: 'destructive'
      });
    }
  };

  // New function for opening chest (replaces direct point attribution)
  const openChestForBook = async (bookId: string, bookTitle: string): Promise<any> => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }
    
    // Check if already read
    if (userStats.booksRead.includes(bookId)) {
      return null;
    }
    
    try {
      // Call open-chest edge function
      const { data, error } = await supabase.functions.invoke('open-chest', {
        body: { bookId }
      });
      
      if (error) throw error;
      
      // Update local stats
      setUserStats(prev => ({
        ...prev,
        booksRead: [...prev.booksRead, bookId]
      }));

      // Reload complete stats from DB
      await loadUserStats();
      
      return data;
    } catch (error) {
      console.error('Error opening chest:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ouvrir le coffre. Veuillez réessayer.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const spendPoints = (amount: number) => {
    // Les admins ont des Orydors illimités - pas de déduction
    if (userStats.isAdmin) {
      console.log('[Admin] Bypass spendPoints - Orydors illimités');
      return;
    }
    
    setUserStats(prev => ({
      ...prev,
      totalPoints: Math.max(0, prev.totalPoints - amount)
    }));
  };

  const addAchievement = (achievement: Achievement) => {
    setUserStats(prev => ({
      ...prev,
      achievements: [...prev.achievements, achievement]
    }));
  };

  const updateAchievement = (updatedAchievement: Achievement) => {
    setUserStats(prev => ({
      ...prev,
      achievements: prev.achievements.map(ach => 
        ach.id === updatedAchievement.id ? updatedAchievement : ach
      )
    }));
  };

  const deleteAchievement = (id: string) => {
    setUserStats(prev => ({
      ...prev,
      achievements: prev.achievements.filter(ach => ach.id !== id)
    }));
  };

  const applyPendingPremiumMonths = () => {
    if (userStats.pendingPremiumMonths && userStats.pendingPremiumMonths > 0) {
      // This would integrate with subscription management to pause payments
      // For now, we'll just clear the pending months and show a notification
      toast({
        title: '🎉 Premium Extended!',
        description: `${userStats.pendingPremiumMonths} mois de premium ont été ajoutés à votre compte.`,
      });
      
      setUserStats(prev => ({
        ...prev,
        pendingPremiumMonths: 0
      }));
    }
  };

  return (
    <UserStatsContext.Provider value={{ 
      userStats, 
      loadUserStats,
      addPointsForBook,
      openChestForBook,
      spendPoints, 
      addAchievement,
      updateAchievement,
      deleteAchievement,
      applyPendingPremiumMonths,
      checkDailyAdLimit,
      recordAdView,
      markTutorialAsSeen,
      completeTutorial,
      pendingLevelRewards,
      claimLevelRewards,
      loadPendingLevelRewards
    }}>
      {children}
    </UserStatsContext.Provider>
  );
};
