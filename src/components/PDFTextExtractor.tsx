import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Zap, 
  Download,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  RotateCcw
} from 'lucide-react';
import { PDFExtractionService, ExtractionResult } from '@/services/pdfExtractionService';
import { TextReader } from './TextReader';
import { useToast } from '@/hooks/use-toast';

interface PDFTextExtractorProps {
  pdfUrl: string;
  fileName: string;
  onTextExtracted?: (text: string) => void;
  onBack?: () => void;
  autoExtract?: boolean;
}

export const PDFTextExtractor: React.FC<PDFTextExtractorProps> = ({
  pdfUrl,
  fileName,
  onTextExtracted,
  onBack,
  autoExtract = false
}) => {
  const [extractionState, setExtractionState] = useState<'idle' | 'extracting' | 'completed' | 'error'>('idle');
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [extractedResult, setExtractedResult] = useState<ExtractionResult | null>(null);
  const [showTextReader, setShowTextReader] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (autoExtract && extractionState === 'idle') {
      handleExtraction();
    }
  }, [autoExtract]);

  const handleExtraction = async () => {
    setExtractionState('extracting');
    setExtractionProgress(0);
    setProgressStatus('Démarrage de l\'extraction...');

    try {
      const result = await PDFExtractionService.extractText(
        pdfUrl,
        (progress, status) => {
          setExtractionProgress(progress);
          setProgressStatus(status);
        }
      );

      setExtractedResult(result);

      if (result.success && result.text.trim().length > 0) {
        setExtractionState('completed');
        setExtractionProgress(100);
        setProgressStatus('Extraction terminée avec succès !');
        
        toast({
          title: "Extraction réussie",
          description: `Texte extrait avec ${result.method === 'pdfjs' ? 'PDF.js' : result.method === 'server' ? 'le serveur' : 'OCR'} (${result.pageCount} pages)`
        });

        if (onTextExtracted) {
          onTextExtracted(result.text);
        }
      } else {
        throw new Error(result.error || 'Aucun texte extrait');
      }

    } catch (error) {
      console.error('Extraction failed:', error);
      setExtractionState('error');
      setProgressStatus(error instanceof Error ? error.message : 'Erreur d\'extraction');
      
      toast({
        title: "Échec de l'extraction",
        description: "Impossible d'extraire le texte du PDF",
        variant: "destructive"
      });
    }
  };

  const resetExtraction = () => {
    setExtractionState('idle');
    setExtractionProgress(0);
    setProgressStatus('');
    setExtractedResult(null);
    setShowTextReader(false);
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'pdfjs': return <Zap className="h-4 w-4" />;
      case 'server': return <Download className="h-4 w-4" />;
      case 'ocr': return <Eye className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'pdfjs': return 'PDF.js (Rapide)';
      case 'server': return 'Serveur (Backup)';
      case 'ocr': return 'OCR (Reconnaissance)';
      default: return 'Inconnu';
    }
  };

  if (showTextReader && extractedResult?.text) {
    return (
      <TextReader
        title={fileName}
        content={extractedResult.text}
        onBack={() => setShowTextReader(false)}
        showControls={true}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Extraction de texte PDF
          </h1>
          <p className="text-muted-foreground mt-1">{fileName}</p>
        </div>
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Retour
          </Button>
        )}
      </div>

      {/* Extraction Card */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Extraction automatique</h2>
            {extractionState === 'idle' && (
              <Button onClick={handleExtraction}>
                <Zap className="h-4 w-4 mr-2" />
                Extraire le texte
              </Button>
            )}
            {extractionState === 'completed' && (
              <Button variant="outline" onClick={resetExtraction}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Recommencer
              </Button>
            )}
          </div>

          {/* Progress */}
          {extractionState === 'extracting' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">{progressStatus}</span>
              </div>
              <Progress value={extractionProgress} className="w-full" />
            </div>
          )}

          {/* Success */}
          {extractionState === 'completed' && extractedResult && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between w-full">
                <div>
                  <div className="flex items-center gap-2">
                    {getMethodIcon(extractedResult.method)}
                    <span>
                      Extraction réussie avec <strong>{getMethodLabel(extractedResult.method)}</strong>
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {extractedResult.pageCount} pages • ~{extractedResult.text.split(/\s+/).length} mots
                  </div>
                </div>
                <Button onClick={() => setShowTextReader(true)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Lire le texte
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Error */}
          {extractionState === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div>Échec de l'extraction: {progressStatus}</div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleExtraction}
                  className="mt-2"
                >
                  Réessayer
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </Card>

      {/* Methods explanation */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Méthodes d'extraction</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <div className="font-medium">PDF.js (Prioritaire)</div>
              <div className="text-sm text-muted-foreground">
                Extraction rapide côté navigateur pour les PDFs textuels
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Download className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <div className="font-medium">Serveur (Backup)</div>
              <div className="text-sm text-muted-foreground">
                Extraction côté serveur si PDF.js échoue
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Eye className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <div className="font-medium">OCR (Dernier recours)</div>
              <div className="text-sm text-muted-foreground">
                Reconnaissance optique pour les PDFs scannés
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Preview of extracted text */}
      {extractedResult?.text && extractionState === 'completed' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Aperçu du texte extrait</h3>
          <div className="bg-muted p-4 rounded-lg max-h-40 overflow-y-auto">
            <div className="text-sm font-mono whitespace-pre-wrap">
              {extractedResult.text.substring(0, 500)}
              {extractedResult.text.length > 500 && '...'}
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => setShowTextReader(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Lire en mode texte
            </Button>
            {onTextExtracted && (
              <Button variant="outline" onClick={() => onTextExtracted(extractedResult.text)}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Utiliser ce texte
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};