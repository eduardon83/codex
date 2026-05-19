import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'pt.kendirstudios.codex',
  appName: 'Codex',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1E2A22',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
  },
};

export default config;
