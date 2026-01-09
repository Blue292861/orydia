import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Book } from '@/types/Book';
import { Audiobook } from '@/types/Audiobook';
import { BookLibrary } from '@/components/BookLibrary';
import { BookReader } from '@/components/BookReader';
import { AdminDashboard } from '@/components/AdminDashboard';
import { ShopAdmin } from '@/components/ShopAdmin';
import { AchievementAdmin } from '@/components/AchievementAdmin';
import { AudiobookAdmin } from '@/components/AudiobookAdmin';
import { PointsAdmin } from '@/components/PointsAdmin';
import { ApiKeysAdmin } from '@/components/ApiKeysAdmin';
import { RewardTypesAdmin } from '@/components/RewardTypesAdmin';
import { LootTableEditor } from '@/components/LootTableEditor';
import { Shop } from '@/components/Shop';
import { SearchPage } from '@/components/SearchPage';
import { ProfilePage } from '@/components/ProfilePage';
import { PremiumPage } from '@/components/PremiumPage';
import { PremiumSelectionDialog } from '@/components/PremiumSelectionDialog';
import { Header } from '@/components/Header';
import { NavigationFooter } from '@/components/NavigationFooter';
import { SecurityHeaders } from '@/components/SecurityHeaders';
import { UserStatsProvider, useUserStats } from '@/contexts/UserStatsContext';
import { useAuth } from '@/contexts/AuthContext';
import { AdminNav } from '@/components/AdminNav';
import { OrydorsCodeAdmin } from '@/components/OrydorsCodeAdmin';
import { PremiumAdmin } from '@/components/PremiumAdmin';
import { PremiumCodeAdmin } from '@/components/PremiumCodeAdmin';
import { OrdersAdmin } from '@/components/OrdersAdmin';
import { ReadingStatsAdmin } from '@/components/ReadingStatsAdmin';
import { ReadingStatsExport } from '@/components/ReadingStatsExport';
import { AdminStatsPage } from '@/pages/AdminStatsPage';
import { WelcomeDialog } from '@/components/WelcomeDialog';
import { GuidedTutorial } from '@/components/GuidedTutorial';
import { GuildPage } from '@/components/GuildPage';

import NewChallengePopup from '@/components/NewChallengePopup';
import { useBooks } from '@/hooks/useBooks';
import { useShopItems } from '@/hooks/useShopItems';
import { useResponsive } from '@/hooks/useResponsive';
import { supabase } from '@/integrations/supabase/client';
import { AuthRequiredDialog } from '@/components/AuthRequiredDialog';
import { chapterEpubService } from '@/services/chapterEpubService';
import { epubPreloadService } from '@/services/epubPreloadService';

type AdminPage = 'admin' | 'shop-admin' | 'achievement-admin' | 'orders-admin' | 'reading-stats-admin' | 'reading-stats-export' | 'audiobook-admin' | 'points-admin' | 'api-keys-admin' | 'orydors-codes' | 'premium-admin' | 'premium-codes' | 'user-stats' | 'reward-types' | 'loot-tables';
type Page = 'library' | 'reader' | 'shop' | 'search' | 'profile' | 'premium' | 'video-ad' | 'guild' | AdminPage;

