import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Gift, Clock, Mail, MailOpen } from 'lucide-react';
import { getAvailableGifts } from '@/services/giftService';
import { AdminGift } from '@/types/Gift';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import GiftDetailDialog from './GiftDetailDialog';

interface GiftsTabProps {
  onGiftClaimed?: () => void;
}

const GiftsTab: React.FC<GiftsTabProps> = ({ onGiftClaimed }) => {
  const [gifts, setGifts] = useState<AdminGift[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGift, setSelectedGift] = useState<AdminGift | null>(null);

  useEffect(() => {
    loadGifts();
  }, []);

  const loadGifts = async () => {
    try {
      setLoading(true);
      const data = await getAvailableGifts();
      setGifts(data);
    } catch (error) {
      console.error('Error loading gifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGiftClaimed = (giftId: string) => {
    setGifts(gifts.filter(g => g.id !== giftId));
    setSelectedGift(null);
    onGiftClaimed?.();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Gift className="w-5 h-5 text-amber-400" />
        <h2 className="text-xl font-semibold text-amber-100">Mes Cadeaux</h2>
        {gifts.length > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
            {gifts.length}
          </span>
        )}
      </div>

      {gifts.length === 0 ? (
        <Card className="bg-amber-950/20 border-amber-700/30">
          <CardContent className="py-12 text-center">
            <MailOpen className="w-12 h-12 mx-auto mb-4 text-amber-700/50" />
            <p className="text-amber-400">Aucun cadeau en attente</p>
            <p className="text-sm text-amber-600 mt-1">
              Vos cadeaux apparaîtront ici lorsque vous en recevrez
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {gifts.map((gift) => (
            <Card 
              key={gift.id}
              className="bg-amber-950/30 border-amber-700/30 hover:border-amber-500/50 transition-colors cursor-pointer"
              onClick={() => setSelectedGift(gift)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-amber-600/20 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-amber-400" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-amber-100 truncate">
                      {gift.title}
                    </h3>
                    <p className="text-sm text-amber-400 truncate">
                      {gift.message.substring(0, 50)}...
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0 text-right">
                    <div className="flex items-center gap-1 text-xs text-amber-500">
                      <Clock className="w-3 h-3" />
                      <span>
                        Expire le {format(new Date(gift.expires_at), 'dd MMM', { locale: fr })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedGift && (
        <GiftDetailDialog
          gift={selectedGift}
          open={!!selectedGift}
          onClose={() => setSelectedGift(null)}
          onClaimed={() => handleGiftClaimed(selectedGift.id)}
        />
      )}
    </div>
  );
};

export default GiftsTab;
