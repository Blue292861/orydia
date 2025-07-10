
import { Capacitor } from '@capacitor/core';

export const PlatformUtils = {
  isNative: () => Capacitor.isNativePlatform(),
  isWeb: () => !Capacitor.isNativePlatform(),
  isAndroid: () => Capacitor.getPlatform() === 'android',
  isIOS: () => Capacitor.getPlatform() === 'ios',
  getPlatform: () => Capacitor.getPlatform(),
  
  // Safe area utilities for different platforms
  getSafeAreaTop: () => {
    if (PlatformUtils.isIOS()) {
      return 'env(safe-area-inset-top, 44px)';
    }
    return '0px';
  },
  
  getSafeAreaBottom: () => {
    if (PlatformUtils.isIOS()) {
      return 'env(safe-area-inset-bottom, 34px)';
    }
    return '0px';
  },
  
  // Platform specific styling
  getPlatformClass: () => {
    const platform = Capacitor.getPlatform();
    return `platform-${platform}`;
  }
};

// Hook for React components
export const usePlatform = () => {
  return {
    isNative: PlatformUtils.isNative(),
    isWeb: PlatformUtils.isWeb(),
    isAndroid: PlatformUtils.isAndroid(),
    isIOS: PlatformUtils.isIOS(),
    platform: PlatformUtils.getPlatform(),
    safeAreaTop: PlatformUtils.getSafeAreaTop(),
    safeAreaBottom: PlatformUtils.getSafeAreaBottom(),
    platformClass: PlatformUtils.getPlatformClass()
  };
};
