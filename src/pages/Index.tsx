
import React, { useState } from 'react';
import { Book } from '@/types/Book';
import { BookLibrary } from '@/components/BookLibrary';
import { BookReader } from '@/components/BookReader';
import { AdminDashboard } from '@/components/AdminDashboard';
import { ShopAdmin } from '@/components/ShopAdmin';
import { AchievementAdmin } from '@/components/AchievementAdmin';
import { AudiobookAdmin } from '@/components/AudiobookAdmin';
import { Shop } from '@/components/Shop';
import { SearchPage } from '@/components/SearchPage';
import { ProfilePage } from '@/components/ProfilePage';
import { Header } from '@/components/Header';
import { NavigationFooter } from '@/components/NavigationFooter';
import { SecurityHeaders } from '@/components/SecurityHeaders';
import { UserStatsProvider, useUserStats } from '@/contexts/UserStatsContext';
import { useAuth } from '@/contexts/AuthContext';
import { AdminNav } from '@/components/AdminNav';
import { OrdersAdmin } from '@/components/OrdersAdmin';
import { ReadingStatsAdmin } from '@/components/ReadingStatsAdmin';
import { VideoAd } from '@/components/VideoAd';
import { useBooks } from '@/hooks/useBooks';
import { useShopItems } from '@/hooks/useShopItems';

type AdminPage = 'admin' | 'shop-admin' | 'achievement-admin' | 'orders-admin' | 'reading-stats-admin' | 'audiobook-admin';
type Page = 'library' | 'reader' | 'shop' | 'search' | 'profile' | 'video-ad' | AdminPage;

const AppContent = () => {
  const [currentPage, setCurrentPage] = useState<Page>('library');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bookForAd, setBookForAd] = useState<Book | null>(null);
  
  const { books } = useBooks();
  const { shopItems } = useShopItems();
  const { userStats, addAchievement, updateAchievement, deleteAchievement } = useUserStats();
  const { subscription } = useAuth();

  const handleBookSelect = (book: Book) => {
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
      case 'shop':
        return <Shop shopItems={shopItems} />;
      case 'search':
        return <SearchPage books={books} onBookSelect={handleBookSelect} />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <BookLibrary books={books} onBookSelect={handleBookSelect} />;
    }
  };

  const pageBackground = ['library', 'search'].includes(currentPage) ? 'bg-forest-900' : 'bg-background';
  
  const isAdminPage = ['admin', 'shop-admin', 'achievement-admin', 'orders-admin', 'reading-stats-admin', 'audiobook-admin'].includes(currentPage);

  const getMainPadding = () => {
    switch (currentPage) {
      case 'library':
        return 'p-[50px]';
      case 'shop':
        return '';
      case 'profile':
        return '';
      default:
        return 'p-4 md:p-6';
    }
  };

  return (
    <>
      <SecurityHeaders />
      <div className={`min-h-screen ${pageBackground} transition-colors duration-500`}>
        {currentPage !== 'video-ad' && <Header onNavigate={setCurrentPage as any} currentPage={currentPage} />}
        <main className={`flex-1 ${getMainPadding()} pb-24`}>
          {isAdminPage && <AdminNav currentPage={currentPage as AdminPage} onNavigate={setCurrentPage as any} />}
          {renderCurrentPage()}
        </main>
        {currentPage !== 'reader' && currentPage !== 'video-ad' && <NavigationFooter onNavigate={setCurrentPage as any} />}
      </div>
    </>
  );
};

const AppContent = () => {
  return (
    <UserStatsProvider>
      <AppContent />
    </UserStatsProvider>
  );
};

export default Index;
