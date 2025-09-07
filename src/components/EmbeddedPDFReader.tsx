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
  // Si on a du contenu extrait (et que ce n'est pas une URL PDF), on l'affiche directement
  if (content && content.trim() && !content.startsWith('http') && !content.includes('.pdf')) {
    return <TextReader content={content} title={title} />;
  }

  // Sinon, afficher le message d'attente d'extraction admin
  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            Le contenu de ce document n'a pas encore été extrait par l'administration. Le texte sera bientôt disponible pour la lecture.
          </AlertDescription>
        </Alert>
        
        <div className="mt-4 w-full h-full min-h-[500px] bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center p-6">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">
              Contenu en cours de traitement
            </p>
            <p className="text-sm text-muted-foreground">
              L'administration prépare ce contenu pour une meilleure expérience de lecture
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};