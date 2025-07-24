import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

interface AgeVerificationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const AgeVerificationDialog: React.FC<AgeVerificationDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            Vérification d'âge
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🔞</div>
            <p className="text-lg font-medium mb-2">
              Pour accéder à ce contenu vous devez être âgé d'au moins 16 ans
            </p>
            <p className="text-sm text-muted-foreground">
              Ce contenu peut contenir des éléments non adaptés aux mineurs.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <Button 
            onClick={onConfirm}
            className="w-full"
          >
            Je certifie être âgé de plus de 16 ans
          </Button>
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="w-full"
          >
            Retour
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};