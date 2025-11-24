import React from 'react';
import { OrydorsPack } from '@/types/OrydorsPack';
import { OrydorsPackCard } from './OrydorsPackCard';

interface OrydorsPackGridProps {
  packs: OrydorsPack[];
  loading: string | null;
  onPurchase: (pack: OrydorsPack) => void;
}

export const OrydorsPackGrid: React.FC<OrydorsPackGridProps> = ({
  packs,
  loading,
  onPurchase,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
      {packs.map((pack) => (
        <OrydorsPackCard
          key={pack.id}
          pack={pack}
          loading={loading === pack.id}
          onPurchase={onPurchase}
        />
      ))}
    </div>
  );
};
