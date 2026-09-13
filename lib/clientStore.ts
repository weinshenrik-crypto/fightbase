"use client";

import { useSyncExternalStore } from "react";

// Zwei Dinge kennt nur der Browser: die gespeicherte Sprache und die Zeitzone
// des Besuchers. Die Seiten sind statisch vorgerendert — würde man beides beim
// ersten Render mitzeichnen, käme es zum Hydration-Mismatch.
//
// Der bisherige Weg dafür war ein useEffect, der nach dem Mount setState ruft.
// Das funktioniert, kostet aber einen zusätzlichen Renderdurchlauf und ist
// genau das Muster, das react-hooks/set-state-in-effect anmerkt.
//
// useSyncExternalStore ist dafür gebaut: React nimmt beim Vorrendern und
// Hydrieren den Server-Snapshot und wechselt danach auf den Client-Snapshot.
// Kein Effekt, kein zusätzlicher Zustand, kein Mismatch.

export type Lang = "en" | "de";

const LANG_KEY = "fightbase:lang";
// Eigenes Event, weil `storage` nur in *anderen* Tabs feuert. Damit ziehen
// Cookie-Banner und Rechtstexte mit, sobald jemand oben die Sprache umschaltet.
const LANG_EVENT = "fightbase:lang-changed";

function readLang(): Lang {
  try {
    const value = localStorage.getItem(LANG_KEY);
    return value === "de" || value === "en" ? value : "en";
  } catch {
    // localStorage kann blockiert sein (strenge Datenschutzeinstellungen) —
    // dann bleibt es bei Englisch.
    return "en";
  }
}

// useSyncExternalStore ruft getSnapshot bei jedem Render auf und vergleicht das
// Ergebnis. Ein gepufferter Wert hält das stabil; ohne ihn läse man bei jedem
// Render erneut aus localStorage.
let langCache: Lang | null = null;

function getLangSnapshot(): Lang {
  if (langCache === null) langCache = readLang();
  return langCache;
}

// Beim Vorrendern und beim Hydrieren gilt die Standardsprache. Erst danach
// wechselt React auf den echten Wert.
const getLangServerSnapshot = (): Lang => "en";

function subscribeLang(onChange: () => void): () => void {
  const handle = () => {
    langCache = readLang();
    onChange();
  };
  window.addEventListener("storage", handle);
  window.addEventListener(LANG_EVENT, handle);
  return () => {
    window.removeEventListener("storage", handle);
    window.removeEventListener(LANG_EVENT, handle);
  };
}

/** Die gespeicherte Sprache. Vor der Hydration immer "en". */
export function useStoredLang(): Lang {
  return useSyncExternalStore(subscribeLang, getLangSnapshot, getLangServerSnapshot);
}

/** Sprache setzen — schreibt sie und benachrichtigt alle Leser. */
export function setStoredLang(next: Lang): void {
  langCache = next;
  try {
    localStorage.setItem(LANG_KEY, next);
  } catch {
    // Nicht speicherbar: Die Umschaltung gilt trotzdem für diese Sitzung.
  }
  window.dispatchEvent(new Event(LANG_EVENT));
}

// ---------------------------------------------------------------------------

const CONSENT_KEY = "fightbase:cookie-consent";
const CONSENT_EVENT = "fightbase:consent-changed";

function readConsent(): boolean {
  try {
    return !!localStorage.getItem(CONSENT_KEY);
  } catch {
    // Nicht lesbar: Dann lieber den Hinweis zeigen, als ihn für immer zu
    // verschlucken.
    return false;
  }
}

let consentCache: boolean | null = null;

function getConsentSnapshot(): boolean {
  if (consentCache === null) consentCache = readConsent();
  return consentCache;
}

// Serverseitig gilt "schon zugestimmt", damit der Hinweis nicht im
// vorgerenderten HTML steht und dann bei jedem wieder aufblitzt. Nach der
// Hydration entscheidet der echte Wert.
const getConsentServerSnapshot = (): boolean => true;

function subscribeConsent(onChange: () => void): () => void {
  const handle = () => {
    consentCache = readConsent();
    onChange();
  };
  window.addEventListener("storage", handle);
  window.addEventListener(CONSENT_EVENT, handle);
  return () => {
    window.removeEventListener("storage", handle);
    window.removeEventListener(CONSENT_EVENT, handle);
  };
}

/** Ob der Cookie-Hinweis schon weggeklickt wurde. Vor der Hydration `true`. */
export function useCookieConsent(): boolean {
  return useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getConsentServerSnapshot
  );
}

/** Zustimmung merken und alle Leser benachrichtigen. */
export function acceptCookies(): void {
  consentCache = true;
  try {
    localStorage.setItem(CONSENT_KEY, "accepted");
  } catch {
    // Nicht speicherbar: Der Hinweis kommt beim nächsten Aufruf wieder.
  }
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

// ---------------------------------------------------------------------------

const neverChanges = () => () => {};

/**
 * Ob React fertig hydriert hat.
 *
 * Für Werte, die es nur im Browser gibt und die sich danach nicht mehr ändern —
 * etwa die Zeitzone des Besuchers. Vor der Hydration `false`, danach `true`,
 * ohne Effekt und ohne eigenen Zustand.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    neverChanges,
    () => true,
    () => false
  );
}
