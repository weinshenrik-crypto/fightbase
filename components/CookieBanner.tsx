"use client";

import Link from "next/link";
import { useStoredLang, useCookieConsent, acceptCookies } from "@/lib/clientStore";

const TEXT = {
  en: {
    body: "We only store technically necessary data in your browser (login status, favorites) — no advertising or tracking cookies. More in our",
    link: "Privacy Policy",
    accept: "Got it",
  },
  de: {
    body: "Wir speichern nur technisch notwendige Daten in deinem Browser (Login-Status, Favoriten) — keine Werbe- oder Tracking-Cookies. Mehr dazu in unserer",
    link: "Datenschutzerklärung",
    accept: "Verstanden",
  },
};

export default function CookieBanner() {
  // Beides kommt aus localStorage und darf deshalb erst nach der Hydration
  // wirken — sonst weicht das Server-HTML vom Client ab. useSyncExternalStore
  // erledigt genau das; einen Effekt braucht es dafür nicht.
  const lang = useStoredLang();
  const consented = useCookieConsent();
  const visible = !consented;

  function accept() {
    acceptCookies();
  }

  if (!visible) return null;

  const t = TEXT[lang];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-panel border-t border-border px-5 py-4 md:flex md:items-center md:justify-between md:gap-6">
      <p className="text-[12px] text-muted leading-relaxed mb-3 md:mb-0">
        {t.body}{" "}
        <Link href="/datenschutz" className="text-accentText">
          {t.link}
        </Link>
        .
      </p>
      <button
        onClick={accept}
        className="w-full md:w-auto shrink-0 bg-accent text-white text-[13px] font-semibold rounded-md px-5 py-2"
      >
        {t.accept}
      </button>
    </div>
  );
}
