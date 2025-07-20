
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileImage, FileText, FileAudio } from 'lucide-react';
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
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [pdfDataUrl, setPdfDataUrl] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('File selected:', { 
      name: file.name, 
      type: file.type, 
      size: file.size 
    });

    try {
      // Validate file name with better error messages
      if (!validateFileName(file.name)) {
        console.error('Invalid filename:', file.name);
        toast({
          title: "Nom de fichier invalide",
          description: `Le nom de fichier "${file.name}" contient des caractères non autorisés ou est trop long. Évitez les caractères spéciaux comme < > " | * ? \\ /`,
          variant: "destructive"
        });
        return;
      }

      const limits = FILE_LIMITS[type];
      
      // Validate file size
      if (!validateFileSize(file, limits.maxSize)) {
        console.error('File too large:', file.size);
        toast({
          title: "Fichier trop volumineux",
          description: `Le fichier doit faire moins de ${limits.maxSize}MB. Taille actuelle: ${(file.size / 1024 / 1024).toFixed(1)}MB`,
          variant: "destructive"
        });
        return;
      }

      // Validate file type by MIME type
      if (!validateFileType(file, limits.types)) {
        console.error('Invalid file type:', file.type);
        toast({
          title: "Type de fichier invalide",
          description: `Veuillez sélectionner un fichier ${type} valide. Type détecté: ${file.type}`,
          variant: "destructive"
        });
        return;
      }

      // Validate file type by header (magic bytes) - but be more permissive
      try {
        const isValidHeader = await validateMimeTypeByHeader(file, limits.types);
        if (!isValidHeader) {
          console.warn('File header validation failed, but proceeding:', file.name);
          // Only warn, don't block the import for header validation
          toast({
            title: "Avertissement",
            description: "Le format du fichier ne correspond pas parfaitement à son extension, mais l'importation va continuer.",
            variant: "default"
          });
        }
      } catch (headerError) {
        console.warn('Header validation error:', headerError);
        // Continue with import even if header validation fails
      }

      // Process the file based on type
      if (type === 'image') {
        try {
          // Generate unique filename
          const fileExt = file.name.split('.').pop()?.toLowerCase();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          
          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('book-covers')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            throw new Error(`Upload failed: ${uploadError.message}`);
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('book-covers')
            .getPublicUrl(fileName);

          if (!urlData.publicUrl) {
            throw new Error('Failed to get public URL');
          }

          onFileImport(urlData.publicUrl);
          toast({
            title: "Image uploadée",
            description: "L'image de couverture a été sauvegardée sur le serveur."
          });
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          toast({
            title: "Erreur d'upload",
            description: `Impossible d'uploader l'image: ${uploadError instanceof Error ? uploadError.message : 'Erreur inconnue'}`,
            variant: "destructive"
          });
        }
        
      } else if (type === 'pdf') {
        // For PDF files, directly show the viewer for manual content extraction
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            setPdfDataUrl(result);
            setPdfFileName(file.name);
            setPdfViewerOpen(true);
            toast({
              title: "PDF ouvert",
              description: "Le PDF s'ouvre pour que vous puissiez copier-coller le contenu manuellement."
            });
          }
        };
        reader.onerror = () => {
          toast({
            title: "Erreur de lecture",
            description: "Impossible de lire le fichier PDF.",
            variant: "destructive"
          });
        };
        reader.readAsDataURL(file);
      } else if (type === 'audio') {
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
          toast({
            title: "Erreur de lecture",
            description: "Impossible de lire le fichier audio.",
            variant: "destructive"
          });
        };
        reader.readAsDataURL(file);
      }
      
    } catch (error) {
      console.error('File import error:', error);
      toast({
        title: "Erreur d'importation",
        description: `Échec de l'importation du fichier: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        variant: "destructive"
      });
    }

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const getAcceptTypes = () => {
    return FILE_LIMITS[type].types.join(',');
  };

  const getIcon = () => {
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
    const maxSize = FILE_LIMITS[type].maxSize;
    switch (type) {
      case 'image':
        return `Importer une image (max ${maxSize}MB)`;
      case 'pdf':
        return `Importer un PDF pour saisie manuelle (max ${maxSize}MB)`;
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
      <Button
        type="button"
        variant="outline"
        onClick={triggerFileSelect}
        disabled={disabled}
        className="flex items-center gap-2"
      >
        {getIcon()}
        {getButtonText()}
      </Button>
      
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
