import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  RefreshCw, 
  FileText,
  Zap,
  Eye,
  Download
} from 'lucide-react';
import { PDFTextExtractor } from './PDFTextExtractor';
import { TextReader } from './TextReader';

interface EmbeddedPDFReaderProps {
  pdfUrl: string;
  title: string;
  className?: string;
  onScrollToEnd?: () => void;
  onTextExtracted?: (text: string) => void;
  showTextExtraction?: boolean;
}

export const EmbeddedPDFReader: React.FC<EmbeddedPDFReaderProps> = ({
  pdfUrl,
  title,
  className = "",
  onScrollToEnd,
  onTextExtracted,
  showTextExtraction = true
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [viewMode, setViewMode] = useState<'pdf' | 'extractor' | 'text'>('pdf');
  const [extractedText, setExtractedText] = useState<string>('');

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
    setScale(prev => Math.min(prev + 0.25, 3.0));
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
    const fallback = document.getElementById('pdf-fallback');
    if (fallback) {
      fallback.style.display = 'none';
    }
    
    // Force reload by changing src
    const embed = document.querySelector('embed') as HTMLEmbedElement;
    if (embed) {
      const currentSrc = embed.src;
      embed.src = '';
      setTimeout(() => {
        embed.src = currentSrc;
      }, 100);
    }
  };

  const handleTextExtraction = (text: string) => {
    setExtractedText(text);
    setViewMode('text');
    if (onTextExtracted) {
      onTextExtracted(text);
    }
  };

  // Handle scroll detection for PDFs
  useEffect(() => {
    if (onScrollToEnd) {
      const timer = setTimeout(() => {
        onScrollToEnd();
      }, 30000); // Simulate end of reading after 30 seconds
      
      return () => clearTimeout(timer);
    }
  }, [onScrollToEnd]);

  // Text reader view
  if (viewMode === 'text' && extractedText) {
    return (
      <TextReader
        title={title}
        content={extractedText}
        onBack={() => setViewMode('pdf')}
        showControls={true}
      />
    );
  }

  // Text extractor view
  if (viewMode === 'extractor') {
    return (
      <PDFTextExtractor
        pdfUrl={pdfUrl}
        fileName={title}
        onTextExtracted={handleTextExtraction}
        onBack={() => setViewMode('pdf')}
        autoExtract={true}
      />
    );
  }

  // PDF viewer (default)
  return (
    <div className={`embedded-pdf-reader ${className}`}>
      <Card className="overflow-hidden">
        {/* Header with view mode controls */}
        <div className="flex items-center justify-between p-4 bg-muted/50 border-b">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <h3 className="font-semibold">{title}</h3>
          </div>
          
          {showTextExtraction && (
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'pdf' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('pdf')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Vue PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('extractor')}
              >
                <Zap className="h-4 w-4 mr-2" />
                Extraire le texte
              </Button>
              {extractedText && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode('text')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Lire le texte
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between p-3 bg-muted/30 border-b">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={zoomOut}
              disabled={scale <= 0.5}
              title="Zoom arrière"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-mono min-w-[4ch] text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={zoomIn}
              disabled={scale >= 3.0}
              title="Zoom avant"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={rotate}
              title="Rotation"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              title="Actualiser"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && !error && (
          <div className="flex items-center justify-center h-64 bg-muted/30">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement du PDF...</p>
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
          
          {/* Fallback with extraction option */}
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm" style={{ display: 'none' }} id="pdf-fallback">
            <div className="text-center p-6 space-y-4">
              <p className="text-muted-foreground mb-4">
                Impossible d'afficher le PDF directement.
              </p>
              <div className="flex gap-2 justify-center">
                <a 
                  href={pdfUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Ouvrir dans un nouvel onglet
                </a>
                {showTextExtraction && (
                  <Button onClick={() => setViewMode('extractor')}>
                    <Zap className="h-4 w-4 mr-2" />
                    Extraire le texte
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};