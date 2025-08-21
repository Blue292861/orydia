import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileImage, FileText, FileAudio, Loader2, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

const UPLOAD_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY_BASE: 1000, // 1 second
  UPLOAD_TIMEOUT: 45000, // 45 seconds
  CONNECTIVITY_TIMEOUT: 10000 // 10 seconds
};

export const FileImport: React.FC<FileImportProps> = ({ type, onFileImport, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isConnected, setIsConnected] = useState(true);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const checkConnectivity = async (): Promise<boolean> => {
    try {
      setUploadProgress(5);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), UPLOAD_CONFIG.CONNECTIVITY_TIMEOUT);
      
      const response = await fetch(`https://aotzivwzoxmnnawcxioo.supabase.co/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvdHppdnd6b3htbm5hd2N4aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5OTEwODYsImV4cCI6MjA2NTU2NzA4Nn0.n-S4MY36dvh2C8f8hRV3AH98VI5gtu3TN_Szb9G_ZQA'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const connected = response.ok;
      setIsConnected(connected);
      
      return connected;
      
    } catch (error) {
      setIsConnected(false);
      return false;
    }
  };

  const getDetailedErrorMessage = (error: any): string => {
    if (error?.message?.includes('Failed to fetch')) {
      return 'Problème de connexion Internet. Vérifiez votre réseau et réessayez.';
    }
    
    // Fix: Check for status instead of statusCode
    if (error?.status) {
      switch (error.status) {
        case 413:
          return 'Fichier trop volumineux pour le serveur. Réduisez la taille du fichier.';
        case 403:
          return 'Permissions insuffisantes. Contactez l\'administrateur.';
        case 409:
          return 'Un fichier avec ce nom existe déjà. Renommez votre fichier.';
        case 429:
          return 'Trop de tentatives. Attendez quelques minutes avant de réessayer.';
        case 500:
          return 'Erreur serveur temporaire. Réessayez dans quelques instants.';
        case 502:
        case 503:
        case 504:
          return 'Service temporairement indisponible. Réessayez plus tard.';
        default:
          return `Erreur serveur (${error.status}). Réessayez ou contactez le support.`;
      }
    }
    
    if (error?.message?.includes('timeout') || error?.message?.includes('Timeout')) {
      return 'Upload trop lent ou connexion instable. Vérifiez votre réseau.';
    }
    
    if (error?.message?.includes('network') || error?.message?.includes('Network')) {
      return 'Problème de réseau détecté. Vérifiez votre connexion Internet.';
    }
    
    return error?.message || 'Erreur inconnue lors de l\'upload. Réessayez.';
  };

  const uploadWithRetry = async (file: File, fileName: string, attempt: number = 1): Promise<string> => {
    try {
      // Progress: Préparation
      setUploadProgress(10 + (attempt - 1) * 5);
      
      // Vérification de connectivité uniquement au premier essai
      if (attempt === 1) {
        const connected = await checkConnectivity();
        if (!connected) {
          throw new Error('Aucune connexion Internet détectée. Vérifiez votre connexion réseau.');
        }
      }
      
      setUploadProgress(25);
      
      // Configuration de l'upload avec timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, UPLOAD_CONFIG.UPLOAD_TIMEOUT);
      
      setUploadProgress(40);
      
      // Upload vers Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('book-covers')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      clearTimeout(timeoutId);
      setUploadProgress(75);
      
      if (uploadError) {
        throw uploadError;
      }
      
      setUploadProgress(85);
      
      // Récupération de l'URL publique
      const { data: urlData } = supabase.storage
        .from('book-covers')
        .getPublicUrl(fileName);
      
      if (!urlData.publicUrl) {
        throw new Error('Impossible d\'obtenir l\'URL publique du fichier');
      }
      
      setUploadProgress(100);
      
      return urlData.publicUrl;
      
    } catch (error) {
      const errorMessage = getDetailedErrorMessage(error);
      setLastError(errorMessage);
      
      // Logique de retry - éviter les retry sur certaines erreurs
      const isRetryableError = !errorMessage.includes('trop volumineux') && 
                               !errorMessage.includes('Permissions') &&
                               !errorMessage.includes('existe déjà') &&
                               attempt < UPLOAD_CONFIG.MAX_RETRIES;
      
      if (isRetryableError) {
        const delayMs = UPLOAD_CONFIG.RETRY_DELAY_BASE * Math.pow(2, attempt - 1); // Backoff exponentiel
        
        toast({
          title: `Tentative ${attempt} échouée`,
          description: `Nouvel essai dans ${delayMs / 1000} seconde(s)...`,
          variant: "default"
        });
        
        await sleep(delayMs);
        return uploadWithRetry(file, fileName, attempt + 1);
      }
      
      throw new Error(errorMessage);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setLastError(null);
    setRetryCount(0);

    try {
      // Validation du nom de fichier
      if (!validateFileName(file.name)) {
        throw new Error(`Nom de fichier invalide "${file.name}". Évitez les caractères spéciaux et les noms trop longs.`);
      }

      const limits = FILE_LIMITS[type];
      
      // Validation de la taille
      if (!validateFileSize(file, limits.maxSize)) {
        throw new Error(`Fichier trop volumineux: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum autorisé: ${limits.maxSize}MB.`);
      }

      // Validation du type MIME
      if (!validateFileType(file, limits.types)) {
        throw new Error(`Type de fichier non supporté: ${file.type}. Types acceptés: ${limits.types.join(', ')}.`);
      }

      // Validation optionnelle par en-tête (non bloquante)
      try {
        const isValidHeader = await validateMimeTypeByHeader(file, limits.types);
        if (!isValidHeader) {
          toast({
            title: "Avertissement",
            description: "Le format du fichier semble inhabituel, mais l'upload continue.",
            variant: "default"
          });
        }
      } catch (headerError) {
        // Header validation error ignored
      }

      // Traitement selon le type de fichier
      if (type === 'image' || type === 'pdf') {
        // Génération d'un nom unique
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 8);
        const fileName = `${timestamp}-${randomId}.${fileExt}`;
        
        const publicUrl = await uploadWithRetry(file, fileName);
        
        onFileImport(publicUrl);
        
        toast({
          title: "✅ Upload réussi!",
          description: type === 'image' 
            ? "Image sauvegardée sur le serveur." 
            : "PDF sauvegardé sur le serveur.",
          variant: "default"
        });
        
      } else if (type === 'audio') {
        // Audio en base64 (temporaire)
        setUploadProgress(50);
        
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            setUploadProgress(100);
            onFileImport(result);
            toast({
              title: "✅ Audio importé",
              description: "Fichier audio chargé avec succès."
            });
          }
        };
        reader.onerror = () => {
          throw new Error('Impossible de lire le fichier audio.');
        };
        reader.readAsDataURL(file);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setLastError(errorMessage);
      
      toast({
        title: "❌ Échec de l'importation",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      
      // Reset de l'input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    
    if (fileInputRef.current && fileInputRef.current.files && fileInputRef.current.files[0]) {
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
      
      <div className="space-y-3">
        {/* Bouton principal */}
        <Button
          type="button"
          variant="outline"
          onClick={triggerFileSelect}
          disabled={disabled || uploading}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          {getIcon()}
          {getButtonText()}
        </Button>
        
        {/* Indicateur de connectivité */}
        {!isConnected && !uploading && (
          <div className="flex items-center gap-2 text-sm text-orange-600">
            <WifiOff className="h-4 w-4" />
            <span>Connexion Internet instable détectée</span>
          </div>
        )}
        
        {/* Barre de progression */}
        {uploading && uploadProgress > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Upload en cours...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Zone d'erreur et retry */}
        {lastError && !uploading && (
          <div className="space-y-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="text-red-600 text-sm flex-1">
                <strong>Erreur:</strong> {lastError}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
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
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setLastError(null)}
                className="text-gray-500"
              >
                Masquer l'erreur
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
