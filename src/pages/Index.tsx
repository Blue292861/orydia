import React, { useState } from 'react';
import { Book } from '@/types/Book';
import { BookLibrary } from '@/components/BookLibrary';
import { BookReader } from '@/components/BookReader';
import { AdminDashboard } from '@/components/AdminDashboard';
import { ShopAdmin } from '@/components/ShopAdmin';
import { AchievementAdmin } from '@/components/AchievementAdmin';
import { AudiobookAdmin } from '@/components/AudiobookAdmin';
import { GameAdmin } from '@/components/GameAdmin';
import { PointsAdmin } from '@/components/PointsAdmin';
import { ApiKeysAdmin } from '@/components/ApiKeysAdmin';
import { Shop } from '@/components/Shop';
import { SearchPage } from '@/components/SearchPage';
import { ProfilePage } from '@/components/ProfilePage';
import { PremiumPage } from '@/components/PremiumPage';
import { Header } from '@/components/Header';
import { NavigationFooter } from '@/components/NavigationFooter';
import { SecurityHeaders } from '@/components/SecurityHeaders';
import { UserStatsProvider, useUserStats } from '@/contexts/UserStatsContext';
import { useAuth } from '@/contexts/AuthContext';
import { AdminNav } from '@/components/AdminNav';
import { OrdersAdmin } from '@/components/OrdersAdmin';
import { ReadingStatsAdmin } from '@/components/ReadingStatsAdmin';
import { ChapterEditorAdmin } from '@/components/ChapterEditorAdmin';
import { VideoAd } from '@/components/VideoAd';
import { useBooks } from '@/hooks/useBooks';
import { useShopItems } from '@/hooks/useShopItems';
import { useResponsive } from '@/hooks/useResponsive';
import { supabase } from '@/integrations/supabase/client';

type AdminPage = 'admin' | 'shop-admin' | 'achievement-admin' | 'orders-admin' | 'reading-stats-admin' | 'audiobook-admin' | 'game-admin' | 'points-admin' | 'api-keys-admin' | 'chapter-editor';
type Page = 'library' | 'reader' | 'shop' | 'search' | 'profile' | 'premium' | 'video-ad' | 'game-reader' | AdminPage;

const AppContent = () => {
  const [currentPage, setCurrentPage] = useState<Page>('library');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bookForAd, setBookForAd] = useState<Book | null>(null);
  
  const { books } = useBooks();
  const { shopItems } = useShopItems();
  const { userStats, addAchievement, updateAchievement, deleteAchievement } = useUserStats();
  const { subscription } = useAuth();
  const { isMobile, isTablet } = useResponsive();

  const handleBookSelect = async (book: Book) => {
    // Si le livre est premium et l'utilisateur n'est pas premium, lancer le processus de paiement
    if (book.isPremium && !subscription.isPremium) {
      try {
        const { data, error } = await supabase.functions.invoke('create-checkout');
        if (error) throw error;
        
        // Ouvrir la page de paiement Stripe dans un nouvel onglet
        if (data?.url) {
          window.open(data.url, '_blank');
        }
      } catch (error) {
        console.error('Erreur lors de la création du checkout:', error);
      }
      return;
    }

    const adWatched = localStorage.getItem(`ad_watched_${book.id}`);

    if (subscription.isPremium || adWatched) {
      setSelectedBook(book);
      setCurrentPage('reader');
    } else {
      setBookForAd(book);
      setCurrentPage('video-ad');
    }
  };

  const handleAdFinished = () => {
    if (bookForAd) {
      localStorage.setItem(`ad_watched_${bookForAd.id}`, 'true');
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
      case 'video-ad':
        return bookForAd ? <VideoAd book={bookForAd} onAdFinished={handleAdFinished} /> : null;
      case 'reader':
        return selectedBook ? (
          <BookReader book={selectedBook} onBack={handleBackToLibrary} />
        ) : null;
      case 'admin':
        return <AdminDashboard />;
      case 'audiobook-admin':
        return <AudiobookAdmin />;
      case 'game-admin':
        return <GameAdmin />;
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
      case 'points-admin':
        return <PointsAdmin />;
      case 'api-keys-admin':
        return <ApiKeysAdmin />;
      case 'chapter-editor':
        return <ChapterEditorAdmin />;
      case 'shop':
        return <Shop shopItems={shopItems} />;
      case 'search':
        return <SearchPage books={books} onBookSelect={handleBookSelect} />;
      case 'profile':
        return <ProfilePage />;
      case 'premium':
        return <PremiumPage />;
      default:
        return <BookLibrary books={books} onBookSelect={handleBookSelect} />;
    }
  };

  const pageBackground = ['library', 'search'].includes(currentPage) ? 'bg-forest-900' : 'bg-background';
  
  const isAdminPage = ['admin', 'shop-admin', 'achievement-admin', 'orders-admin', 'reading-stats-admin', 'audiobook-admin', 'game-admin', 'points-admin', 'api-keys-admin', 'chapter-editor'].includes(currentPage as string);

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
    if (isMobile) return 'pb-16';
    if (isTablet) return 'pb-18';
    return 'pb-16 sm:pb-20';
  };

  return (
    <>
      <SecurityHeaders />
      <div className={`min-h-screen ${pageBackground} transition-colors duration-500 max-w-full overflow-x-hidden`}>
        {currentPage !== 'video-ad' && <Header onNavigate={setCurrentPage as any} currentPage={currentPage} />}
        <main className={`flex-1 ${getMainPadding()} ${getBottomPadding()} max-w-full overflow-x-hidden`}>
          {isAdminPage && <AdminNav currentPage={currentPage as AdminPage} onNavigate={setCurrentPage as any} />}
          {renderCurrentPage()}
        </main>
        {currentPage !== 'reader' && currentPage !== 'video-ad' && <NavigationFooter onNavigate={setCurrentPage as any} />}
      </div>
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
