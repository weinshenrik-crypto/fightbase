"use client";

import { useState } from "react";
import { useIsNativeApp, useStoredLang } from "@/lib/clientStore";
import { googleEventUrl, googleSubscribeUrl, webcalUrl } from "@/lib/ics";
import type { FightEvent } from "@/lib/events";

// Knoepfe, die Events in den Kalender bringen. Zwei Formen:
//
// - EventCalendarButtons: ein einzelnes Event, als Google-Link und als .ics.
// - FeedCalendarButtons: ein Abo (Sportart, Promotion, eigene Favoriten).
//
// Google steht jeweils zuerst: Auf Android gibt es keinen Systemkalender, der
// webcal:// abonniert, und die App ist bisher nur fuer Android da.
//
// In der App fallen .ics und webcal:// weg (useIsNativeApp): Der Google-Link
// geht als Intent nach draussen und funktioniert, die anderen beiden blieben
// in der WebView ohne jede Reaktion.

const SITE_HOST = "fightbase.io";

const STRINGS = {
  en: {
    google: "Add to Google Calendar",
    ics: "Download .ics",
    subGoogle: "Subscribe in Google Calendar",
    subOther: "Subscribe (Apple, Outlook)",
    copy: "Copy link",
    copied: "Copied",
    refreshNote: "Google Calendar refreshes subscriptions about once a day.",
    favTitle: "Your favorites in your calendar",
    favIntro:
      "One private link with every upcoming event that matches your favorites. New ones appear on their own.",
    favButton: "Subscribe to my favorites",
    favLoading: "One moment…",
    favReset: "Reset link",
    favResetNote: "Only reset if you shared the link by mistake — the old one stops working.",
    favSignIn: "Please sign in again.",
    favUnavailable: "Not available yet.",
    favError: "That didn't work. Please try again.",
  },
  de: {
    google: "In Google Kalender",
    ics: "Kalenderdatei (.ics)",
    subGoogle: "In Google Kalender abonnieren",
    subOther: "Abonnieren (Apple, Outlook)",
    copy: "Link kopieren",
    copied: "Kopiert",
    refreshNote: "Google Kalender aktualisiert Abos etwa einmal am Tag.",
    favTitle: "Deine Favoriten im Kalender",
    favIntro:
      "Ein privater Link mit allen kommenden Events, die zu deinen Favoriten passen. Neue kommen von selbst dazu.",
    favButton: "Favoriten im Kalender abonnieren",
    favLoading: "Einen Moment…",
    favReset: "Link zurücksetzen",
    favResetNote: "Nur zurücksetzen, wenn du den Link versehentlich geteilt hast — der alte funktioniert danach nicht mehr.",
    favSignIn: "Bitte melde dich neu an.",
    favUnavailable: "Noch nicht verfügbar.",
    favError: "Das hat nicht geklappt. Bitte versuch es noch einmal.",
  },
} as const;

const primary =
  "text-[13px] font-medium px-3.5 py-2 rounded-md bg-accent text-white";
const secondary =
  "text-[13px] font-medium px-3.5 py-2 rounded-md border border-borderStrong text-text";


const secondaryCompact =
  "text-[12px] font-medium px-2.5 py-1 rounded-md border border-borderStrong text-text";

/** `compact`: die kleinere Form der aufgeklappten Event-Karte. */
export function EventCalendarButtons({
  event,
  compact = false,
}: {
  event: FightEvent;
  compact?: boolean;
}) {
  const L = STRINGS[useStoredLang()];
  const native = useIsNativeApp();
  const cls = compact ? secondaryCompact : secondary;
  return (
    <div className={`flex flex-wrap ${compact ? "gap-1.5" : "gap-2"}`}>
      <a href={googleEventUrl(event)} target="_blank" rel="noopener noreferrer" className={cls}>
        {L.google} ↗
      </a>
      {!native && (
        <a href={`/api/calendar/event/${event.id}.ics`} download className={cls}>
          {L.ics}
        </a>
      )}
    </div>
  );
}

