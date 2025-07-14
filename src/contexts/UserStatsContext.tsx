
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { UserStats, Achievement } from '@/types/UserStats';
import { UserStatsContextType } from '@/types/UserStatsContext';
import { SoundEffects } from '@/utils/soundEffects';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';
import { initialAchievements } from '@/data/initialAchievements';
import { checkAndUnlockAchievements } from '@/utils/achievementChecker';
import { supabase } from '@/integrations/supabase/client';

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
    pendingPremiumMonths: 0
  });
  const [isLoading, setIsLoading] = useState(true);

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

        setUserStats({
          totalPoints: dbStats.total_points,
          booksRead: dbStats.books_read || [],
          achievements: [...achievements, ...remainingAchievements],
          isPremium: subscription.isPremium,
          level: dbStats.level,
          experiencePoints: dbStats.experience_points,
          pendingPremiumMonths: dbStats.pending_premium_months
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les stats au montage et quand la session change
  useEffect(() => {
    loadUserStats();
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
        const newStats = {
          ...prev,
          totalPoints: data.new_total_points,
          level: data.new_level,
          booksRead: [...prev.booksRead, bookId],
          experiencePoints: prev.experiencePoints + points
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

  const spendPoints = (amount: number) => {
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
      addPointsForBook, 
      spendPoints, 
      addAchievement,
      updateAchievement,
      deleteAchievement,
      applyPendingPremiumMonths,
      checkDailyAdLimit,
      recordAdView
    }}>
      {children}
    </UserStatsContext.Provider>
  );
};
