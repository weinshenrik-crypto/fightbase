import type { CapacitorConfig } from '@capacitor/cli';

// Fightbase is a full Next.js server app (dynamic routes, Supabase auth,
// API routes) rather than a static export, so instead of bundling a local
// build, the native shell loads the live production site directly.
const config: CapacitorConfig = {
  appId: 'io.fightbase.app',
  appName: 'Fightbase',
  webDir: 'out',
  server: {
    url: 'https://fightbase.io',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      backgroundColor: '#0A0A0B',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0A0A0B',
    },
  },
};

export default config;
