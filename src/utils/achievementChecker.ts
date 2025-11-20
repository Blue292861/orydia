
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

  // Calculate bonus points, XP and premium months from newly unlocked achievements
  const newlyUnlocked = updatedAchievements.filter((ach, index) => 
    ach.unlocked && !newStats.achievements[index].unlocked
  );
  
  const bonusPoints = newlyUnlocked.reduce((total, ach) => total + ach.points, 0);
  const bonusXp = newlyUnlocked.reduce((total, ach) => total + (ach.xpReward || ach.points), 0);
  const bonusPremiumMonths = newlyUnlocked.reduce((total, ach) => total + (ach.premiumMonths || 0), 0);

  // Play sound and show toast for new achievements
  if (newlyUnlocked.length > 0) {
    SoundEffects.playAchievement();
    newlyUnlocked.forEach(achievement => {
      const xpText = achievement.xpReward ? ` + ${achievement.xpReward} XP` : ` + ${achievement.points} XP`;
      const premiumText = achievement.premiumMonths ? ` + ${achievement.premiumMonths} mois premium!` : '';
      toast({
        title: `🏆 Achievement Unlocked!`,
        description: `${achievement.icon} ${achievement.name} - +${achievement.points} points${xpText}${premiumText}`,
      });
    });
  }

  // Calculate level and experience with new XP system
  const totalPoints = newStats.totalPoints + bonusPoints;
  const newExperiencePoints = newStats.experiencePoints + bonusXp;
  const levelInfo = calculateLevelInfo(newExperiencePoints);
  const pendingPremiumMonths = (newStats.pendingPremiumMonths || 0) + bonusPremiumMonths;

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