const AppContent = () => {
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState<Page>('library');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bookForAd, setBookForAd] = useState<Book | null>(null);
  const [showGuidedTutorial, setShowGuidedTutorial] = useState(false);
  const [welcomeDialogClosed, setWelcomeDialogClosed] = useState(false);
  const tutorialShownRef = React.useRef(false);
  
  const { books } = useBooks();
  const { shopItems } = useShopItems('internal'); // Only load internal Orydia shop items
  const { userStats, addAchievement, updateAchievement, deleteAchievement } = useUserStats();
  const { subscription, user } = useAuth();
  const { isMobile, isTablet } = useResponsive();

  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authDialogMessage, setAuthDialogMessage] = useState('');

  // Handle shared work from WorkPage
  useEffect(() => {
    const state = location.state as { selectedWork?: Book | Audiobook; workType?: 'book' | 'audiobook' };
    if (state?.selectedWork && state?.workType) {
      if (state.workType === 'book') {
        handleBookSelect(state.selectedWork as Book);
      }
      // Clear the state to prevent repeated navigation
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Gérer l'affichage du tutoriel guidé après la fermeture du WelcomeDialog
  useEffect(() => {
    // Protection : ne montrer qu'une seule fois
    if (tutorialShownRef.current) return;
    
    // Attendre que welcomeDialogClosed soit true ET que l'utilisateur soit connecté
    if (welcomeDialogClosed && user) {
      const tutorialCompleted = userStats.achievements.find(
        (a) => a.id === 'tutorial-completed'
      )?.unlocked;

      // Afficher uniquement si le tutoriel n'est pas complété
      if (!tutorialCompleted) {
        tutorialShownRef.current = true;
        setTimeout(() => {
          setShowGuidedTutorial(true);
        }, 500);
      }
    }
  }, [welcomeDialogClosed, user?.id, userStats.achievements.length]);

  const handleWelcomeComplete = () => {
    setWelcomeDialogClosed(true);
  };

  const handleTutorialComplete = () => {
    setShowGuidedTutorial(false);
  };

  const handleTutorialSkip = () => {
    setShowGuidedTutorial(false);
  };

  const handleBookSelect = async (book: Book) => {
    // Vérifier si l'utilisateur est connecté
    if (!user) {
      setAuthDialogMessage("Pour lire ce livre, vous devez vous connecter.");
      setShowAuthDialog(true);
      return;
    }

    const isPremium = subscription.isPremium;
    const isBookPremium = book.isPremium;

    // Si le livre est premium et l'utilisateur n'est pas premium
    if (isBookPremium && !isPremium) {
      setShowPremiumDialog(true);
      return;
    }

    // Pour les utilisateurs premium ou les livres non-premium
    if (isPremium || !isBookPremium) {
      // Précharger le premier chapitre EPUB dès le clic (fire and forget)
      if (book.hasChapters) {
        chapterEpubService.getChaptersByBookId(book.id).then(chapters => {
          if (chapters.length > 0) {
            const firstChapter = chapters[0];
            const urlToPreload = firstChapter.merged_epub_url || firstChapter.epub_url;
            epubPreloadService.preloadChapter(firstChapter.id, urlToPreload);
            console.log(`🚀 Preloading first chapter from book select: ${firstChapter.id}`);
          }
        }).catch(console.warn);
      }
      
      setSelectedBook(book);
      setCurrentPage('reader');
      
      // Forcer un scroll vers le haut
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setShowPremiumDialog(true);
    }
  };

  const handleAdFinished = () => {
    if (bookForAd) {
      setSelectedBook(bookForAd);
      setCurrentPage('reader');
      setBookForAd(null);
    }
  };

  const handleBackToLibrary = () => {
    setSelectedBook(null);
    setCurrentPage('library');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'reader':
        return selectedBook ? (
          <BookReader book={selectedBook} onBack={handleBackToLibrary} />
        ) : null;
      case 'admin':
        return <AdminDashboard />;
      case 'audiobook-admin':
        return <AudiobookAdmin />;
      case 'shop-admin':
        return <ShopAdmin />;
      case 'achievement-admin':
        return (
          <AchievementAdmin
            achievements={userStats.achievements}
            onAddAchievement={addAchievement}
            onUpdateAchievement={updateAchievement}
            onDeleteAchievement={deleteAchievement}
          />
        );
      case 'orders-admin':
        return <OrdersAdmin />;
      case 'reading-stats-admin':
        return <ReadingStatsAdmin books={books} />;
      case 'reading-stats-export':
        return <ReadingStatsExport books={books} />;
      case 'user-stats':
        return <AdminStatsPage />;
      case 'points-admin':
        return <PointsAdmin />;
      case 'premium-admin':
        return <PremiumAdmin />;
      case 'orydors-codes':
        return <OrydorsCodeAdmin />;
      case 'premium-codes':
        return <PremiumCodeAdmin />;
      case 'reward-types':
        return <RewardTypesAdmin />;
      case 'loot-tables':
        return <LootTableEditor />;
      case 'api-keys-admin':
        return <ApiKeysAdmin />;
      case 'shop':
        return <Shop shopItems={shopItems} />;
      case 'search':
        return <SearchPage books={books} onBookSelect={handleBookSelect} />;
      case 'profile':
        return <ProfilePage />;
      case 'premium':
        return <PremiumPage />;
      case 'guild':
        return <GuildPage />;
      default:
        return <BookLibrary books={books} onBookSelect={handleBookSelect} />;
    }
  };

  const isAdminPage = (['admin', 'shop-admin', 'achievement-admin', 'orders-admin', 'reading-stats-admin', 'reading-stats-export', 'user-stats', 'audiobook-admin', 'points-admin', 'premium-admin', 'orydors-codes', 'premium-codes', 'api-keys-admin', 'reward-types', 'loot-tables'] as const).includes(currentPage as any);

  const pageBackground = isAdminPage ? 'bg-forest-800' : (['library', 'search'].includes(currentPage) ? 'bg-forest-900' : 'bg-background');

  const getMainPadding = () => {
    if (isMobile) {
      switch (currentPage) {
        case 'library':
          return 'p-2';
        case 'shop':
        case 'profile':
          return 'p-1';
        default:
          return 'p-2';
      }
    }
    
    if (isTablet) {
      switch (currentPage) {
        case 'library':
          return 'p-3';
        case 'shop':
        case 'profile':
          return 'p-2';
        default:
          return 'p-3';
      }
    }
    
    switch (currentPage) {
      case 'library':
        return 'p-4 sm:p-6 lg:p-8';
      case 'shop':
        return 'p-2 sm:p-4';
      case 'profile':
        return 'p-2 sm:p-4';
      default:
        return 'p-2 sm:p-4 lg:p-6';
    }
  };

  const getBottomPadding = () => {
    if (isAdminPage) return 'pb-28';
    if (isMobile) return 'pb-20';
    if (isTablet) return 'pb-22';
    return 'pb-20 sm:pb-24';
  };

  return (
    <>
      <SecurityHeaders />
      <div className={`min-h-screen ${pageBackground} transition-colors duration-500 max-w-full overflow-x-hidden`}>
        {currentPage !== 'video-ad' && <Header onNavigate={setCurrentPage as any} currentPage={currentPage as any} />}
        <main className={`flex-1 ${getMainPadding()} ${getBottomPadding()} max-w-full overflow-x-hidden`}>
          {isAdminPage && <AdminNav currentPage={currentPage as AdminPage} onNavigate={setCurrentPage as any} />}
          {renderCurrentPage()}
        </main>
        {currentPage !== 'reader' && currentPage !== 'video-ad' && (
          <NavigationFooter 
            onNavigate={setCurrentPage as any}
            highlightedTab={showGuidedTutorial && ['library', 'search', 'shop', 'profile'].includes(currentPage) ? currentPage as 'library' | 'search' | 'shop' | 'profile' : null}
          />
        )}

        {/* Panel de sélection premium */}
        <PremiumSelectionDialog 
          trigger={
            <button 
              style={{ display: 'none' }} 
              ref={(el) => {
                if (el && showPremiumDialog) {
                  el.click();
                  setShowPremiumDialog(false);
                }
              }}
            />
          }
        />
      </div>
      
      {/* Welcome Dialog */}
      <WelcomeDialog onComplete={handleWelcomeComplete} />

      {/* Guided Tutorial */}
      {showGuidedTutorial && (
        <GuidedTutorial 
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
          currentPage={['library', 'search', 'shop', 'profile'].includes(currentPage) ? currentPage as 'library' | 'search' | 'shop' | 'profile' : 'library'}
        />
      )}

      {/* Dialog d'authentification requise */}
      <AuthRequiredDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        message={authDialogMessage}
      />

      {/* Popup nouveaux défis */}
      <NewChallengePopup onNavigateToProfile={() => setCurrentPage('profile')} />
    </>
  );
};

const Index = () => {
  return (
    <UserStatsProvider>
      <AppContent />
    </UserStatsProvider>
  );
};

export default Index;
