import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChapterEpub } from '@/types/ChapterEpub';
import { Book } from '@/types/Book';
import { chapterEpubService } from '@/services/chapterEpubService';
import { fetchBooksFromDB } from '@/services/bookService';
import { getUserEpubProgressForBook } from '@/services/chapterService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, CheckCircle2, BookMarked } from 'lucide-react';
import { toast } from 'sonner';

export const BookTableOfContents: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<ChapterEpub[]>([]);
  const [loading, setLoading] = useState(true);
  const [progressMap, setProgressMap] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    const loadData = async () => {
      if (!bookId) return;

      try {
        const books = await fetchBooksFromDB();
        const foundBook = books.find((b) => b.id === bookId);
        if (!foundBook) {
          toast.error('Livre introuvable');
          navigate('/');
          return;
        }
        setBook(foundBook);

        const chaptersData = await chapterEpubService.getChaptersByBookId(bookId);
        setChapters(chaptersData);

        const progress = await getUserEpubProgressForBook(bookId);
        setProgressMap(progress);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [bookId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!book) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          
          <div className="flex flex-col md:flex-row gap-6">
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-48 h-64 object-cover rounded-lg shadow-lg"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
              <p className="text-xl text-muted-foreground mb-4">{book.author}</p>
              {book.summary && (
                <p className="text-muted-foreground">{book.summary}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Table des matières</h2>
          <Badge variant="secondary" className="text-sm">
            {Array.from(progressMap.values()).filter(Boolean).length} / {chapters.length} lus
          </Badge>
        </div>
        
        {chapters.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Aucun chapitre disponible pour le moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chapters.map((chapter) => {
              const isCompleted = progressMap.get(chapter.id) === true;
              const isInProgress = progressMap.has(chapter.id) && !isCompleted;
              
              return (
                <Card
                  key={chapter.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative"
                  onClick={() => navigate(`/book/${bookId}/chapter/${chapter.id}`)}
                >
                  {isCompleted && (
                    <div className="absolute top-2 right-2 z-10">
                      <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Lu
                      </Badge>
                    </div>
                  )}
                  {isInProgress && !isCompleted && (
                    <div className="absolute top-2 right-2 z-10">
                      <Badge variant="secondary">
                        <BookMarked className="h-3 w-3 mr-1" />
                        En cours
                      </Badge>
                    </div>
                  )}
                  {chapter.illustration_url && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={chapter.illustration_url}
                        alt={chapter.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{chapter.title}</CardTitle>
                    {chapter.description && (
                      <CardDescription className="line-clamp-3">
                        {chapter.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">
                      <BookOpen className="mr-2 h-4 w-4" />
                      {isCompleted ? 'Relire le chapitre' : isInProgress ? 'Continuer' : 'Lire le chapitre'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
