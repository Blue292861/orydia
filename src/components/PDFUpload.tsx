import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PDFUploadProps {
  onPDFUploaded: (url: string) => void;
  disabled?: boolean;
  className?: string;
}

export const PDFUpload: React.FC<PDFUploadProps> = ({ 
  onPDFUploaded, 
  disabled,
  className 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    fileName?: string;
  } | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('📁 Fichier PDF sélectionné:', file.name);

    // Validation du fichier
    if (!file.type.includes('pdf')) {
      toast({
        title: "Fichier invalide",
        description: "Veuillez sélectionner un fichier PDF",
        variant: "destructive"
      });
      return;
    }

    const maxSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSize) {
      toast({
        title: "Fichier trop volumineux",
        description: `Le fichier fait ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum autorisé: 25MB`,
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setUploadResult(null);

    try {
      // Génération d'un nom unique pour le PDF
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const fileName = `chapter-pdf-${timestamp}-${randomId}.${fileExt}`;
      
      console.log(`📤 Upload vers Supabase: ${fileName}`);
      setProgress(25);

      // Upload vers Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('book-covers') // Utilise le même bucket que les autres fichiers
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      setProgress(75);

      if (uploadError) {
        console.error('💥 Erreur Supabase:', uploadError);
        throw uploadError;
      }

      console.log('✅ Upload réussi, récupération de l\'URL...');
      
      // Récupération de l'URL publique
      const { data: urlData } = supabase.storage
        .from('book-covers')
        .getPublicUrl(fileName);
      
      if (!urlData.publicUrl) {
        throw new Error('Impossible d\'obtenir l\'URL publique du fichier');
      }

      setProgress(100);
      console.log('🎉 Upload terminé avec succès:', urlData.publicUrl);
      
      // Appeler le callback avec l'URL du PDF
      onPDFUploaded(urlData.publicUrl);
      
      setUploadResult({
        success: true,
        message: `PDF uploadé avec succès (${file.name})`,
        fileName: file.name
      });

      toast({
        title: "✅ PDF uploadé !",
        description: "Le PDF sera affiché directement dans le lecteur de jeu",
        duration: 4000
      });

    } catch (error) {
      console.error('💥 Erreur upload:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      
      setUploadResult({
        success: false,
        message: errorMessage
      });

      toast({
        title: "❌ Échec de l'upload",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setProgress(0);
      
      // Reset de l'input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const getIcon = () => {
    if (isUploading) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const getButtonText = () => {
    if (isUploading) {
      return `Upload en cours... ${progress}%`;
    }
    return "Uploader un PDF (affichage direct)";
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
      
      {/* Bouton d'upload */}
      <Button
        type="button"
        variant="outline"
        onClick={triggerFileSelect}
        disabled={disabled || isUploading}
        className="flex items-center gap-2 w-full sm:w-auto"
      >
        {getIcon()}
        {getButtonText()}
      </Button>

      {/* Barre de progression */}
      {isUploading && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Upload en cours...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}

      {/* Résultat de l'upload */}
      {uploadResult && !isUploading && (
        <Alert className={uploadResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <div className="flex items-center gap-2">
            {uploadResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={uploadResult.success ? "text-green-800" : "text-red-800"}>
              {uploadResult.message}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Instructions */}
      {!isUploading && !uploadResult && (
        <p className="text-xs text-muted-foreground">
          Le PDF sera affiché directement dans le lecteur en conservant sa mise en page originale
        </p>
      )}
    </div>
  );
};