import React from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface OrydorsDialogHeaderProps {
  onClose: () => void;
}

export const OrydorsDialogHeader: React.FC<OrydorsDialogHeaderProps> = ({ onClose }) => {
  return (
    <DialogHeader className="relative bg-gradient-to-r from-forest-800 to-forest-900 -mx-6 -mt-6 px-6 py-4 rounded-t-lg border-b-4 border-gold-400">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-gold-300 hover:text-gold-100 transition-colors"
        aria-label="Fermer"
      >
        <X className="h-6 w-6" />
      </button>
      <div className="flex items-center gap-3">
        <img 
          src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" 
          alt="Orydors" 
          className="h-12 w-12"
        />
        <div>
          <DialogTitle className="text-2xl font-medieval text-gold-300">
            Boutique des Orydors
          </DialogTitle>
          <p className="text-sm text-gold-200/80 font-serif">
            Achetez des Orydors pour débloquer du contenu exclusif
          </p>
        </div>
      </div>
    </DialogHeader>
  );
};
