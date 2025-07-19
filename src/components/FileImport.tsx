
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileImage, FileText, FileAudio } from 'lucide-react';
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

// PDF text extraction function
const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    // Dynamic import to avoid bundling issues
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set up worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += `Page ${pageNum}:\n${pageText}\n\n`;
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('PDF extraction error:', error);
    // Fallback to placeholder text if extraction fails
    return `Contenu du PDF: ${sanitizeText(file.name)}\n\n[Le contenu du PDF n'a pas pu être extrait automatiquement. Veuillez copier-coller le texte manuellement si nécessaire.]`;
  }
};

export const FileImport: React.FC<FileImportProps> = ({ type, onFileImport, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            onFileImport(result);
            toast({
              title: "Image importée",
              description: "L'image de couverture a été téléchargée avec succès."
            });
          }
        };
        reader.onerror = () => {
          toast({
            title: "Erreur de lecture",
            description: "Impossible de lire le fichier image.",
            variant: "destructive"
          });
        };
        reader.readAsDataURL(file);
        
      } else if (type === 'pdf') {
        try {
          console.log('Starting PDF text extraction...');
          const text = await extractTextFromPDF(file);
          onFileImport(text);
          toast({
            title: "PDF importé",
            description: `Le contenu du PDF a été extrait avec succès (${text.length} caractères).`
          });
        } catch (pdfError) {
          console.error('PDF processing error:', pdfError);
          // Fallback to basic import
          const sanitizedFileName = sanitizeText(file.name);
          const fallbackText = `Contenu PDF importé: ${sanitizedFileName}\n\n[Erreur lors de l'extraction automatique du texte. Veuillez copier-coller le contenu manuellement.]`;
          onFileImport(fallbackText);
          toast({
            title: "PDF partiellement importé",
            description: "Le fichier a été importé mais le texte n'a pas pu être extrait automatiquement.",
            variant: "destructive"
          });
        }
        
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
        return `Importer un PDF (max ${maxSize}MB)`;
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
    </>
  );
};
