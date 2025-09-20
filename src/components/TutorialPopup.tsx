import React, { useEffect, useState } from 'react';
import { useUserStats } from '@/contexts/UserStatsContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface TutorialPopupProps {
  tutorialId: string;
  title: string;
  description: string;
  onClose?: () => void;
}

export const TutorialPopup: React.FC<TutorialPopupProps> = ({ 
  tutorialId,
  title, 
  description,
  onClose
}) => {
  const { userStats, markTutorialAsSeen } = useUserStats();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!userStats.tutorialsSeen.includes(tutorialId)) {
      setIsOpen(true);
      markTutorialAsSeen(tutorialId);
    }
  }, [userStats.tutorialsSeen, tutorialId, markTutorialAsSeen]);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <DialogDescription className="text-center">
            {description}
          </DialogDescription>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleClose}>
            Compris !
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
