
import React from 'react';
import { TensensPackCard } from './TensensPackCard';
import { TensensPack } from '@/types/TensensPack';

interface TensensPackGridProps {
  packs: TensensPack[];
  loading: string | null;
  onPurchase: (pack: TensensPack) => void;
}

export const TensensPackGrid: React.FC<TensensPackGridProps> = ({
  packs,
  loading,
  onPurchase,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
      {packs.map((pack) => (
        <TensensPackCard
          key={pack.id}
          pack={pack}
          loading={loading === pack.id}
          onPurchase={onPurchase}
        />
      ))}
    </div>
  );
};
