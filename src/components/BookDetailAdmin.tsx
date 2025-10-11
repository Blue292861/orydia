import React, { useState } from 'react';
import { Book } from '@/types/Book';
import { ChapterEpub } from '@/types/ChapterEpub';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookForm } from '@/components/BookForm';
import { ChapterEpubForm } from '@/components/ChapterEpubForm';
import { ChapterEpubList } from '@/components/ChapterEpubList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface BookDetailAdminProps {
  book: Book;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookUpdate: (book: Book) => void;
}

export const BookDetailAdmin: React.FC<BookDetailAdminProps> = ({
  book,
  open,
  onOpenChange,
  onBookUpdate,
}) => {
  const [activeTab, setActiveTab] = useState('info');
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [editingChapter, setEditingChapter] = useState<ChapterEpub | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [nextPosition, setNextPosition] = useState(1);

  const handleChapterSuccess = () => {
    setShowChapterForm(false);
    setEditingChapter(null);
    setRefreshKey((prev) => prev + 1);
  };

  const handleEditChapter = (chapter: ChapterEpub) => {
    setEditingChapter(chapter);
    setShowChapterForm(true);
  };

  const handleAddChapter = () => {
    setEditingChapter(null);
    setShowChapterForm(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{book.title}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Informations générales</TabsTrigger>
            <TabsTrigger value="chapters">Gérer les chapitres</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-4">
            <BookForm initialBook={book} onSubmit={onBookUpdate} />
          </TabsContent>

          <TabsContent value="chapters" className="mt-4 space-y-4">
            {!showChapterForm && (
              <div className="flex justify-end">
                <Button onClick={handleAddChapter}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un chapitre
                </Button>
              </div>
            )}

            {showChapterForm ? (
              <ChapterEpubForm
                bookId={book.id}
                chapter={editingChapter || undefined}
                nextPosition={nextPosition}
                onSuccess={handleChapterSuccess}
                onCancel={() => {
                  setShowChapterForm(false);
                  setEditingChapter(null);
                }}
              />
            ) : (
              <ChapterEpubList
                bookId={book.id}
                onEdit={handleEditChapter}
                refresh={refreshKey}
              />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
