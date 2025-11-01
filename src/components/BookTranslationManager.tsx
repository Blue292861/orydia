import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Languages, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

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

  useEffect(() => {
    fetchBooksWithStatus();
  }, []);

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
          if (completedLanguages >= 6) {
            fullyTranslatedChapters++;
          }
        });

        let status: 'complete' | 'partial' | 'none';
        if (fullyTranslatedChapters === totalChapters && totalChapters > 0) {
          status = 'complete';
        } else if (fullyTranslatedChapters > 0 || translationsByChapter.size > 0) {
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

  const translateBook = async (bookId: string, bookTitle: string) => {
    setTranslatingBookId(bookId);
    addLog(`🚀 Démarrage de la traduction: ${bookTitle}`);
    toast.info(`Traduction de "${bookTitle}" en cours...`);

    try {
      const { data, error } = await supabase.functions.invoke('translate-book-chapters', {
        body: { book_id: bookId }
      });

      if (error) throw error;

      if (data.success) {
        addLog(`✅ "${bookTitle}" terminé: ${data.succeeded}/${data.total_chapters} chapitres`);
        toast.success(`"${bookTitle}" traduit avec succès!`);
        
        if (data.failed > 0) {
          addLog(`⚠️ ${data.failed} chapitres ont échoué dans "${bookTitle}"`);
          toast.warning(`${data.failed} chapitres ont échoué`);
        }
      }

      await fetchBooksWithStatus();
    } catch (error) {
      console.error('Translation error:', error);
      addLog(`❌ Erreur lors de la traduction de "${bookTitle}"`);
      toast.error(`Erreur: ${bookTitle}`);
    } finally {
      setTranslatingBookId(null);
    }
  };

  const translateAllBooks = async () => {
    setTranslatingAll(true);
    addLog('🌍 Démarrage de la traduction de tous les livres non traduits');
    toast.info('Traduction de tous les livres en cours...');

    const untranslatedBooks = books.filter(b => b.translation_status !== 'complete');
    addLog(`📚 ${untranslatedBooks.length} livres à traduire`);

    for (let i = 0; i < untranslatedBooks.length; i++) {
      const book = untranslatedBooks[i];
      addLog(`📖 [${i + 1}/${untranslatedBooks.length}] ${book.title}`);
      await translateBook(book.id, book.title);
      
      // Wait 10 seconds between books
      if (i < untranslatedBooks.length - 1) {
        addLog('⏸️ Pause de 10 secondes...');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }

    addLog('🎉 Traduction de tous les livres terminée!');
    toast.success('Tous les livres ont été traités!');
    setTranslatingAll(false);
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
            disabled={translatingAll || translatingBookId !== null}
            variant="outline"
          >
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
                Traduction en cours...
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
                disabled={translatingBookId === book.id || translatingAll}
                className="w-full"
                variant={book.translation_status === 'complete' ? 'outline' : 'default'}
              >
                {translatingBookId === book.id ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Traduction...
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
