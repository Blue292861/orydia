// src/utils/adMob.ts

import { AdMob, AdMobRewarded, AdMobBanner, AdMobConfig } from '@capacitor-community/admob';
import { PlatformUtils } from './platformDetection';
import { isPlatform } from '@ionic/react'; // Utilisé ici pour la détection plus robuste dans certains cas


const ADMOB_UNIT_IDS = {
  REWARDED: PlatformUtils.isAndroid() 
    ? "ca-app-pub-7828832970015207/REWARDED_ANDROID_ID" 
    : PlatformUtils.isIOS() 
    ? "ca-app-pub-7828832970015207/REWARDED_IOS_ID" 
    : "test-rewarded-ad-web", // Placeholder pour le web
  BANNER: PlatformUtils.isAndroid() 
    ? "ca-app-pub-7828832970015207/BANNER_ANDROID_ID" 
    : PlatformUtils.isIOS() 
    ? "ca-app-pub-7828832970015207/BANNER_IOS_ID" 
    : "test-banner-ad-web", // Placeholder pour le web
};

// ⚠️ REMPLACER PAR VOTRE VRAI APP ID ADMOB
const ADMOB_APP_ID = PlatformUtils.isAndroid() 
  ? "ca-app-pub-7828832970015207~APP_ANDROID_ID"
  : PlatformUtils.isIOS() 
  ? "ca-app-pub-7828832970015207~APP_IOS_ID"
  : ""; // L'App ID n'est pas utilisé sur le Web (AdSense)

export const initializeAdMob = async () => {
  if (PlatformUtils.isNative()) {
    try {
      await AdMob.initialize({
        appId: ADMOB_APP_ID,
        trackingAuthorizationOptions: {
          // iOS 14+ specific: request user tracking permission if needed
        },
      });
      console.log('AdMob initialized successfully');
    } catch (e) {
      console.error('AdMob initialization failed', e);
    }
  }
};

export const rewardedAdService = {
  unitId: ADMOB_UNIT_IDS.REWARDED,

  load: async () => {
    if (!PlatformUtils.isNative()) return;
    try {
      await AdMob.loadRewardedAd({ adId: rewardedAdService.unitId });
      console.log('Rewarded Ad loaded');
      return true;
    } catch (e) {
      console.error('Failed to load rewarded ad', e);
      return false;
    }
  },

  show: async (onAdCompleted: (reward: { type: string, amount: number }) => void) => {
    if (!PlatformUtils.isNative()) return;
    
    return new Promise<void>((resolve, reject) => {
        // Ajoute un écouteur d'événement pour le cas de succès sécurisé (Reward)
        const listener = AdMob.addListener(AdMobRewarded.adDismissed, async (info) => {
            if (info.rewarded) {
                // 🛑 C'EST LE CALLBACK SÉCURISÉ DÉTERMINE L'ATTRIBUTION DES POINTS
                onAdCompleted({ type: info.rewardType, amount: info.rewardAmount });
            }
            AdMob.removeAllListeners(AdMobRewarded.adDismissed);
            resolve();
        });

        AdMob.showRewardedAd().catch((e) => {
            console.error('Failed to show rewarded ad', e);
            AdMob.removeAllListeners(AdMobRewarded.adDismissed);
            reject(e);
        });
    });
  }
};

export const bannerAdService = {
  unitId: ADMOB_UNIT_IDS.BANNER,

  show: async (position: 'BOTTOM' | 'TOP' = 'BOTTOM') => {
    if (!PlatformUtils.isNative()) return;
    try {
        await AdMob.showBanner({
            adId: bannerAdService.unitId,
            position: position,
            // Taille 'SMART_BANNER' est généralement la meilleure pour les bannières
            adSize: AdMobBanner.SMART_BANNER, 
        });
    } catch (e) {
      console.error('Failed to show banner ad', e);
    }
  },

  hide: async () => {
    if (!PlatformUtils.isNative()) return;
    await AdMob.hideBanner();
  }
};
