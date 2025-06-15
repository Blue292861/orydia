
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

const AppContent = () => {
  const [currentPage, setCurrentPage] = useState<'library' | 'reader' | 'admin' | 'shop-admin' | 'achievement-admin' | 'shop' | 'search' | 'profile' | 'premium'>('library');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const { userStats, addAchievement, updateAchievement, deleteAchievement } = useUserStats();

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
    setSelectedBook(book);
    setCurrentPage('reader');
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

  return (
    <div className={`min-h-screen ${pageBackground} transition-colors duration-500`}>
      <Header onNavigate={setCurrentPage} currentPage={currentPage} />
      <main className="flex-1 p-4 md:p-6">
        {renderCurrentPage()}
      </main>
      {currentPage !== 'reader' && <NavigationFooter onNavigate={setCurrentPage} />}
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
