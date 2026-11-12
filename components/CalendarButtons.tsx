"use client";

import { useState } from "react";
import { useStoredLang } from "@/lib/clientStore";
import { googleEventUrl } from "@/lib/ics";
import type { FightEvent } from "@/lib/events";

// Knoepfe, die Events in den Kalender bringen. Zwei Formen:
//
// - EventCalendarButtons: ein einzelnes Event, als Google-Link und als .ics.
// - FeedCalendarButtons: ein Abo (Sportart, Promotion, eigene Favoriten).
//
// Google steht jeweils zuerst: Auf Android gibt es keinen Systemkalender, der
// webcal:// abonniert, und die App ist bisher nur fuer Android da.

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
  },
  de: {
    google: "In Google Kalender",
    ics: "Kalenderdatei (.ics)",
    subGoogle: "In Google Kalender abonnieren",
    subOther: "Abonnieren (Apple, Outlook)",
    copy: "Link kopieren",
    copied: "Kopiert",
    refreshNote: "Google Kalender aktualisiert Abos etwa einmal am Tag.",
  },
} as const;

const primary =
  "text-[13px] font-medium px-3.5 py-2 rounded-md bg-accent text-white";
const secondary =
  "text-[13px] font-medium px-3.5 py-2 rounded-md border border-borderStrong text-text";

export function webcalUrl(path: string): string {
  return `webcal://${SITE_HOST}${path}`;
}

export function googleSubscribeUrl(path: string): string {
  return `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcalUrl(path))}`;
}

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
  const cls = compact ? secondaryCompact : secondary;
  return (
    <div className={`flex flex-wrap ${compact ? "gap-1.5" : "gap-2"}`}>
      <a href={googleEventUrl(event)} target="_blank" rel="noopener noreferrer" className={cls}>
        {L.google} ↗
      </a>
      <a href={`/api/calendar/event/${event.id}.ics`} download className={cls}>
        {L.ics}
      </a>
    </div>
  );
}

/** `feedPath`: Pfad ohne Host, z.B. "/api/calendar/sport/jiu-jitsu.ics". */
export function FeedCalendarButtons({ feedPath }: { feedPath: string }) {
  const L = STRINGS[useStoredLang()];
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
        <a href={webcalUrl(feedPath)} className={secondary}>
          {L.subOther}
        </a>
        <button type="button" onClick={copy} className={secondary}>
          {copied ? L.copied : L.copy}
        </button>
      </div>
      <p className="text-[12px] text-dim mt-2">{L.refreshNote}</p>
    </div>
  );
}
