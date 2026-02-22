import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Flag, CheckCircle, XCircle, Image, Calendar, BookOpen, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ChapterReport {
  id: string;
  user_id: string;
  book_id: string;
  chapter_id: string;
  chapter_title: string;
  report_type: string;
  description: string;
  screenshot_url: string | null;
  status: string;
  created_at: string;
  book_title?: string;
}

const REPORT_TYPE_LABELS: Record<string, string> = {
  orthography: 'Orthographe',
  layout: 'Mise en page',
  missing_content: 'Contenu manquant',
  other: 'Autre',
};

export const ReportsAdmin: React.FC = () => {
  const [reports, setReports] = useState<ChapterReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ChapterReport | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('chapter_reports')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Erreur lors du chargement des signalements');
      setLoading(false);
      return;
    }

    // Fetch book titles
    const bookIds = [...new Set((data || []).map(r => r.book_id))];
    let bookMap: Record<string, string> = {};
    if (bookIds.length > 0) {
      const { data: books } = await supabase
        .from('books')
        .select('id, title')
        .in('id', bookIds);
      if (books) {
        bookMap = Object.fromEntries(books.map(b => [b.id, b.title]));
      }
    }

    setReports((data || []).map(r => ({ ...r, book_title: bookMap[r.book_id] || 'Livre inconnu' })));
    setLoading(false);
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const groupedByBook = reports.reduce<Record<string, ChapterReport[]>>((acc, r) => {
    (acc[r.book_id] = acc[r.book_id] || []).push(r);
    return acc;
  }, {});

  const handleUpdateStatus = async (id: string, status: 'resolved' | 'dismissed') => {
    setUpdating(true);
    const { error } = await supabase
      .from('chapter_reports')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast.error('Erreur lors de la mise à jour');
    } else {
      toast.success(status === 'resolved' ? 'Signalement marqué comme traité' : 'Signalement rejeté');
      setSelectedReport(null);
      fetchReports();
    }
    setUpdating(false);
  };

  if (loading) return <div className="text-center py-12">Chargement des signalements...</div>;

  const bookEntries = Object.entries(groupedByBook);

  if (bookEntries.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <Flag className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground">Aucun signalement en attente</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Signalements en attente</h3>

      <Accordion type="single" collapsible className="space-y-2">
        {bookEntries.map(([bookId, bookReports]) => (
          <AccordionItem key={bookId} value={bookId} className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{bookReports[0].book_title}</span>
                <Badge variant="destructive">{bookReports.length}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2">
                {bookReports.map(report => (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className="w-full text-left p-3 rounded-md border hover:bg-accent/50 transition-colors flex items-center gap-3"
                  >
                    <Badge variant="outline" className="shrink-0">
                      {REPORT_TYPE_LABELS[report.report_type] || report.report_type}
                    </Badge>
                    <span className="text-sm text-muted-foreground shrink-0">{report.chapter_title}</span>
                    <span className="text-sm truncate flex-1">{report.description}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {format(new Date(report.created_at), 'dd/MM/yyyy', { locale: fr })}
                    </span>
                  </button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Detail Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Détail du signalement
            </DialogTitle>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Type de problème</p>
                <Badge variant="outline" className="mt-1">
                  {REPORT_TYPE_LABELS[selectedReport.report_type] || selectedReport.report_type}
                </Badge>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Chapitre concerné</p>
                <p className="font-medium">{selectedReport.chapter_title}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="mt-1 whitespace-pre-wrap">{selectedReport.description}</p>
              </div>

              {selectedReport.screenshot_url && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Capture d'écran</p>
                  <a href={selectedReport.screenshot_url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={selectedReport.screenshot_url}
                      alt="Capture d'écran du signalement"
                      className="max-h-48 rounded-md border cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  </a>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {format(new Date(selectedReport.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => selectedReport && handleUpdateStatus(selectedReport.id, 'dismissed')}
              disabled={updating}
              className="flex items-center gap-2"
            >
              <XCircle className="h-4 w-4" /> Rejeter
            </Button>
            <Button
              onClick={() => selectedReport && handleUpdateStatus(selectedReport.id, 'resolved')}
              disabled={updating}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" /> Marquer comme traité
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
