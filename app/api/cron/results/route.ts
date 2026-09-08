import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  fetchWikitext,
  parseBouts,
  titleCandidates,
  type ParsedBout,
} from "@/lib/resultsSource";

export const dynamic = "force-dynamic";

// Trägt Ergebnisse für gelaufene Events nach.
//
// Läuft täglich per Vercel-Cron. Angesehen werden nur Events, die vorbei sind
// und für die noch kein einziges Ergebnis in der Datenbank steht — ein Event
// wird also höchstens einmal erfolgreich befüllt und danach nie wieder
// angefasst. Von Hand eingetragene Ergebnisse überschreibt der Job damit nicht.
//
// Nach hinten begrenzt auf 45 Tage: was länger zurückliegt und bis dahin keinen
// Wikipedia-Artikel hat, bekommt auch keinen mehr, und der Job würde die
// gleichen Events endlos erneut abfragen.
const LOOKBACK_DAYS = 45;

// Wikipedia bittet Bots um Zurückhaltung. Bei einer Handvoll Events pro Lauf
// ist das unkritisch, aber die Pause kostet nichts.
const PAUSE_MS = 300;

type EventRow = { slug: string; title: string; promotion: string; date: string };

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = supabaseAdmin();
  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const since = new Date(today);
  since.setDate(since.getDate() - LOOKBACK_DAYS);

  const { data: candidates, error: eventsError } = await db
    .from("events")
    .select("slug, title, promotion, date")
    .lt("date", iso(today))
    .gte("date", iso(since))
    .order("date", { ascending: false });

  if (eventsError) {
    return NextResponse.json(
      { error: "events_query_failed", detail: eventsError.message },
      { status: 500 }
    );
  }

  // Welche davon haben schon Ergebnisse? Eine Abfrage für alle, statt eine
  // pro Event.
  const slugs = (candidates ?? []).map((e) => e.slug);
  const { data: existing } = await db
    .from("event_results")
    .select("event_slug")
    .in("event_slug", slugs.length > 0 ? slugs : ["__none__"]);
  const alreadyHave = new Set((existing ?? []).map((r) => r.event_slug));

  const todo = (candidates ?? []).filter(
    (e: EventRow) => !alreadyHave.has(e.slug)
  );

  const filled: { slug: string; source: string; bouts: number }[] = [];
  const noSource: string[] = [];

  for (const event of todo as EventRow[]) {
    let bouts: ParsedBout[] = [];
    let usedTitle = "";

    for (const title of titleCandidates(event.title, event.promotion)) {
      const wikitext = await fetchWikitext(title);
      await new Promise((r) => setTimeout(r, PAUSE_MS));
      if (!wikitext) continue;

      const parsed = parseBouts(wikitext);
      if (parsed.length > 0) {
        bouts = parsed;
        usedTitle = title;
        break;
      }
    }

    // Kein Artikel, oder einer, in dem noch "vs." statt "def." steht: dann ist
    // die Karte nicht ausgewertet. Nichts eintragen ist hier die richtige
    // Antwort — die Seite wirbt damit, nichts zu erfinden.
    if (bouts.length === 0) {
      noSource.push(event.slug);
      continue;
    }

    const { error: insertError } = await db.from("event_results").insert(
      bouts.map((b) => ({
        event_slug: event.slug,
        position: b.position,
        bout: b.bout,
        winner: b.winner,
        method: b.method,
        round: b.round,
        end_time: b.end_time,
        note: b.note,
      }))
    );

    if (insertError) {
      noSource.push(`${event.slug} (insert: ${insertError.message})`);
      continue;
    }

    filled.push({ slug: event.slug, source: usedTitle, bouts: bouts.length });
  }

  return NextResponse.json({
    checked: todo.length,
    filled,
    noSource,
    at: new Date().toISOString(),
  });
}
