import React, { useState } from 'react';
import { Book } from '@/types/Book';
import { ShopItem } from '@/types/ShopItem';
import { BookLibrary } from '@/components/BookLibrary';
import { BookReader } from '@/components/BookReader';
import { AdminDashboard } from '@/components/AdminDashboard';
import { ShopAdmin } from '@/components/ShopAdmin';
import { AchievementAdmin } from '@/components/AchievementAdmin';
import { Shop } from '@/components/Shop';
import { SearchPage } from '@/components/SearchPage';
import { ProfilePage } from '@/components/ProfilePage';
import { PremiumPage } from '@/components/PremiumPage';
import { Header } from '@/components/Header';
import { NavigationFooter } from '@/components/NavigationFooter';
import { UserStatsProvider, useUserStats } from '@/contexts/UserStatsContext';
import { useAuth } from '@/contexts/AuthContext';
import { AdminNav } from '@/components/AdminNav';
import { OrdersAdmin } from '@/components/OrdersAdmin';
import { ReadingStatsAdmin } from '@/components/ReadingStatsAdmin';
import { VideoAd } from '@/components/VideoAd';

type AdminPage = 'admin' | 'shop-admin' | 'achievement-admin' | 'orders-admin' | 'reading-stats-admin';
type Page = 'library' | 'reader' | 'shop' | 'search' | 'profile' | 'premium' | 'video-ad' | AdminPage;

const AppContent = () => {
  const [currentPage, setCurrentPage] = useState<Page>('library');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bookForAd, setBookForAd] = useState<Book | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([
    {
      id: '1',
      name: 'Épée de bravoure',
      description: "Une épée forgée dans le coeur d'une étoile.",
      price: 500,
      imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?q=80&w=2748&auto=format&fit=crop',
      category: 'Arme',
      seller: 'Forgeron Jo'
    },
    {
      id: '2',
      name: "Armure de l'Aube",
      description: 'Protège contre les ombres les plus sombres.',
      price: 750,
      imageUrl: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?q=80&w=2787&auto=format&fit=crop',
      category: 'Armure',
      seller: 'Artisane Elara'
    },
    {
      id: '3',
      name: 'Grimoire des Arcanes',
      description: 'Contient des sorts oubliés depuis des éons.',
      price: 1200,
      imageUrl: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?q=80&w=2942&auto=format&fit=crop',
      category: 'Magie',
      seller: 'Paco le Bibliothécaire'
    },
    {
      id: '4',
      name: 'Potion de vitalité',
      description: 'Restaure la santé et la vigueur.',
      price: 150,
      imageUrl: 'https://images.unsplash.com/photo-1493962853295-0fd70327578a?q=80&w=2938&auto=format&fit=crop',
      category: 'Consommable',
      seller: 'Alchimiste Zander'
    },
    {
      id: '5',
      name: 'Amulette de perspicacité',
      description: "Augmente l'intelligence et la sagesse du porteur.",
      price: 800,
      imageUrl: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?q=80&w=2787&auto=format&fit=crop',
      category: 'Accessoire',
      seller: 'Artisane Elara'
    }
  ]);
  const { userStats, addAchievement, updateAchievement, deleteAchievement } = useUserStats();
  const { subscription } = useAuth();

  const addBook = (book: Book) => {
    setBooks([...books, { ...book, id: Date.now().toString() }]);
  };

  const updateBook = (updatedBook: Book) => {
    setBooks(books.map(book => book.id === updatedBook.id ? updatedBook : book));
  };

  const deleteBook = (id: string) => {
    setBooks(books.filter(book => book.id !== id));
  };

  const addShopItem = (item: ShopItem) => {
    setShopItems([...shopItems, { ...item, id: Date.now().toString() }]);
  };

  const updateShopItem = (updatedItem: ShopItem) => {
    setShopItems(shopItems.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const deleteShopItem = (id: string) => {
    setShopItems(shopItems.filter(item => item.id !== id));
  };

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
        return (
          <AdminDashboard
            books={books}
            onAddBook={addBook}
            onUpdateBook={updateBook}
            onDeleteBook={deleteBook}
          />
        );
      case 'shop-admin':
        return (
          <ShopAdmin
            shopItems={shopItems}
            onAddItem={addShopItem}
            onUpdateItem={updateShopItem}
            onDeleteItem={deleteShopItem}
          />
        );
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
      case 'premium':
        return <PremiumPage />;
      default:
        return <BookLibrary books={books} onBookSelect={handleBookSelect} />;
    }
  };

  const pageBackground = ['library', 'search'].includes(currentPage) ? 'bg-forest-900' : 'bg-background';
  
  const isAdminPage = ['admin', 'shop-admin', 'achievement-admin', 'orders-admin', 'reading-stats-admin'].includes(currentPage);

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
    <div className={`min-h-screen ${pageBackground} transition-colors duration-500`}>
      {currentPage !== 'video-ad' && <Header onNavigate={setCurrentPage as any} currentPage={currentPage} />}
      <main className={`flex-1 ${getMainPadding()} pb-24`}>
        {isAdminPage && <AdminNav currentPage={currentPage as AdminPage} onNavigate={setCurrentPage as any} />}
        {renderCurrentPage()}
      </main>
      {currentPage !== 'reader' && currentPage !== 'video-ad' && <NavigationFooter onNavigate={setCurrentPage as any} />}
    </div>
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
