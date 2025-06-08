
import React, { useState } from 'react';
import { BookLibrary } from '@/components/BookLibrary';
import { AdminDashboard } from '@/components/AdminDashboard';
import { BookReader } from '@/components/BookReader';
import { Header } from '@/components/Header';
import { Book } from '@/types/Book';

const Index = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [books, setBooks] = useState<Book[]>([
    {
      id: '1',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=450&fit=crop',
      content: `In my younger and more vulnerable years my father gave me some advice that I've carried with me ever since. "Whenever you feel like criticizing anyone," he told me, "just remember that all the people in this world haven't had the advantages that you've had."

He didn't say any more, but we've always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that. In consequence, I'm inclined to reserve all judgments, a habit that has opened up many curious natures to me and also made me the victim of not a few veteran bores.

The abnormal mind is quick to detect and attach itself to this quality when it appears in a normal person, and so it came about that in college I was unjustly accused of being a politician, because I was privy to the secret griefs of wild, unknown men. Most of the big shore places were closed now and there were hardly any lights except the shadowy, moving glow of a ferryboat across the Sound.`
    },
    {
      id: '2',
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      coverUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop',
      content: `When I was almost six and Jem was nearly ten, our summertime boundaries (within calling distance of Calpurnia) were Mrs. Henry Lafayette Dubose's house two doors to the north of us, and the Radley Place three doors to the south. We were never tempted to break them. The Radley Place was inhabited by an unknown entity the mere description of whom was enough to make us behave for days on end; Mrs. Dubose was plain hell.`
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

  return (
    <div className="min-h-screen bg-background">
      <Header isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
      
      <div className="container mx-auto px-4 py-6">
        {selectedBook ? (
          <BookReader 
            book={selectedBook} 
            onClose={() => setSelectedBook(null)} 
          />
        ) : isAdmin ? (
          <AdminDashboard 
            books={books} 
            onAddBook={addBook} 
            onUpdateBook={updateBook} 
            onDeleteBook={deleteBook} 
          />
        ) : (
          <BookLibrary 
            books={books} 
            onSelectBook={setSelectedBook} 
          />
        )}
      </div>
    </div>
  );
};

export default Index;
