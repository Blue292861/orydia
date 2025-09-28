// AdMob utility functions disabled to prevent build errors
// This will be re-enabled when Capacitor dependencies are properly configured

export const initializeAdMob = async (): Promise<void> => {
  console.log('AdMob initialization disabled in web mode');
};

export const showBannerAd = async (position?: string): Promise<void> => {
  console.log('Banner ad disabled in web mode');
};

export const showInterstitialAd = async (): Promise<void> => {
  console.log('Interstitial ad disabled in web mode');
};

export const showRewardedAd = async (): Promise<boolean> => {
  console.log('Rewarded ad disabled in web mode');
  return false;
};

export const rewardedAdService = {
  unitId: 'disabled',
  load: async () => false,
  show: async (callback?: any) => {
    console.log('Rewarded ad show disabled in web mode');
  }
};

export const bannerAdService = {
  unitId: 'disabled', 
  show: async (position?: string) => {
    console.log('Banner ad show disabled in web mode');
  },
  hide: async () => {
    console.log('Banner ad hide disabled in web mode');
  }
};
