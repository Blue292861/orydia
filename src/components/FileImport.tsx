
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

export const FileImport: React.FC<FileImportProps> = ({ type, onFileImport, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Validate file name
      if (!validateFileName(file.name)) {
        toast({
          title: "Invalid file name",
          description: "File name contains invalid characters or is too long.",
          variant: "destructive"
        });
        return;
      }

      const limits = FILE_LIMITS[type];
      
      // Validate file size
      if (!validateFileSize(file, limits.maxSize)) {
        toast({
          title: "File too large",
          description: `File must be smaller than ${limits.maxSize}MB.`,
          variant: "destructive"
        });
        return;
      }

      // Validate file type by MIME type
      if (!validateFileType(file, limits.types)) {
        toast({
          title: "Invalid file type",
          description: `Please select a valid ${type} file.`,
          variant: "destructive"
        });
        return;
      }

      // Validate file type by header (magic bytes)
      const isValidHeader = await validateMimeTypeByHeader(file, limits.types);
      if (!isValidHeader) {
        toast({
          title: "Invalid file format",
          description: "The file format doesn't match its extension. This may be a security risk.",
          variant: "destructive"
        });
        return;
      }

      if (type === 'image') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            onFileImport(result);
            toast({
              title: "Image imported",
              description: "Cover image has been uploaded successfully."
            });
          }
        };
        reader.readAsDataURL(file);
      } else if (type === 'pdf') {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            // Sanitize the PDF file name and create a safe placeholder text
            const sanitizedFileName = sanitizeText(file.name);
            const text = `PDF content imported from: ${sanitizedFileName}\n\n[PDF content would be extracted here with a proper PDF parser library]`;
            onFileImport(text);
            toast({
              title: "PDF imported",
              description: "PDF content has been imported. Note: Full text extraction requires a PDF parsing library."
            });
          } catch (error) {
            toast({
              title: "Import failed",
              description: "Failed to import PDF content.",
              variant: "destructive"
            });
          }
        };
        reader.readAsArrayBuffer(file);
      } else if (type === 'audio') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            onFileImport(result);
            toast({
              title: "Audio imported",
              description: "Audio file has been uploaded successfully."
            });
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('File import error:', error);
      toast({
        title: "Import failed",
        description: "Failed to import the file due to a security check.",
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
        return `Import Image (max ${maxSize}MB)`;
      case 'pdf':
        return `Import PDF (max ${maxSize}MB)`;
      case 'audio':
        return `Import Audio (max ${maxSize}MB)`;
      default:
        return 'Import File';
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
