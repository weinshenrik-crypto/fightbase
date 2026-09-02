"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem("fightbase:cookie-consent")) {
        setVisible(true);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem("fightbase:cookie-consent", "accepted");
    } catch (e) {
      // ignore
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-panel border-t border-border px-5 py-4 md:flex md:items-center md:justify-between md:gap-6">
      <p className="text-[12px] text-muted leading-relaxed mb-3 md:mb-0">
        Wir speichern nur technisch notwendige Daten in deinem Browser
        (Login-Status, Favoriten) — keine Werbe- oder Tracking-Cookies. Mehr
        dazu in unserer{" "}
        <Link href="/datenschutz" className="text-accent">
          Datenschutzerklärung
        </Link>
        .
      </p>
      <button
        onClick={accept}
        className="w-full md:w-auto shrink-0 bg-accent text-white text-[13px] font-semibold rounded-md px-5 py-2"
      >
        Verstanden
      </button>
    </div>
  );
}
