
import React from 'react';
import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Coins, ArrowLeft } from 'lucide-react';

interface TensensDialogHeaderProps {
  onClose: () => void;
}

export const TensensDialogHeader: React.FC<TensensDialogHeaderProps> = ({ onClose }) => {
  return (
    <DialogHeader className="text-center relative px-10">
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="absolute left-0 top-0 h-7 w-7 text-forest-700 hover:text-forest-900 hover:bg-wood-300/50 p-1"
      >
        <ArrowLeft className="h-3 w-3" />
      </Button>
      <DialogTitle className="flex items-center justify-center gap-2 text-xl font-medieval text-forest-800 px-2">
        <Coins className="h-5 w-5 text-gold-500" />
        <span className="text-center leading-tight">Acheter des Tensens</span>
        <Coins className="h-5 w-5 text-gold-500" />
      </DialogTitle>
      <p className="text-forest-600 font-serif mt-1 text-sm">
        Obtenez des Tensens pour débloquer du contenu premium
      </p>
    </DialogHeader>
  );
};
