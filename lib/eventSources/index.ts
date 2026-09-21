// Registry aller Event-Quellen.
//
// Hier stand lange, Muay Thai lasse sich nicht befüllen: Die RWS-Eventseite
// sei leer, ONE kündige kurzfristig an, die Bangkoker Stadionprogramme würden
// tagesaktuell angesetzt. Das war falsch, und zwar aus zwei Gründen. Geprüft
// worden war rank.rajadamnern.com — die Ranglisten-Subdomain, nicht ein
// Kalender. Und ONE veröffentlicht seine Lumpinee-Karten drei Monate im
// Voraus; sie stehen nur nicht im HTML, weil die Events-Seite JS-gerendert
// ist. Über Sitemap und ld+json sind sie lesbar (siehe one.ts).
//
// Absichtlich nicht dabei:
//
//   Boxen — kein Verbandskalender, der die Rolle der IBJJF/IJF/WKF/UWW
//   übernehmen könnte, und die großen Karten entstehen ohnehin
//   verhandlungsweise. Bleibt Handarbeit, und genau dafür ist die
//   "no fabricated fights"-Zusage da.
//
//   IFMA und WAKO — die Weltverbände für Muay Thai und Kickboxen. Beide
//   liefern sauber lesbare Daten (IFMA sogar per REST-API), führen aber nur
//   je drei Termine, davon einen im Nachwuchsbereich. Zwei nutzbare Einträge
//   rechtfertigen den täglichen Abruf nicht; wenn die Kalender wachsen, ist
//   der Weg dorthin kurz.

import type { EventSource, SourceResult } from "./types";
import { ibjjf } from "./ibjjf";
import { ijf } from "./ijf";
import { wkf } from "./wkf";
import { uww } from "./uww";
import { one } from "./one";

export * from "./types";

// Reihenfolge = Reihenfolge im Protokoll. IBJJF zuerst, weil es die
// verlässlichste Quelle ist. ONE zuletzt, weil es als einzige Quelle viele
// Einzelseiten holt und damit den Großteil der Laufzeit ausmacht — steht sie
// hinten, sind die vier schnellen Quellen schon durch, wenn das Zeitbudget
// der Route knapp wird.
export const SOURCES: EventSource[] = [ibjjf, ijf, wkf, uww, one];

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
