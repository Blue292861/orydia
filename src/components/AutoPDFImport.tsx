import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { extractTextFromPDF, validatePDFFile } from '@/utils/pdfTextExtractor';

interface AutoPDFImportProps {
  onTextExtracted: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

export const AutoPDFImport: React.FC<AutoPDFImportProps> = ({ 
  onTextExtracted, 
  disabled,
  className 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractionResult, setExtractionResult] = useState<{
    success: boolean;
    message: string;
    textLength?: number;
  } | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('📁 Fichier PDF sélectionné:', file.name);

    // Validation du fichier
    const validation = validatePDFFile(file);
    if (!validation.valid) {
      toast({
        title: "Fichier invalide",
        description: validation.error,
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setExtractionResult(null);

    try {
      // Simulation du progrès pendant l'extraction
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 200);

      // Extraction du texte
      const result = await extractTextFromPDF(file);
      
      clearInterval(progressInterval);
      setProgress(100);

      if (result.success && result.text) {
        // Succès de l'extraction
        onTextExtracted(result.text);
        
        setExtractionResult({
          success: true,
          message: `Texte extrait avec succès (${result.text.length} caractères)`,
          textLength: result.text.length
        });

        toast({
          title: "✅ Extraction réussie",
          description: `Le contenu du PDF a été extrait automatiquement (${result.text.length} caractères)`,
          duration: 4000
        });

      } else {
        // Échec de l'extraction
        setExtractionResult({
          success: false,
          message: result.error || 'Erreur inconnue lors de l\'extraction'
        });

        toast({
          title: "❌ Extraction échouée",
          description: result.error || 'Impossible d\'extraire le texte du PDF',
          variant: "destructive",
          duration: 5000
        });
      }

    } catch (error) {
      console.error('💥 Erreur fatale:', error);
      
      setExtractionResult({
        success: false,
        message: 'Erreur technique lors du traitement du PDF'
      });

      toast({
        title: "❌ Erreur technique",
        description: "Une erreur inattendue s'est produite lors du traitement du PDF",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      
      // Reset de l'input pour permettre de sélectionner le même fichier
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const getIcon = () => {
    if (isProcessing) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const getButtonText = () => {
    if (isProcessing) {
      return `Extraction en cours... ${progress}%`;
    }
    return "Importer un PDF (extraction automatique)";
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {/* Bouton d'import */}
      <Button
        type="button"
        variant="outline"
        onClick={triggerFileSelect}
        disabled={disabled || isProcessing}
        className="flex items-center gap-2 w-full sm:w-auto"
      >
        {getIcon()}
        {getButtonText()}
      </Button>

      {/* Barre de progression */}
      {isProcessing && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Extraction du texte en cours...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}

      {/* Résultat de l'extraction */}
      {extractionResult && !isProcessing && (
        <Alert className={extractionResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <div className="flex items-center gap-2">
            {extractionResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={extractionResult.success ? "text-green-800" : "text-red-800"}>
              {extractionResult.message}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Instructions */}
      {!isProcessing && !extractionResult && (
        <p className="text-xs text-muted-foreground">
          Le texte du PDF sera automatiquement extrait et inséré dans le contenu du chapitre
        </p>
      )}
    </div>
  );
};