import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Languages, CheckCircle2, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

interface BookWithTranslationStatus {
  id: string;
  title: string;
  author: string;
  total_chapters: number;
  translated_chapters: number;
  translation_status: 'complete' | 'partial' | 'none';
}

export const BookTranslationManager = () => {
  const [books, setBooks] = useState<BookWithTranslationStatus[]>([]);
  const [translatingBookId, setTranslatingBookId] = useState<string | null>(null);
  const [translationLogs, setTranslationLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [translatingAll, setTranslatingAll] = useState(false);
  const [pollingBookIds, setPollingBookIds] = useState<Set<string>>(new Set());
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchBooksWithStatus();
  }, []);

  // Cleanup polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const fetchBooksWithStatus = async () => {
    try {
      setLoading(true);
      
      // Get books with their chapters
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('id, title, author');

      if (booksError) throw booksError;

      // Get chapter counts
      const { data: chaptersData, error: chaptersError } = await supabase
        .from('book_chapter_epubs')
        .select('book_id, id');

      if (chaptersError) throw chaptersError;

      // Get translation counts per chapter and language
      const { data: translationsData, error: translationsError } = await supabase
        .from('chapter_translations')
        .select('chapter_id, language')
        .eq('status', 'completed');

      if (translationsError) throw translationsError;

      // Build chapter map
      const chaptersByBook = new Map<string, Set<string>>();
      chaptersData?.forEach(ch => {
        if (!chaptersByBook.has(ch.book_id)) {
          chaptersByBook.set(ch.book_id, new Set());
        }
        chaptersByBook.get(ch.book_id)!.add(ch.id);
      });

      // Build translation map: count completed languages per chapter
      const translationsByChapter = new Map<string, Set<string>>();
      translationsData?.forEach(t => {
        if (!translationsByChapter.has(t.chapter_id)) {
          translationsByChapter.set(t.chapter_id, new Set());
        }
        translationsByChapter.get(t.chapter_id)!.add(t.language);
      });

      // Combine data
      const booksWithStatus: BookWithTranslationStatus[] = (booksData || []).map(book => {
        const bookChapters = chaptersByBook.get(book.id) || new Set();
        const totalChapters = bookChapters.size;
        
        // Count how many chapters have all 6 languages completed
        let fullyTranslatedChapters = 0;
        bookChapters.forEach(chapterId => {
          const completedLanguages = translationsByChapter.get(chapterId)?.size || 0;
          if (completedLanguages === 6) {
            fullyTranslatedChapters++;
          }
        });

        let status: 'complete' | 'partial' | 'none';
        if (fullyTranslatedChapters === totalChapters && totalChapters > 0) {
          status = 'complete';
        } else if (fullyTranslatedChapters > 0) {
          status = 'partial';
        } else {
          status = 'none';
        }

        return {
          ...book,
          total_chapters: totalChapters,
          translated_chapters: fullyTranslatedChapters,
          translation_status: status,
        };
      });

      setBooks(booksWithStatus.sort((a, b) => {
        if (a.translation_status === b.translation_status) {
          return a.title.localeCompare(b.title);
        }
        const order = { none: 0, partial: 1, complete: 2 };
        return order[a.translation_status] - order[b.translation_status];
      }));
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Erreur lors du chargement des livres');
    } finally {
      setLoading(false);
    }
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTranslationLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 100));
  };

  // Start polling for translation status
  const startPolling = (bookId: string) => {
    setPollingBookIds(prev => new Set(prev).add(bookId));

    // Clear existing interval if any
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    // Poll every 15 seconds
    const interval = setInterval(async () => {
      await fetchBooksWithStatus();
      
      // Check if any books have completed
      const currentBooks = books.filter(b => pollingBookIds.has(b.id));
      const completedBooks = currentBooks.filter(b => b.translation_status === 'complete');
      
      if (completedBooks.length > 0) {
        completedBooks.forEach(book => {
          addLog(`✅ Traduction complétée: ${book.title}`);
          setPollingBookIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(book.id);
            return newSet;
          });
        });
      }

      // If no more books to poll, clear interval
      if (pollingBookIds.size === 0) {
        clearInterval(interval);
        setPollingInterval(null);
      }
    }, 15000);

    setPollingInterval(interval);
  };

  const translateBook = async (bookId: string, bookTitle: string) => {
    try {
      setTranslatingBookId(bookId);
      addLog(`🚀 Lancement de la traduction en arrière-plan: ${bookTitle}`);
      addLog(`ℹ️ Vous pouvez quitter la page, le traitement continue côté serveur`);
      
      // Call kickoff function instead of direct translation
      const { data, error } = await supabase.functions.invoke('translate-book-kickoff', {
        body: { book_id: bookId }
      });

      if (error) {
        // Check if it's a network error vs real error
        if (error.message.includes('Failed to fetch') || error.message.includes('FunctionsFetchError')) {
          addLog(`⚠️ Connexion interrompue — la traduction continue côté serveur: ${bookTitle}`);
          toast.info(`${bookTitle} - traduction en cours en arrière-plan`);
        } else {
          addLog(`❌ Erreur lors du lancement de ${bookTitle}: ${error.message}`);
          toast.error(`Impossible de lancer la traduction de ${bookTitle}`);
          setTranslatingBookId(null);
          return false;
        }
      } else {
        addLog(`✅ Traduction lancée: ${bookTitle}`);
        toast.success(`${bookTitle} - traduction en cours`);
      }

      // Start polling for this book
      startPolling(bookId);
      return true;
      
    } catch (error: any) {
      // Network errors during translation
      if (error.message.includes('Failed to fetch') || error.name === 'FunctionsFetchError') {
        addLog(`⚠️ Connexion perdue pour ${bookTitle} — poursuite en arrière-plan`);
        startPolling(bookId);
        return true;
      }
      
      addLog(`❌ Erreur inattendue pour ${bookTitle}: ${error.message}`);
      toast.error('Une erreur inattendue s\'est produite');
      return false;
    } finally {
      setTranslatingBookId(null);
    }
  };

  const translateAllBooks = async () => {
    const untranslatedBooks = books.filter(b => b.translation_status !== 'complete');

    if (untranslatedBooks.length === 0) {
      toast.info('Tous les livres sont déjà traduits');
      return;
    }

    setTranslatingAll(true);
    addLog(`📚 Lancement de la traduction de ${untranslatedBooks.length} livres en arrière-plan`);
    addLog(`ℹ️ Vous pouvez quitter la page, les traductions continuent côté serveur`);

    for (let i = 0; i < untranslatedBooks.length; i++) {
      const book = untranslatedBooks[i];
      addLog(`📖 [${i + 1}/${untranslatedBooks.length}] Lancement: ${book.title}`);
      
      await translateBook(book.id, book.title);
      
      // Courte pause entre chaque lancement
      if (i < untranslatedBooks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setTranslatingAll(false);
    addLog(`🎉 Tous les livres ont été lancés en traduction!`);
    toast.success(`${untranslatedBooks.length} livres en cours de traduction`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-green-500 text-white"><CheckCircle2 className="h-3 w-3 mr-1" />Complet</Badge>;
      case 'partial':
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Partiel</Badge>;
      case 'none':
        return <Badge variant="outline">Aucune</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  const untranslatedCount = books.filter(b => b.translation_status !== 'complete').length;

  return (
    <div className="space-y-6">
      {pollingBookIds.size > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div>
                <p className="font-medium">Traduction en arrière-plan</p>
                <p className="text-sm text-muted-foreground">
                  {pollingBookIds.size} livre(s) en cours • Vous pouvez quitter la page, le traitement continue
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Languages className="h-6 w-6" />
            Traduction des livres
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {books.length} livres · {untranslatedCount} restant{untranslatedCount > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={fetchBooksWithStatus}
            disabled={loading}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button 
            onClick={translateAllBooks}
            disabled={translatingAll || untranslatedCount === 0}
            size="lg"
          >
            {translatingAll ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Lancement...
              </>
            ) : (
              `Traduire tous (${untranslatedCount})`
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {books.map(book => (
          <Card key={book.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{book.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{book.author}</p>
                </div>
                {getStatusBadge(book.translation_status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progression</span>
                <span className="font-medium">
                  {book.translated_chapters} / {book.total_chapters} chapitres
                </span>
              </div>
              <Button 
                onClick={() => translateBook(book.id, book.title)}
                disabled={translatingBookId === book.id || translatingAll || pollingBookIds.has(book.id)}
                className="w-full"
                variant={book.translation_status === 'complete' ? 'outline' : 'default'}
              >
                {translatingBookId === book.id || pollingBookIds.has(book.id) ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    En cours...
                  </>
                ) : book.translation_status === 'complete' ? (
                  'Retraduire'
                ) : (
                  'Traduire ce livre'
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Logs de traduction</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] w-full rounded border p-4">
            {translationLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun log pour le moment</p>
            ) : (
              <div className="space-y-1">
                {translationLogs.map((log, i) => (
                  <div key={i} className="text-sm font-mono">{log}</div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
