
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCw, Maximize, Download, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmbeddedPDFReaderProps {
  pdfUrl: string;
  title: string;
  className?: string;
}

export const EmbeddedPDFReader: React.FC<EmbeddedPDFReaderProps> = ({
  pdfUrl,
  title,
  className = ""
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError('Impossible de charger le PDF. Vérifiez votre connexion internet.');
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${title}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Téléchargement démarré",
      description: "Le PDF va être téléchargé dans votre dossier de téléchargements."
    });
  };

  const handleFullscreen = () => {
    window.open(pdfUrl, '_blank');
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    // Force iframe refresh
    const iframe = document.querySelector('#pdf-reader-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Controls */}
      <div className="flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Contrôles PDF:
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Actualiser
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleFullscreen}
            className="flex items-center gap-1"
          >
            <Maximize className="h-3 w-3" />
            Plein écran
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex items-center gap-1"
          >
            <Download className="h-3 w-3" />
            Télécharger
          </Button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="relative border rounded-lg overflow-hidden bg-gray-50 min-h-[600px]">
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
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </div>
          </div>
        )}

        <iframe
          id="pdf-reader-iframe"
          src={pdfUrl}
          className="w-full h-[600px] border-0"
          title={`Lecture PDF: ${title}`}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      </div>

      {/* Info */}
      <div className="mt-3 text-xs text-muted-foreground text-center">
        <p>
          Utilisez les contrôles de votre navigateur ou du lecteur PDF intégré pour naviguer, zoomer et ajuster l'affichage.
        </p>
      </div>
    </div>
  );
};
