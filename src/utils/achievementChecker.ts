
import { UserStats, Achievement } from '@/types/UserStats';
import { SoundEffects } from '@/utils/soundEffects';
import { toast } from '@/components/ui/use-toast';
import { calculateLevelInfo } from '@/utils/levelCalculations';

export const checkAndUnlockAchievements = (newStats: UserStats): UserStats => {
  const updatedAchievements = newStats.achievements.map(achievement => {
    if (achievement.unlocked) return achievement;

    let shouldUnlock = false;
    
    switch (achievement.id) {
      case 'first-book':
        shouldUnlock = newStats.booksRead.length >= 1;
        break;
      case 'bookworm':
        shouldUnlock = newStats.booksRead.length >= 5;
        break;
      case 'scholar':
        shouldUnlock = newStats.booksRead.length >= 10;
        break;
      case 'master-reader':
        shouldUnlock = newStats.booksRead.length >= 20;
        break;
      case 'marathon-reader':
        shouldUnlock = newStats.booksRead.length >= 50;
        break;
      case 'ultimate-scholar':
        shouldUnlock = newStats.booksRead.length >= 100;
        break;
      case 'point-collector':
        shouldUnlock = newStats.totalPoints >= 500;
        break;
      case 'point-master':
        shouldUnlock = newStats.totalPoints >= 1000;
        break;
      case 'premium-member':
        shouldUnlock = newStats.isPremium;
        break;
      case 'legendary-supporter':
        // This would need tracking of premium duration - placeholder logic
        shouldUnlock = newStats.isPremium && newStats.booksRead.length >= 50;
        break;
      case 'tutorial-completed':
        shouldUnlock = newStats.tutorialsSeen.includes('guided-tutorial-complete');
        break;
      case 'dedicated-reader':
      case 'speed-reader':
      case 'night-owl':
      case 'genre-explorer':
        // For now, we'll unlock these randomly as we don't track these specific metrics
        shouldUnlock = newStats.booksRead.length >= 3;
        break;
    }

    if (shouldUnlock) {
      return { ...achievement, unlocked: true };
    }
    return achievement;
  });

  // Calculate bonus points, XP, premium months and items from newly unlocked achievements
  const newlyUnlocked = updatedAchievements.filter((ach, index) => 
    ach.unlocked && !newStats.achievements[index].unlocked
  );
  
  const bonusPoints = newlyUnlocked.reduce((total, ach) => total + ach.points, 0);
  const bonusXp = newlyUnlocked.reduce((total, ach) => total + (ach.xpReward || ach.points), 0);
  const bonusPremiumMonths = newlyUnlocked.reduce((total, ach) => total + (ach.premiumMonths || 0), 0);
  
  // Collect all item rewards from newly unlocked achievements
  const itemRewards = newlyUnlocked.flatMap(ach => ach.itemRewards || []);

  // Play sound and show toast for new achievements (only once per achievement)
  if (newlyUnlocked.length > 0) {
    // Vérifier si le toast a déjà été affiché
    const shownToasts = JSON.parse(localStorage.getItem('orydia-achievement-toasts-shown') || '[]');
    const newlyUnlockedToShow = newlyUnlocked.filter(ach => !shownToasts.includes(ach.id));

    if (newlyUnlockedToShow.length > 0) {
      SoundEffects.playAchievement();
      newlyUnlockedToShow.forEach(achievement => {
        const xpText = achievement.xpReward ? ` + ${achievement.xpReward} XP` : ` + ${achievement.points} XP`;
        const premiumText = achievement.premiumMonths ? ` + ${achievement.premiumMonths} mois premium!` : '';
        const itemText = achievement.itemRewards && achievement.itemRewards.length > 0 
          ? ` + ${achievement.itemRewards.map(r => `${r.quantity}x item`).join(', ')}`
          : '';
        toast({
          title: `🏆 Succès Débloqué!`,
          description: `${achievement.icon} ${achievement.name} - +${achievement.points} points${xpText}${premiumText}${itemText}`,
        });
      });
      
      // Enregistrer les IDs dans localStorage
      const updatedShownToasts = [...shownToasts, ...newlyUnlockedToShow.map(a => a.id)];
      localStorage.setItem('orydia-achievement-toasts-shown', JSON.stringify(updatedShownToasts));
    }
  }

  // Calculate level and experience with new XP system
  const totalPoints = newStats.totalPoints + bonusPoints;
  const newExperiencePoints = newStats.experiencePoints + bonusXp;
  const levelInfo = calculateLevelInfo(newExperiencePoints);
  const pendingPremiumMonths = (newStats.pendingPremiumMonths || 0) + bonusPremiumMonths;

  // Add item rewards to inventory if any
  if (itemRewards.length > 0 && typeof window !== 'undefined') {
    // Import dynamically to avoid circular dependencies
    import('@/integrations/supabase/client').then(async ({ supabase }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        for (const itemReward of itemRewards) {
          await supabase
            .from('user_inventory')
            .upsert({
              user_id: user.id,
              reward_type_id: itemReward.rewardTypeId,
              quantity: itemReward.quantity
            }, {
              onConflict: 'user_id,reward_type_id'
            })
            .then(({ error }) => {
              if (error) console.error('Error adding item reward:', error);
            });
        }
      }
    });
  }

  return {
    ...newStats,
    achievements: updatedAchievements,
    totalPoints,
    level: levelInfo.level,
    experiencePoints: newExperiencePoints,
    levelInfo,
    pendingPremiumMonths
  };
};
