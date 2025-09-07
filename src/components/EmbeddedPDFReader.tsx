import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCw, RefreshCw } from 'lucide-react';
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
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleObjectLoad = () => {
    console.log('PDF embed loaded successfully');
    setIsLoading(false);
    setError(null);
  };

  const handleObjectError = () => {
    console.log('PDF embed failed to load, showing fallback');
    setIsLoading(false);
    // Show fallback instead of error
    const fallback = document.getElementById('pdf-fallback');
    if (fallback) {
      fallback.style.display = 'flex';
    }
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const rotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const refresh = () => {
    setIsLoading(true);
    setError(null);
    // Force refresh by updating a key or reloading
    window.location.reload();
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
    console.log('EmbeddedPDFReader mounted with URL:', pdfUrl);
    
    // Timeout pour détecter si le PDF ne se charge jamais
    const loadTimeout = setTimeout(() => {
      if (isLoading) {
        console.log('PDF load timeout - switching to fallback');
        setIsLoading(false);
        setError('Le chargement du PDF prend trop de temps. Essayez de rafraîchir.');
      }
    }, 10000); // 10 secondes
    
    // Simuler la détection de fin de lecture après 30 secondes
    if (onScrollToEnd) {
      const timer = setTimeout(() => {
        onScrollToEnd();
      }, 30000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(loadTimeout);
      };
    }
    
    return () => clearTimeout(loadTimeout);
  }, [pdfUrl, onScrollToEnd, isLoading]);

  return (
    <div className={`w-full ${className}`} onKeyDown={handleKeyDown} tabIndex={-1}>
      {/* Controls */}
      <div className="flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Lecteur PDF - {title}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="flex items-center gap-1"
          >
            <ZoomOut className="h-3 w-3" />
          </Button>
          
          <span className="text-xs px-2 py-1 bg-background rounded">
            {Math.round(scale * 100)}%
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={zoomIn}
            disabled={scale >= 3}
            className="flex items-center gap-1"
          >
            <ZoomIn className="h-3 w-3" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={rotate}
            className="flex items-center gap-1 ml-2"
          >
            <RotateCw className="h-3 w-3" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div 
        className="relative border rounded-lg overflow-hidden bg-muted/20 min-h-[600px]"
        onContextMenu={handleContextMenu}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Chargement du PDF...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
            <div className="text-center p-6">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={refresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </div>
          </div>
        )}

        <div className="w-full h-[600px] relative">
          <embed
            src={pdfUrl}
            type="application/pdf"
            className="w-full h-full border-0 rounded"
            title={`Lecture PDF: ${title}`}
            onLoad={handleObjectLoad}
            onError={handleObjectError}
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease'
            }}
          />
          
          {/* Fallback direct link */}
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm" style={{ display: 'none' }} id="pdf-fallback">
            <div className="text-center p-6">
              <p className="text-muted-foreground mb-4">
                Impossible d'afficher le PDF directement.
              </p>
              <a 
                href={pdfUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Ouvrir le PDF dans un nouvel onglet
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 text-xs text-muted-foreground text-center">
        <p>
          Lecteur PDF sécurisé - Contrôles de téléchargement limités par le navigateur.
        </p>
      </div>
    </div>
  );
};