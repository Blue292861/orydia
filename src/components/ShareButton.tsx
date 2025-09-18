import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { createShareableBookUrl } from '@/utils/slugUtils';

interface ShareButtonProps {
  author: string;
  title: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showText?: boolean;
  className?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  author,
  title,
  variant = 'ghost',
  size = 'sm',
  showText = false,
  className
}) => {
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click handlers
    
    try {
      const shareUrl = createShareableBookUrl(author, title);
      
      if (navigator.share) {
        await navigator.share({
          title: title,
          text: `Découvrez "${title}" par ${author} sur Orydia`,
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Lien copié !",
          description: "Le lien de partage a été copié dans votre presse-papier",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien de partage",
        variant: "destructive"
      });
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleShare}
      className={className}
    >
      {navigator.share ? <Share2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {showText && (
        <span className="ml-2">
          Partager
        </span>
      )}
    </Button>
  );
};