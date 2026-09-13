"use client";

import { venueTime, localTime, timeDiffers } from "@/lib/events";
import { useHydrated } from "@/lib/clientStore";

/**
 * Startzeit eines Events.
 *
 * Zeigt immer die Ortszeit am Austragungsort — die steht so auf den Tickets und
 * in den Ankündigungen der Veranstalter. Weicht die Zeit des Betrachters davon
 * ab, kommt sie dahinter: eine Karte, die in Tokio um 19:00 beginnt, läuft in
 * Deutschland um 11:00, und genau das ist die Zahl, nach der jemand hier sucht.
 *
 * Die zweite Zeit wird bewusst erst nach der Hydration ergänzt. Die Seiten sind
 * statisch vorgerendert, der Server kennt die Zone des Besuchers also nicht —
 * würde man sie beim ersten Render mitzeichnen, käme es zum Hydration-Mismatch.
 */
export default function EventTime({
  startsAt,
  timezone,
  className = "",
}: {
  startsAt: string;
  timezone?: string;
  className?: string;
}) {
  const hydrated = useHydrated();
  const mine =
    hydrated && timeDiffers(startsAt, timezone) ? localTime(startsAt) : null;

  return (
    <span className={className}>
      {venueTime(startsAt, timezone)}
      {mine && <span className="text-dim"> · {mine} your time</span>}
    </span>
  );
}
