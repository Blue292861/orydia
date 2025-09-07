import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, FileText } from 'lucide-react';
import { TextReader } from './TextReader';

interface EmbeddedPDFReaderProps {
  pdfUrl: string;
  title?: string;
  content?: string;
}

export const EmbeddedPDFReader: React.FC<EmbeddedPDFReaderProps> = ({ 
  pdfUrl, 
  title = "Document PDF", 
  content 
}) => {
  // Si on a du contenu extrait, on l'affiche directement
  if (content && content.trim() && !content.startsWith('http')) {
    return <TextReader content={content} title={title} />;
  }

  // Fallback: afficher une alerte pour indiquer que le contenu n'est pas disponible
  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {title}
        </CardTitle>
        <div className="flex gap-2">
          <Button
            onClick={() => window.open(pdfUrl, '_blank')}
            variant="outline"
            size="sm"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Ouvrir le PDF
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            Le contenu de ce document n'a pas encore été extrait. Veuillez contacter l'administrateur pour que le texte soit rendu disponible.
          </AlertDescription>
        </Alert>
        
        <div className="mt-4 w-full h-full min-h-[500px] bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center p-6">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Contenu en cours de traitement par l'administration
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};