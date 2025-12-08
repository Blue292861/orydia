import React, { useEffect, useState } from 'react';
import { Gift, X } from 'lucide-react';
import { hasUnclaimedGifts, getAvailableGifts } from '@/services/giftService';
import { AdminGift } from '@/types/Gift';

interface NewGiftNotificationProps {
  onClose?: () => void;
}

const NewGiftNotification: React.FC<NewGiftNotificationProps> = ({ onClose }) => {
  const [visible, setVisible] = useState(false);
  const [gift, setGift] = useState<AdminGift | null>(null);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    checkForGifts();
  }, []);

  useEffect(() => {
    if (!visible) return;

    const duration = 30000; // 30 seconds
    const interval = 100;
    const decrement = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          handleClose();
          return 0;
        }
        return prev - decrement;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [visible]);

  const checkForGifts = async () => {
    try {
      const hasGifts = await hasUnclaimedGifts();
      if (hasGifts) {
        const gifts = await getAvailableGifts();
        if (gifts.length > 0) {
          setGift(gifts[0]);
          setVisible(true);
        }
      }
    } catch (error) {
      console.error('Error checking for gifts:', error);
    }
  };

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  if (!visible || !gift) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div className="bg-gradient-to-br from-amber-900/95 to-orange-950/95 backdrop-blur-sm border border-amber-600/50 rounded-lg shadow-xl max-w-sm overflow-hidden">
        {/* Content */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Gift className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-amber-100">
                🎁 Nouveau cadeau reçu !
              </h4>
              <p className="text-sm text-amber-300 truncate mt-0.5">
                "{gift.title}"
              </p>
              <p className="text-xs text-amber-500 mt-1">
                Rendez-vous dans l'onglet Cadeaux pour le récupérer
              </p>
            </div>
            
            <button
              onClick={handleClose}
              className="flex-shrink-0 text-amber-500 hover:text-amber-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-amber-950">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default NewGiftNotification;
