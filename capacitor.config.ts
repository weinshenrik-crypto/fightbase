import type { CapacitorConfig } from '@capacitor/cli';

// Fightbase is a full Next.js server app (dynamic routes, Supabase auth,
// API routes) rather than a static export, so instead of bundling a local
// build, the native shell loads the live production site directly.
const config: CapacitorConfig = {
  appId: 'io.fightbase.app',
  appName: 'Fightbase',
  // Not a real web build: the shell loads the live site. This folder only
  // holds the offline page below, because Capacitor expects a webDir with an
  // entry file. It is checked in — `out/` is gitignored and would vanish.
  webDir: 'native-web',
  server: {
    url: 'https://fightbase.io',
    cleartext: false,
    // Shown when the WebView cannot reach the site at all. Without it the app
    // falls back to Chrome's error page, complete with the URL — which looks
    // like a broken app rather than a missing connection.
    errorPath: 'error.html',
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
