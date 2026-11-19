"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useStoredLang,
  useIsNativeApp,
  useAppBannerDismissed,
  dismissAppBanner,
} from "@/lib/clientStore";

// Hinweis auf den geschlossenen Android-Test. Zeigt auf /beta, nicht direkt auf
// Google Play: Der Play-Link allein gibt Nichtmitgliedern der Testergruppe nur
// eine Fehlermeldung — die beiden Schritte erklaert die Seite.
//
// Ueberall ausser in der App selbst und auf /beta — auch auf Desktop und
// iPhone, damit Leute den Link an Bekannte mit Android weitergeben. Wie die
// Seite ohne Zahlen (Begruendung in app/beta/page.tsx) und offen darueber, dass
// hier der Entwickler um Hilfe bittet.
//
// Sobald die App in Produktion ist: Text und Ziel auf den Play-Store-Eintrag
// umstellen.

const TEXT = {
  en: {
    body: "The Fightbase Android app is in closed testing — I'm looking for testers to get it into the Play Store.",
    cta: "Become a tester",
    close: "Dismiss",
  },
  de: {
    body: "Die Fightbase-Android-App ist im geschlossenen Test — ich suche Tester, damit sie in den Play Store kommt.",
    cta: "Tester werden",
    close: "Ausblenden",
  },
};

export default function AppBanner() {
  const lang = useStoredLang();
  const native = useIsNativeApp();
  const dismissed = useAppBannerDismissed();
  const pathname = usePathname();

  if (native || dismissed || pathname === "/beta") return null;

  const t = TEXT[lang];

  return (
    <div className="bg-panel border-b border-border px-4 py-3 flex items-center gap-3">
      <p className="flex-1 text-[12px] text-muted leading-snug">
        {t.body}{" "}
        <Link href="/beta" className="text-accentText font-semibold whitespace-nowrap">
          {t.cta} →
        </Link>
      </p>
      <button
        onClick={dismissAppBanner}
        aria-label={t.close}
        className="shrink-0 text-muted text-[20px] leading-none px-2 py-1"
      >
        ×
      </button>
    </div>
  );
}
