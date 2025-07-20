
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Copy, FileText, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PDFExtractorProps {
  isOpen: boolean;
  onClose: () => void;
  pdfDataUrl: string;
  fileName: string;
  onTextExtracted: (text: string) => void;
}

export const PDFExtractor: React.FC<PDFExtractorProps> = ({
  isOpen,
  onClose,
  pdfDataUrl,
  fileName,
  onTextExtracted
}) => {
  const [extractedText, setExtractedText] = useState('');
  const { toast } = useToast();

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setExtractedText(e.target.value);
  };

  const handleSaveText = () => {
    if (extractedText.trim()) {
      onTextExtracted(extractedText);
      toast({
        title: "Texte extrait",
        description: "Le contenu du PDF a été sauvegardé avec succès."
      });
      onClose();
    } else {
      toast({
        title: "Texte requis",
        description: "Veuillez saisir le contenu du PDF dans la zone de texte.",
        variant: "destructive"
      });
    }
  };

  const handleCopyFileName = () => {
    navigator.clipboard.writeText(fileName);
    toast({
      title: "Nom copié",
      description: "Le nom du fichier a été copié dans le presse-papiers."
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Extraction de texte PDF
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyFileName}
              className="h-6 px-2"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {fileName} - Copiez le contenu visible ci-dessous dans la zone de texte
          </p>
        </DialogHeader>

        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* PDF Viewer */}
          <div className="flex-1 border rounded-lg overflow-hidden bg-gray-50">
            <iframe
              src={pdfDataUrl}
              className="w-full h-full min-h-[500px]"
              title="Aperçu du PDF"
            />
          </div>

          {/* Text Extraction Area */}
          <div className="w-1/2 flex flex-col gap-2">
            <label className="text-sm font-medium">
              Contenu extrait manuellement :
            </label>
            <Textarea
              value={extractedText}
              onChange={handleTextChange}
              placeholder="Copiez et collez ici le contenu du PDF affiché à gauche..."
              className="flex-1 min-h-[500px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Astuce : Sélectionnez le texte dans le PDF à gauche et copiez-le ici (Ctrl+C puis Ctrl+V)
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button onClick={handleSaveText} disabled={!extractedText.trim()}>
            <FileText className="h-4 w-4 mr-2" />
            Utiliser ce contenu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
