import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Upload, Copy, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SimplePDFImportProps {
  onTextExtracted: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

export const SimplePDFImport: React.FC<SimplePDFImportProps> = ({ 
  onTextExtracted, 
  disabled,
  className 
}) => {
  const { toast } = useToast();
  const [pdfText, setPdfText] = useState('');
  const [step, setStep] = useState<'upload' | 'extract'>('upload');

  const handlePDFUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('pdf')) {
      toast({
        title: "Fichier invalide",
        description: "Veuillez sélectionner un fichier PDF",
        variant: "destructive"
      });
      return;
    }

    console.log('📁 PDF sélectionné:', file.name);
    setStep('extract');
    
    // Créer une URL pour le PDF afin de l'ouvrir dans un nouvel onglet
    const pdfUrl = URL.createObjectURL(file);
    
    // Ouvrir le PDF dans un nouvel onglet
    window.open(pdfUrl, '_blank');
    
    toast({
      title: "PDF ouvert",
      description: "Le PDF s'ouvre dans un nouvel onglet. Copiez le texte et collez-le ci-dessous.",
      duration: 5000
    });
  };

  const handleTextSubmit = () => {
    if (!pdfText.trim()) {
      toast({
        title: "Texte requis",
        description: "Veuillez coller le contenu du PDF dans la zone de texte",
        variant: "destructive"
      });
      return;
    }

    onTextExtracted(pdfText.trim());
    setPdfText('');
    setStep('upload');
    
    toast({
      title: "✅ Contenu importé",
      description: `Texte extrait avec succès (${pdfText.length} caractères)`,
      duration: 4000
    });
  };

  const handleCancel = () => {
    setPdfText('');
    setStep('upload');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {step === 'upload' ? (
        <>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handlePDFUpload}
            className="hidden"
            id="pdf-upload"
            disabled={disabled}
          />
          
          <label htmlFor="pdf-upload">
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              className="flex items-center gap-2 w-full sm:w-auto cursor-pointer"
              asChild
            >
              <span>
                <FileText className="h-4 w-4" />
                Importer un PDF (copier-coller)
              </span>
            </Button>
          </label>

          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Comment ça marche :</strong>
              <br />1. Cliquez sur "Importer un PDF"
              <br />2. Le PDF s'ouvrira dans un nouvel onglet
              <br />3. Sélectionnez et copiez le texte (Ctrl+A puis Ctrl+C)
              <br />4. Revenez ici et collez le texte
            </AlertDescription>
          </Alert>
        </>
      ) : (
        <>
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>PDF ouvert dans un nouvel onglet</strong>
              <br />Sélectionnez tout le texte (Ctrl+A) puis copiez-le (Ctrl+C) et collez-le ci-dessous
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Contenu du PDF :
            </label>
            <Textarea
              value={pdfText}
              onChange={(e) => setPdfText(e.target.value)}
              placeholder="Collez ici le contenu copié depuis le PDF..."
              className="min-h-[200px] resize-vertical"
              disabled={disabled}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleTextSubmit}
              disabled={!pdfText.trim() || disabled}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Utiliser ce contenu
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleCancel}
              disabled={disabled}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Choisir un autre PDF
            </Button>
          </div>

          {pdfText.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Contenu : {pdfText.length} caractères
            </p>
          )}
        </>
      )}
    </div>
  );
};