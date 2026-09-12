// Registry aller Event-Quellen.
//
// Absichtlich nicht dabei:
//
//   Muay Thai — lässt sich nicht befüllen. Die RWS-Eventseite
//   (rank.rajadamnern.com/events) ist leer, ONE kündigt seine Karten erst
//   kurzfristig an, und die Bangkoker Stadionprogramme werden tagesaktuell
//   angesetzt. Aus Wochenrhythmen Termine hochzurechnen verbietet CLAUDE.md
//   ausdrücklich; die Sport-Landingpage erklärt die Lücke stattdessen offen.
//
//   MMA, Boxen, Kickboxen — hier gibt es keinen Verbandskalender, der die
//   Rolle der IBJJF/IJF/WKF/UWW übernehmen könnte. Diese Karten bleiben
//   Handarbeit, und genau dafür ist die "no fabricated fights"-Zusage da.

import type { EventSource, SourceResult } from "./types";
import { ibjjf } from "./ibjjf";
import { ijf } from "./ijf";
import { wkf } from "./wkf";
import { uww } from "./uww";

export * from "./types";

// Reihenfolge = Reihenfolge im Protokoll. IBJJF zuerst, weil es die
// verlässlichste Quelle ist.
export const SOURCES: EventSource[] = [ibjjf, ijf, wkf, uww];

export function sourceById(id: string): EventSource | null {
  return SOURCES.find((s) => s.id === id) ?? null;
}

/**
 * Alle Quellen abfragen. Eine kaputte Quelle reißt die anderen nicht mit —
 * ihr Ergebnis trägt dann nur `error` und keine Events.
 */
export async function loadAll(only?: string[]): Promise<SourceResult[]> {
  const chosen = only?.length
    ? SOURCES.filter((s) => only.includes(s.id))
    : SOURCES;
  // Nacheinander statt parallel: vier fremde Server gleichzeitig anzufragen
  // spart hier nichts und sieht von außen nach einem Bot aus.
  const out: SourceResult[] = [];
  for (const source of chosen) {
    out.push(await source.load());
  }
  return out;
}
