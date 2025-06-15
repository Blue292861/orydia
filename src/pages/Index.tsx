import React, { useState } from 'react';
import { BookLibrary } from '@/components/BookLibrary';
import { AdminDashboard } from '@/components/AdminDashboard';
import { ShopAdmin } from '@/components/ShopAdmin';
import { BookReader } from '@/components/BookReader';
import { Shop } from '@/components/Shop';
import { SearchPage } from '@/components/SearchPage';
import { ProfilePage } from '@/components/ProfilePage';
import { PremiumPage } from '@/components/PremiumPage';
import { Header } from '@/components/Header';
import { NavigationFooter } from '@/components/NavigationFooter';
import { UserStatsProvider } from '@/contexts/UserStatsContext';
import { Book } from '@/types/Book';
import { ShopItem } from '@/types/ShopItem';

type UserView = 'home' | 'search' | 'shop' | 'profile' | 'premium';

const Index = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentView, setCurrentView] = useState<UserView>('home');
  const [books, setBooks] = useState<Book[]>([
    {
      id: '1',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=450&fit=crop',
      content: `In my younger and more vulnerable years my father gave me some advice that I've carried with me ever since. "Whenever you feel like criticizing anyone," he told me, "just remember that all the people in this world haven't had the advantages that you've had."

He didn't say any more, but we've always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that. In consequence, I'm inclined to reserve all judgments, a habit that has opened up many curious natures to me and also made me the victim of not a few veteran bores.

The abnormal mind is quick to detect and attach itself to this quality when it appears in a normal person, and so it came about that in college I was unjustly accused of being a politician, because I was privy to the secret griefs of wild, unknown men. Most of the big shore places were closed now and there were hardly any lights except the shadowy, moving glow of a ferryboat across the Sound.`,
      points: 50,
      tags: ['classic', 'american literature', 'drama'],
      isPremium: false
    },
    {
      id: '2',
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      coverUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop',
      content: `When I was almost six and Jem was nearly ten, our summertime boundaries (within calling distance of Calpurnia) were Mrs. Henry Lafayette Dubose's house two doors to the north of us, and the Radley Place three doors to the south. We were never tempted to break them. The Radley Place was inhabited by an unknown entity the mere description of whom was enough to make us behave for days on end; Mrs. Dubose was plain hell.`,
      points: 75,
      tags: ['classic', 'social justice', 'coming of age'],
      isPremium: true
    }
  ]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([
    {
      id: '1',
      name: 'Premium Bookmark Set',
      description: 'Beautiful leather bookmarks with golden accents',
      price: 150,
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=300&fit=crop',
      category: 'Accessories'
    },
    {
      id: '2',
      name: 'Reading Light',
      description: 'LED reading light with adjustable brightness',
      price: 300,
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
      category: 'Electronics'
    }
  ]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

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

  const renderUserContent = () => {
    if (selectedBook) {
      return (
        <BookReader 
          book={selectedBook} 
          onClose={() => setSelectedBook(null)} 
        />
      );
    }

    switch (currentView) {
      case 'home':
        return (
          <BookLibrary 
            books={books} 
            onSelectBook={setSelectedBook} 
          />
        );
      case 'search':
        return (
          <SearchPage 
            books={books} 
            onSelectBook={setSelectedBook} 
          />
        );
      case 'shop':
        return <Shop shopItems={shopItems} />;
      case 'profile':
        return <ProfilePage />;
      case 'premium':
        return <PremiumPage />;
      default:
        return (
          <BookLibrary 
            books={books} 
            onSelectBook={setSelectedBook} 
          />
        );
    }
  };

  const renderAdminContent = () => {
    if (currentView === 'shop') {
      return (
        <ShopAdmin 
          shopItems={shopItems} 
          onAddItem={addShopItem} 
          onUpdateItem={updateShopItem} 
          onDeleteItem={deleteShopItem} 
        />
      );
    }
    
    return (
      <AdminDashboard 
        books={books} 
        onAddBook={addBook} 
        onUpdateBook={updateBook} 
        onDeleteBook={deleteBook} 
      />
    );
  };

  return (
    <UserStatsProvider>
      <div className="min-h-screen bg-background">
        <Header 
          isAdmin={isAdmin} 
          setIsAdmin={setIsAdmin}
          currentView={isAdmin ? (currentView === 'shop' ? 'shop' : 'books') : undefined}
          onNavigate={isAdmin ? (view: string) => setCurrentView(view as UserView) : undefined}
        />
        
        <div className="container mx-auto px-4 py-6">
          {isAdmin ? renderAdminContent() : renderUserContent()}
        </div>
        
        <NavigationFooter 
          currentView={currentView}
          onNavigate={setCurrentView}
          isAdmin={isAdmin}
        />
      </div>
    </UserStatsProvider>
  );
};

export default Index;
