"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export type Lang = "en" | "de";

const BACK = { en: "← Back to Fightbase", de: "← Zurück zu Fightbase" };

/**
 * Rahmen für die drei Rechtsseiten (Impressum, Datenschutz, Nutzungs-
 * bedingungen).
 *
 * Die Seitensprache liegt als Client-State in localStorage unter
 * "fightbase:lang" — dieselbe Stelle, die auch HomeClient benutzt. Die
 * Rechtsseiten sind aber eigene Routen und bekommen davon sonst nichts mit,
 * standen also selbst dann auf Englisch, wenn die Seite auf Deutsch lief.
 *
 * Beide Sprachfassungen kommen als fertige Bäume herein und werden hier nur
 * ausgewählt. Serverseitig wird Englisch gerendert; steht "de" im Speicher,
 * schaltet der erste Effekt um. Das kostet ein Frame — der Alternative, vor
 * dem Mount gar nichts zu rendern, wäre ein leerer Bildschirm, und eine
 * synchrone Auswahl beim ersten Render würde die Hydration zerlegen.
 */
export default function LegalShell({
  en,
  de,
  titleEn,
  titleDe,
}: {
  en: React.ReactNode;
  de: React.ReactNode;
  titleEn: string;
  titleDe: string;
}) {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("fightbase:lang");
      if (stored === "de" || stored === "en") setLang(stored);
    } catch {
      // localStorage kann blockiert sein — dann bleibt es bei Englisch.
    }
  }, []);

  // Ein Screenreader spricht die Texte sonst in der falschen Sprache aus.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  function choose(next: Lang) {
    setLang(next);
    try {
      localStorage.setItem("fightbase:lang", next);
    } catch {
      // Sprache gilt dann nur für diesen Seitenaufruf.
    }
  }

  return (
    <div className="max-w-[480px] md:max-w-2xl mx-auto min-h-screen px-5 py-10 font-body text-text">
      <div className="flex items-center justify-between gap-4 mb-4">
        <Link href="/" className="text-[13px] text-accentText">
          {BACK[lang]}
        </Link>
        <div className="flex gap-1 shrink-0">
          {(["en", "de"] as const).map((l) => (
            <button
              key={l}
              onClick={() => choose(l)}
              aria-pressed={lang === l}
              className={
                lang === l
                  ? "text-[11px] font-semibold px-2 py-1 rounded border border-accent text-text"
                  : "text-[11px] px-2 py-1 rounded border border-border text-faint hover:text-text transition-colors"
              }
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <h1 className="font-display font-bold text-[26px] mb-6">
        {lang === "de" ? titleDe : titleEn}
      </h1>

      {lang === "de" ? de : en}
    </div>
  );
}
