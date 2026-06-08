import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.promaintenance.app',
  appName: 'ProMaintenance',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#2239f5',
    },
    Network: {
      // Para detectar online/offline en la app
    },
  },
};

export default config;
