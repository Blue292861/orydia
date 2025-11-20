import { UserStats } from '@/types/UserStats';

export interface AchievementProgress {
  id: string;
  current: number;
  target: number;
  percentage: number;
  label: string;
}

export const calculateAchievementProgress = (
  achievementId: string, 
  userStats: UserStats
): AchievementProgress | null => {
  const booksRead = userStats.booksRead.length;
  const totalPoints = userStats.totalPoints;

  switch (achievementId) {
    case 'first-book':
      return {
        id: achievementId,
        current: booksRead,
        target: 1,
        percentage: Math.min((booksRead / 1) * 100, 100),
        label: `${booksRead}/1 livre`
      };
    
    case 'bookworm':
      return {
        id: achievementId,
        current: booksRead,
        target: 5,
        percentage: Math.min((booksRead / 5) * 100, 100),
        label: `${booksRead}/5 livres`
      };
    
    case 'scholar':
      return {
        id: achievementId,
        current: booksRead,
        target: 10,
        percentage: Math.min((booksRead / 10) * 100, 100),
        label: `${booksRead}/10 livres`
      };
    
    case 'master-reader':
      return {
        id: achievementId,
        current: booksRead,
        target: 20,
        percentage: Math.min((booksRead / 20) * 100, 100),
        label: `${booksRead}/20 livres`
      };
    
    case 'marathon-reader':
      return {
        id: achievementId,
        current: booksRead,
        target: 50,
        percentage: Math.min((booksRead / 50) * 100, 100),
        label: `${booksRead}/50 livres`
      };
    
    case 'ultimate-scholar':
      return {
        id: achievementId,
        current: booksRead,
        target: 100,
        percentage: Math.min((booksRead / 100) * 100, 100),
        label: `${booksRead}/100 livres`
      };
    
    case 'point-collector':
      return {
        id: achievementId,
        current: totalPoints,
        target: 500,
        percentage: Math.min((totalPoints / 500) * 100, 100),
        label: `${totalPoints}/500 Tensens`
      };
    
    case 'point-master':
      return {
        id: achievementId,
        current: totalPoints,
        target: 1000,
        percentage: Math.min((totalPoints / 1000) * 100, 100),
        label: `${totalPoints}/1000 Tensens`
      };
    
    case 'premium-member':
      return {
        id: achievementId,
        current: userStats.isPremium ? 1 : 0,
        target: 1,
        percentage: userStats.isPremium ? 100 : 0,
        label: userStats.isPremium ? 'Premium actif' : 'Devenir Premium'
      };
    
    case 'legendary-supporter':
      return {
        id: achievementId,
        current: booksRead,
        target: 50,
        percentage: Math.min((booksRead / 50) * 100, 100),
        label: `${booksRead}/50 livres (Premium requis)`
      };
    
    case 'tutorial-completed':
      const tutorialSeen = userStats.tutorialsSeen.includes('guided-tutorial-complete');
      return {
        id: achievementId,
        current: tutorialSeen ? 1 : 0,
        target: 1,
        percentage: tutorialSeen ? 100 : 0,
        label: tutorialSeen ? 'Tutoriel complété' : 'Terminer le tutoriel'
      };
    
    case 'dedicated-reader':
    case 'speed-reader':
    case 'night-owl':
    case 'genre-explorer':
      return {
        id: achievementId,
        current: booksRead,
        target: 3,
        percentage: Math.min((booksRead / 3) * 100, 100),
        label: `${booksRead}/3 livres`
      };
    
    default:
      return null;
  }
};
