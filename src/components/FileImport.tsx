import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileImage, FileText, FileAudio, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PDFViewer } from './PDFViewer';
import { 
  validateFileType, 
  validateFileSize, 
  validateFileName, 
  validateMimeTypeByHeader,
  sanitizeText 
} from '@/utils/security';

interface FileImportProps {
  type: 'image' | 'pdf' | 'audio';
  onFileImport: (content: string) => void;
  disabled?: boolean;
}

const FILE_LIMITS = {
  image: { maxSize: 10, types: ['image/png', 'image/jpeg', 'image/jpg'] },
  pdf: { maxSize: 25, types: ['application/pdf'] },
  audio: { maxSize: 50, types: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/mpeg'] }
};

export const FileImport: React.FC<FileImportProps> = ({ type, onFileImport, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [pdfDataUrl, setPdfDataUrl] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const checkConnectivity = async (): Promise<boolean> => {
    try {
      console.log('Checking connectivity...');
      const response = await fetch(`https://aotzivwzoxmnnawcxioo.supabase.co/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvdHppdnd6b3htbm5hd2N4aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5OTEwODYsImV4cCI6MjA2NTU2NzA4Nn0.n-S4MY36dvh2C8f8hRV3AH98VI5gtu3TN_Szb9G_ZQA'
        }
      });
      const isConnected = response.ok;
      console.log('Connectivity check result:', isConnected);
      return isConnected;
    } catch (error) {
      console.error('Connectivity check failed:', error);
      return false;
    }
  };

  const uploadWithRetry = async (file: File, fileName: string, attempt: number = 1): Promise<string> => {
    console.log(`Upload attempt ${attempt}/${MAX_RETRIES} for file:`, fileName);
    
    try {
      setUploadProgress(10);
      
      // Check connectivity before upload
      if (attempt === 1) {
        const isConnected = await checkConnectivity();
        if (!isConnected) {
          throw new Error('Aucune connexion Internet détectée. Vérifiez votre connexion et réessayez.');
        }
      }
      
      setUploadProgress(25);
      
      // Upload to Supabase Storage with timeout
      const uploadPromise = supabase.storage
        .from('book-covers')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      // Add timeout to the upload
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: Upload trop lent')), 30000); // 30 seconds
      });

      const { data: uploadData, error: uploadError } = await Promise.race([
        uploadPromise,
        timeoutPromise
      ]) as any;

      setUploadProgress(75);

      if (uploadError) {
        console.error('Upload error details:', {
          message: uploadError.message,
          error: uploadError.error,
          statusCode: uploadError.statusCode
        });
        
        // Handle specific error codes
        if (uploadError.statusCode === 413) {
          throw new Error('Fichier trop volumineux pour le serveur');
        } else if (uploadError.statusCode === 403) {
          throw new Error('Permissions insuffisantes pour uploader');
        } else if (uploadError.statusCode === 409) {
          throw new Error('Un fichier avec ce nom existe déjà');
        }
        
        throw new Error(`Erreur upload: ${uploadError.message}`);
      }

      setUploadProgress(90);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('book-covers')
        .getPublicUrl(fileName);

      if (!urlData.publicUrl) {
        throw new Error('Impossible d\'obtenir l\'URL publique');
      }

      setUploadProgress(100);
      console.log('Upload successful:', urlData.publicUrl);
      return urlData.publicUrl;

    } catch (error) {
      console.error(`Upload attempt ${attempt} failed:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setLastError(errorMessage);
      
      // Retry logic
      if (attempt < MAX_RETRIES && !errorMessage.includes('trop volumineux') && !errorMessage.includes('Permissions')) {
        console.log(`Retrying in ${RETRY_DELAY}ms...`);
        await sleep(RETRY_DELAY * attempt); // Exponential backoff
        return uploadWithRetry(file, fileName, attempt + 1);
      }
      
      throw error;
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('File selected:', { 
      name: file.name, 
      type: file.type, 
      size: file.size 
    });

    setUploading(true);
    setUploadProgress(0);
    setLastError(null);
    setRetryCount(0);

    try {
      // Validate file name with better error messages
      if (!validateFileName(file.name)) {
        console.error('Invalid filename:', file.name);
        throw new Error(`Le nom de fichier "${file.name}" contient des caractères non autorisés ou est trop long. Évitez les caractères spéciaux comme < > " | * ? \\ /`);
      }

      const limits = FILE_LIMITS[type];
      
      // Validate file size
      if (!validateFileSize(file, limits.maxSize)) {
        console.error('File too large:', file.size);
        throw new Error(`Le fichier doit faire moins de ${limits.maxSize}MB. Taille actuelle: ${(file.size / 1024 / 1024).toFixed(1)}MB`);
      }

      // Validate file type by MIME type
      if (!validateFileType(file, limits.types)) {
        console.error('Invalid file type:', file.type);
        throw new Error(`Veuillez sélectionner un fichier ${type} valide. Type détecté: ${file.type}`);
      }

      // Validate file type by header (magic bytes) - but be more permissive
      try {
        const isValidHeader = await validateMimeTypeByHeader(file, limits.types);
        if (!isValidHeader) {
          console.warn('File header validation failed, but proceeding:', file.name);
          toast({
            title: "Avertissement",
            description: "Le format du fichier ne correspond pas parfaitement à son extension, mais l'importation va continuer.",
            variant: "default"
          });
        }
      } catch (headerError) {
        console.warn('Header validation error:', headerError);
      }

      // Process the file based on type
      if (type === 'image' || type === 'pdf') {
        // Generate unique filename
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const publicUrl = await uploadWithRetry(file, fileName);
        
        onFileImport(publicUrl);
        toast({
          title: type === 'image' ? "Image uploadée" : "PDF uploadé",
          description: type === 'image' 
            ? "L'image de couverture a été sauvegardée sur le serveur."
            : "Le PDF a été sauvegardé sur le serveur."
        });
        
      } else if (type === 'audio') {
        // Keep audio as base64 for now
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            onFileImport(result);
            toast({
              title: "Audio importé",
              description: "Le fichier audio a été téléchargé avec succès."
            });
          }
        };
        reader.onerror = () => {
          throw new Error('Impossible de lire le fichier audio.');
        };
        reader.readAsDataURL(file);
      }
      
    } catch (error) {
      console.error('File import error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue lors de l\'importation';
      setLastError(errorMessage);
      
      toast({
        title: "Erreur d'importation",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRetry = () => {
    if (fileInputRef.current && fileInputRef.current.files && fileInputRef.current.files[0]) {
      setRetryCount(prev => prev + 1);
      handleFileSelect({ target: { files: fileInputRef.current.files } } as any);
    } else {
      triggerFileSelect();
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const getAcceptTypes = () => {
    return FILE_LIMITS[type].types.join(',');
  };

  const getIcon = () => {
    if (uploading) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    
    switch (type) {
      case 'image':
        return <FileImage className="h-4 w-4" />;
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'audio':
        return <FileAudio className="h-4 w-4" />;
      default:
        return <Upload className="h-4 w-4" />;
    }
  };

  const getButtonText = () => {
    if (uploading) {
      return `Upload en cours... ${uploadProgress}%`;
    }
    
    const maxSize = FILE_LIMITS[type].maxSize;
    switch (type) {
      case 'image':
        return `Importer une image (max ${maxSize}MB)`;
      case 'pdf':
        return `Uploader un PDF (max ${maxSize}MB)`;
      case 'audio':
        return `Importer un audio (max ${maxSize}MB)`;
      default:
        return 'Importer un fichier';
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptTypes()}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          onClick={triggerFileSelect}
          disabled={disabled || uploading}
          className="flex items-center gap-2"
        >
          {getIcon()}
          {getButtonText()}
        </Button>
        
        {uploading && uploadProgress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
        
        {lastError && !uploading && (
          <div className="space-y-2">
            <p className="text-sm text-red-600">{lastError}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-3 w-3" />
              Réessayer {retryCount > 0 && `(${retryCount})`}
            </Button>
          </div>
        )}
      </div>
      
      <PDFViewer
        isOpen={pdfViewerOpen}
        onClose={() => setPdfViewerOpen(false)}
        pdfDataUrl={pdfDataUrl}
        fileName={pdfFileName}
        onTextExtracted={(text) => {
          onFileImport(text);
          setPdfViewerOpen(false);
        }}
      />
    </>
  );
};
