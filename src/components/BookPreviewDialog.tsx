import React from 'react';
import { Book } from '@/types/Book';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';
import { ShareButton } from '@/components/ShareButton';
import { chapterEpubService } from '@/services/chapterEpubService';
import { epubPreloadService } from '@/services/epubPreloadService';

interface BookPreviewDialogProps {
  book: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReadBook: (book: Book) => void;
}

export const BookPreviewDialog: React.FC<BookPreviewDialogProps> = ({
  book,
  open,
  onOpenChange,
  onReadBook
}) => {
  if (!book) return null;

  const handleReadClick = () => {
    // Précharger le premier chapitre EPUB dès le clic (fire and forget)
    if (book.hasChapters) {
      chapterEpubService.getChaptersByBookId(book.id).then(chapters => {
        if (chapters.length > 0) {
          const firstChapter = chapters[0];
          const urlToPreload = firstChapter.merged_epub_url || firstChapter.epub_url;
          epubPreloadService.preloadChapter(firstChapter.id, urlToPreload);
          console.log(`🚀 Preloading first chapter from preview dialog: ${firstChapter.id}`);
        }
      }).catch(console.warn);
    }
    
    onReadBook(book);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {book.title}
            {book.isPremium && (
              <Crown className="h-5 w-5 text-yellow-500 fill-current" />
            )}
          </DialogTitle>
          <DialogDescription>
            Aperçu du livre par {book.author}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid md:grid-cols-[1fr,2fr] gap-6">
          {/* Couverture */}
          <div className="flex justify-center">
            <div className="relative w-48 aspect-[2/3]">
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-full h-full object-cover rounded-lg shadow-lg"
              />
              {book.isPremium && (
                <Badge className="absolute -top-2 -right-2 bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900">
                  Premium
                </Badge>
              )}
            </div>
          </div>

          {/* Informations */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {book.title}
              </h3>
              <p className="text-muted-foreground">
                par {book.author}
              </p>
            </div>

            {book.summary && (
              <div>
                <h4 className="font-medium mb-2 text-foreground">Résumé</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {book.summary}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" 
                alt="Tensens Icon" 
                className="h-4 w-4" 
              />
              <span className="text-sm font-medium">{book.points} Tensens</span>
            </div>

            {book.tags && book.tags.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-foreground">Catégories</h4>
                <div className="flex flex-wrap gap-2">
                  {book.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 space-y-3">
              <button
                onClick={handleReadClick}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4 rounded-md transition-colors font-medium"
              >
                Commencer la lecture
              </button>
              <ShareButton 
                author={book.author} 
                title={book.title}
                variant="outline"
                showText={true}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};