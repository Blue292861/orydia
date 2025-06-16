
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.orydia.app',
  appName: 'Orydia',
  webDir: 'dist',
  server: {
    url: "https://581e8315-1e97-4bac-8edf-49fb76fd6b4c.lovableproject.com?forceHideBadge=true",
    cleartext: true
  }
};

export default config;