/**
 * `feedPath`: Pfad ohne Host, z.B. "/api/calendar/sport/jiu-jitsu.ics".
 *
 * `personal`: Der Feed traegt einen geheimen Token. Dann kein webcal://
 * (wird meist zu http://, der Token ginge im Klartext raus). Apple und
 * Outlook bleibt "Link kopieren". Google bekommt ohnehin immer https.
 */
export function FeedCalendarButtons({
  feedPath,
  personal = false,
}: {
  feedPath: string;
  personal?: boolean;
}) {
  const L = STRINGS[useStoredLang()];
  const native = useIsNativeApp();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(`https://${SITE_HOST}${feedPath}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Kein Zugriff auf die Zwischenablage (z.B. ohne HTTPS) — dann bleibt
      // nur der Abo-Link selbst.
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <a href={googleSubscribeUrl(feedPath)} target="_blank" rel="noopener noreferrer" className={primary}>
          {L.subGoogle} ↗
        </a>
        {!native && !personal && (
          <a href={webcalUrl(feedPath)} className={secondary}>
            {L.subOther}
          </a>
        )}
        <button type="button" onClick={copy} className={secondary}>
          {copied ? L.copied : L.copy}
        </button>
      </div>
      <p className="text-[12px] text-dim mt-2">{L.refreshNote}</p>
    </div>
  );
}

type FavState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; token: string }
  | { kind: "error"; message: "favSignIn" | "favUnavailable" | "favError" };

/**
 * Das Abo der eigenen Favoriten. Der Token wird erst auf Knopfdruck geholt
 * und nur im Zustand dieser Komponente gehalten, nicht im Browser-Speicher:
 * Er ist ein Schluessel zu den Favoriten des Kontos.
 *
 * `getAccessToken` liefert das Zugangstoken der laufenden Supabase-Sitzung.
 */
export function FavoritesCalendar({
  getAccessToken,
}: {
  getAccessToken: () => Promise<string | undefined>;
}) {
  const L = STRINGS[useStoredLang()];
  const [state, setState] = useState<FavState>({ kind: "idle" });

  async function load(rotate: boolean) {
    setState({ kind: "loading" });
    try {
      const access = await getAccessToken();
      if (!access) {
        setState({ kind: "error", message: "favSignIn" });
        return;
      }
      const res = await fetch(`/api/calendar/token${rotate ? "?rotate=1" : ""}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${access}` },
      });
      const body = (await res.json().catch(() => ({}))) as { token?: unknown };
      if (res.status === 401) setState({ kind: "error", message: "favSignIn" });
      else if (res.status === 503) setState({ kind: "error", message: "favUnavailable" });
      else if (res.ok && typeof body.token === "string" && body.token)
        setState({ kind: "ready", token: body.token });
      else setState({ kind: "error", message: "favError" });
    } catch {
      setState({ kind: "error", message: "favError" });
    }
  }

  return (
    <div>
      <p className="text-[11px] font-semibold text-dim uppercase tracking-wide mb-1.5">
        {L.favTitle}
      </p>
      <p className="text-[12px] text-muted mb-2.5">{L.favIntro}</p>
      {state.kind === "ready" ? (
        <>
          <FeedCalendarButtons feedPath={`/api/calendar/u/${state.token}.ics`} personal />
          <button
            type="button"
            onClick={() => load(true)}
            className="text-[12px] text-dim underline mt-2"
          >
            {L.favReset}
          </button>
          <p className="text-[11px] text-dim mt-1">{L.favResetNote}</p>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => load(false)}
            disabled={state.kind === "loading"}
            className={primary}
          >
            {state.kind === "loading" ? L.favLoading : L.favButton}
          </button>
          {state.kind === "error" && (
            <p className="text-[12px] text-accentText mt-2">{L[state.message]}</p>
          )}
        </>
      )}
    </div>
  );
}
