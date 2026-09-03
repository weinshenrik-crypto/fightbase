"use client";

import { useEffect } from "react";

// No-op on the regular website. Inside the Android/iOS app shell (Capacitor),
// this hides the native splash screen once the page has actually loaded,
// instead of relying on Capacitor's fixed timeout.
export default function NativeAppBridge() {
  useEffect(() => {
    (async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;
        const { SplashScreen } = await import("@capacitor/splash-screen");
        await SplashScreen.hide();
      } catch (e) {
        // Not running inside the native shell, or plugin unavailable — ignore.
      }
    })();
  }, []);

  return null;
}
