
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.orydia.app',
  appName: 'Orydia',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    StatusBar: {
      style: 'dark',
      backgroundColor: '#000000'
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      showSpinner: false
    },
    Keyboard: {
      resize: 'body'
    }
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true
  },
  android: {
    allowMixedContent: true,
    captureInput: true
  }
};

export default config;
