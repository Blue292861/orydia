import React, { useState, useEffect, useRef } from 'react';
import ePub, { Book, Rendition } from 'epubjs';
import { MapPin, FileText, Image, Volume2, ExternalLink, Trash2, Edit, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { ChapterEpub } from '@/types/ChapterEpub';
import { Waypoint, WaypointFormData } from '@/types/Waypoint';
import { getWaypointsByChapterId, createWaypoint, updateWaypoint, deleteWaypoint } from '@/services/waypointService';
import WaypointForm from './WaypointForm';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface WaypointManagerProps {
  chapter: ChapterEpub;
  onClose: () => void;
}

const WaypointManager: React.FC<WaypointManagerProps> = ({ chapter, onClose }) => {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [selectedWord, setSelectedWord] = useState<string>('');
  const [selectedCfi, setSelectedCfi] = useState<string>('');
  const [editingWaypoint, setEditingWaypoint] = useState<Waypoint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  
  const viewerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<Book | null>(null);
  const renditionRef = useRef<Rendition | null>(null);

  // Load waypoints
  useEffect(() => {
    loadWaypoints();
  }, [chapter.id]);

  // Initialize EPUB viewer
  useEffect(() => {
    if (!viewerRef.current) return;

    const epubUrl = chapter.merged_epub_url || chapter.epub_url;
    const book = ePub(epubUrl);
    bookRef.current = book;

    const rendition = book.renderTo(viewerRef.current, {
      width: '100%',
      height: '100%',
      spread: 'none'
    });

    renditionRef.current = rendition;

    rendition.themes.default({
      body: {
        'font-family': 'Georgia, serif',
        'font-size': '14px',
        'line-height': '1.6',
        'padding': '10px'
      }
    });

    rendition.display();

    // Handle text selection
    rendition.on('selected', (cfiRange: string, contents: any) => {
      const selection = contents.window.getSelection();
      const text = selection?.toString().trim();
      
      if (text && text.length > 0 && text.length < 100) {
        setSelectedWord(text);
        setSelectedCfi(cfiRange);
        setEditingWaypoint(null);
        setShowForm(true);
      }
    });

    // Track navigation position
    rendition.on('relocated', (location: any) => {
      setAtStart(location.atStart);
      setAtEnd(location.atEnd);
    });

    return () => {
      if (bookRef.current) {
        bookRef.current.destroy();
      }
    };
  }, [chapter]);

  // Highlight existing waypoints in the EPUB
  useEffect(() => {
    if (!renditionRef.current || waypoints.length === 0) return;

    renditionRef.current.hooks.content.register((contents: any) => {
      const doc = contents.document;
      
      waypoints.forEach(waypoint => {
        highlightWaypointInDocument(doc, waypoint);
      });
    });
  }, [waypoints]);

  const loadWaypoints = async () => {
    setIsLoading(true);
    try {
      const data = await getWaypointsByChapterId(chapter.id);
      setWaypoints(data);
    } catch (error) {
      console.error('Error loading waypoints:', error);
      toast.error('Erreur lors du chargement des waypoints');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextPage = () => {
    renditionRef.current?.next();
  };

  const handlePrevPage = () => {
    renditionRef.current?.prev();
  };

  const highlightWaypointInDocument = (doc: Document, waypoint: Waypoint) => {
    const walker = doc.createTreeWalker(
      doc.body,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node: Text | null;
    while ((node = walker.nextNode() as Text | null)) {
      const text = node.textContent || '';
      const index = text.indexOf(waypoint.word_text);
      
      if (index !== -1) {
        const range = doc.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + waypoint.word_text.length);

        const span = doc.createElement('span');
        span.className = 'orydia-waypoint-admin';
        span.dataset.waypointId = waypoint.id;
        span.style.cssText = `
          background-color: rgba(245, 158, 11, 0.3);
          border-bottom: 2px solid #f59e0b;
          cursor: pointer;
        `;

        range.surroundContents(span);
        break;
      }
    }
  };

  const handleSaveWaypoint = async (data: WaypointFormData) => {
    try {
      if (editingWaypoint) {
        await updateWaypoint(editingWaypoint.id, data);
        toast.success('Waypoint mis à jour');
      } else {
        await createWaypoint(data);
        toast.success('Waypoint créé');
      }
      
      setShowForm(false);
      setSelectedWord('');
      setSelectedCfi('');
      setEditingWaypoint(null);
      loadWaypoints();
    } catch (error) {
      console.error('Error saving waypoint:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteWaypoint = async (id: string) => {
    try {
      await deleteWaypoint(id);
      toast.success('Waypoint supprimé');
      setShowForm(false);
      setEditingWaypoint(null);
      loadWaypoints();
    } catch (error) {
      console.error('Error deleting waypoint:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleEditWaypoint = (waypoint: Waypoint) => {
    setEditingWaypoint(waypoint);
    setSelectedWord(waypoint.word_text);
    setSelectedCfi(waypoint.cfi_range);
    setShowForm(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'audio': return <Volume2 className="h-4 w-4" />;
      case 'link': return <ExternalLink className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-amber-500" />
          <h2 className="font-semibold">Gestion des Waypoints</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {chapter.title} - Chapitre {chapter.chapter_number}
        </p>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* EPUB Viewer */}
        <div className="flex-1 border-r border-border flex flex-col">
          <div className="p-2 bg-muted/30 border-b border-border text-xs text-muted-foreground">
            Sélectionnez un mot pour créer un waypoint
          </div>
          <div ref={viewerRef} className="flex-1 bg-white" />
          {/* Navigation bar */}
          <div className="p-2 bg-muted/30 border-t border-border flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={atStart}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Précédent
            </Button>
            <span className="text-xs text-muted-foreground">
              Naviguez pour sélectionner des mots
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={atEnd}
            >
              Suivant
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-80 flex flex-col">
          {showForm ? (
            <ScrollArea className="flex-1 p-4">
              <WaypointForm
                chapterId={chapter.id}
                selectedWord={selectedWord}
                selectedCfi={selectedCfi}
                existingWaypoint={editingWaypoint}
                onSave={handleSaveWaypoint}
                onCancel={() => {
                  setShowForm(false);
                  setEditingWaypoint(null);
                }}
                onDelete={editingWaypoint ? () => handleDeleteWaypoint(editingWaypoint.id) : undefined}
              />
            </ScrollArea>
          ) : (
            <>
              {/* Waypoints list */}
              <div className="p-3 border-b border-border bg-muted/30">
                <span className="text-sm font-medium">
                  Waypoints existants ({waypoints.length})
                </span>
              </div>
              <ScrollArea className="flex-1">
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : waypoints.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    Aucun waypoint pour ce chapitre.
                    <br />
                    Sélectionnez un mot dans l'aperçu pour en créer un.
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    {waypoints.map(waypoint => (
                      <div
                        key={waypoint.id}
                        className="p-3 bg-card border border-border rounded-lg hover:border-amber-500/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-amber-500">
                              {getTypeIcon(waypoint.waypoint_type)}
                            </span>
                            <span className="font-medium truncate">
                              {waypoint.word_text}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleEditWaypoint(waypoint)}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteWaypoint(waypoint.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        {waypoint.content_text && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {waypoint.content_text}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border bg-muted/30 flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Fermer
        </Button>
      </div>
    </div>
  );
};

export default WaypointManager;
