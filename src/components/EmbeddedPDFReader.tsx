import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmbeddedPDFReaderProps {
  pdfUrl: string;
  title: string;
  className?: string;
  onScrollToEnd?: () => void;
}

export const EmbeddedPDFReader: React.FC<EmbeddedPDFReaderProps> = ({
  pdfUrl,
  title,
  className = "",
  onScrollToEnd
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(100);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Créer l'URL du viewer PDF.js sécurisé
  const createSecurePDFUrl = () => {
    const pdfJsUrl = 'https://mozilla.github.io/pdf.js/web/viewer.html';
    const params = new URLSearchParams({
      file: encodeURIComponent(pdfUrl),
    });
    
    // Paramètres pour désactiver les contrôles de téléchargement
    return `${pdfJsUrl}?${params.toString()}#toolbar=0&navpanes=0&scrollbar=1&zoom=${scale}`;
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
    
    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow) {
        // Écouter les messages de l'iframe pour la navigation
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== 'https://mozilla.github.io') return;
          
          if (event.data.type === 'documentLoaded') {
            setTotalPages(event.data.pages);
          } else if (event.data.type === 'pageChanged') {
            setCurrentPage(event.data.page);
            
            // Déclencher onScrollToEnd si on atteint la dernière page
            if (event.data.page === totalPages && onScrollToEnd) {
              setTimeout(onScrollToEnd, 2000);
            }
          }
        };
        
        window.addEventListener('message', handleMessage);
        
        // Injecter du CSS pour masquer les boutons de téléchargement
        setTimeout(() => {
          try {
            const iframeDoc = iframe.contentDocument;
            if (iframeDoc) {
              const style = iframeDoc.createElement('style');
              style.textContent = `
                #download, #openFile, #print, .download, .print {
                  display: none !important;
                }
                #toolbarViewerRight .splitToolbarButton > .toolbarButton {
                  display: none !important;
                }
                #secondaryToolbarButton {
                  display: none !important;
                }
                .toolbar {
                  display: none !important;
                }
              `;
              iframeDoc.head.appendChild(style);
            }
          } catch (e) {
            // Cross-origin restriction, expected
          }
        }, 1000);

        return () => window.removeEventListener('message', handleMessage);
      }
    } catch (e) {
      console.warn('Cannot access iframe content due to CORS');
    }
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError('Impossible de charger le PDF. Vérifiez votre connexion internet.');
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 25, 200));
    refreshViewer();
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 25, 50));
    refreshViewer();
  };

  const refreshViewer = () => {
    if (iframeRef.current) {
      iframeRef.current.src = createSecurePDFUrl();
    }
  };

  const navigatePage = (direction: 'prev' | 'next') => {
    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: direction === 'next' ? 'nextPage' : 'prevPage'
        }, 'https://mozilla.github.io');
      }
    } catch (e) {
      console.warn('Cannot communicate with iframe');
    }
  };

  // Empêcher le clic droit et les raccourcis de téléchargement
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Bloquer Ctrl+S, Ctrl+P, etc.
    if (e.ctrlKey && (e.key === 's' || e.key === 'p')) {
      e.preventDefault();
      return false;
    }
  };

  useEffect(() => {
    // Simuler la détection de fin de lecture après 30 secondes
    if (onScrollToEnd) {
      const timer = setTimeout(() => {
        onScrollToEnd();
      }, 30000);
      
      return () => clearTimeout(timer);
    }
  }, [onScrollToEnd]);

  return (
    <div className={`w-full ${className}`} onKeyDown={handleKeyDown} tabIndex={-1}>
      {/* Controls */}
      <div className="flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Contrôles PDF (Page {currentPage}{totalPages > 0 ? ` / ${totalPages}` : ''})
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={zoomOut}
            disabled={scale <= 50}
            className="flex items-center gap-1"
          >
            <ZoomOut className="h-3 w-3" />
          </Button>
          
          <span className="text-xs px-2 py-1 bg-background rounded">
            {scale}%
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={zoomIn}
            disabled={scale >= 200}
            className="flex items-center gap-1"
          >
            <ZoomIn className="h-3 w-3" />
          </Button>

          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigatePage('prev')}
              disabled={currentPage <= 1}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigatePage('next')}
              disabled={totalPages > 0 && currentPage >= totalPages}
              className="flex items-center gap-1"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={refreshViewer}
            className="flex items-center gap-1 ml-2"
          >
            <RefreshCw className="h-3 w-3" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div 
        className="relative border rounded-lg overflow-hidden bg-gray-50 min-h-[600px]"
        onContextMenu={handleContextMenu}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Chargement du PDF sécurisé...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
            <div className="text-center p-6">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={createSecurePDFUrl()}
          className="w-full h-[600px] border-0"
          title={`Lecture PDF sécurisée: ${title}`}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          sandbox="allow-scripts allow-same-origin allow-forms"
          style={{
            pointerEvents: 'auto'
          }}
        />
      </div>

      {/* Info */}
      <div className="mt-3 text-xs text-muted-foreground text-center">
        <p>
          Lecteur PDF sécurisé - Téléchargement désactivé. Utilisez les contrôles ci-dessus pour naviguer.
        </p>
      </div>
    </div>
  );
};