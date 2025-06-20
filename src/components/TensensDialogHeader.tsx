
import React from 'react';
import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Coins, ArrowLeft } from 'lucide-react';

interface TensensDialogHeaderProps {
  onClose: () => void;
}

export const TensensDialogHeader: React.FC<TensensDialogHeaderProps> = ({ onClose }) => {
  return (
    <DialogHeader className="text-center relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="absolute left-0 top-0 flex items-center gap-1 text-forest-700 hover:text-forest-900 hover:bg-wood-300/50"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Button>
      <DialogTitle className="flex items-center justify-center gap-3 text-2xl font-medieval text-forest-800">
        <Coins className="h-6 w-6 text-gold-500" />
        Comptoir du Changeur de Monnaie
        <Coins className="h-6 w-6 text-gold-500" />
      </DialogTitle>
      <p className="text-forest-600 font-serif mt-2">
        Échangez vos pièces d'or contre la monnaie sacrée d'Orydia
      </p>
    </DialogHeader>
  );
};
