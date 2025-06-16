
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileImage, FileText, FileAudio } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileImportProps {
  type: 'image' | 'pdf' | 'audio';
  onFileImport: (content: string) => void;
  disabled?: boolean;
}

export const FileImport: React.FC<FileImportProps> = ({ type, onFileImport, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (type === 'image') {
        if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
          toast({
            title: "Invalid file type",
            description: "Please select a PNG or JPEG image file.",
            variant: "destructive"
          });
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          onFileImport(result);
          toast({
            title: "Image imported",
            description: "Cover image has been uploaded successfully."
          });
        };
        reader.readAsDataURL(file);
      } else if (type === 'pdf') {
        if (file.type !== 'application/pdf') {
          toast({
            title: "Invalid file type",
            description: "Please select a PDF file.",
            variant: "destructive"
          });
          return;
        }

        // For PDF, we'll extract text content
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            // Simple text extraction - in a real app you'd use a PDF parsing library
            const text = `PDF content imported from: ${file.name}\n\n[PDF content would be extracted here with a proper PDF parser library]`;
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
        if (!file.type.match(/^audio\/(mp3|wav|ogg|m4a|mpeg)$/)) {
          toast({
            title: "Invalid file type",
            description: "Please select an MP3, WAV, OGG, or M4A audio file.",
            variant: "destructive"
          });
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          onFileImport(result);
          toast({
            title: "Audio imported",
            description: "Audio file has been uploaded successfully."
          });
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Failed to import the file.",
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
    switch (type) {
      case 'image':
        return 'image/png,image/jpeg,image/jpg';
      case 'pdf':
        return 'application/pdf';
      case 'audio':
        return 'audio/mp3,audio/wav,audio/ogg,audio/m4a,audio/mpeg';
      default:
        return '';
    }
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
    switch (type) {
      case 'image':
        return 'Import Cover Image';
      case 'pdf':
        return 'Import PDF Content';
      case 'audio':
        return 'Import Audio File';
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
