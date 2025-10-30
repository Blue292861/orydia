import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BannerAd } from '@/components/BannerAd';

export const ChapterBannerAd: React.FC = () => {
  const { subscription } = useAuth();

  // Only show for non-premium users
  if (subscription?.isPremium) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t shadow-sm">
      <div className="container mx-auto px-2 py-0.5">
        <BannerAd />
      </div>
    </div>
  );
};
