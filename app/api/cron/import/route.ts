import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { loadAll, SOURCES } from "@/lib/eventSources";
import { buildPlan, type ExistingRow } from "@/lib/eventSources/plan";

export const dynamic = "force-dynamic";
// Vier fremde Seiten nacheinander abfragen dauert länger als die Vercel-Vorgabe
// von 10 Sekunden.
export const maxDuration = 60;

// Trägt Termine aus den Verbandskalendern nach (IBJJF, IJF, WKF, UWW).
//
// Läuft täglich per Vercel-Cron. Was der Job tut und was nicht:
//
//   - Er legt nur Events an, die es in der Tabelle noch nicht gibt, und
//     aktualisiert nur seine eigenen Zeilen (source = die jeweilige Quelle).
//   - Von Hand gepflegte Zeilen (source IS NULL) fasst er nie an. Steht dort
//     bereits derselbe Termin, meldet er das und legt nichts an.
//   - Er erfindet keine Kämpfe. fighter_a/fighter_b, starts_at und undercard
//     bleiben leer — die Verbandskalender nennen Monate im Voraus weder
//     Paarungen noch Anfangszeiten, und Geratenes hat hier nichts zu suchen.
//
// Trockenlauf ohne Schreibzugriff:
//   curl -H "Authorization: Bearer $CRON_SECRET" \
//        "https://fightbase.io/api/cron/import?dry=1"
//
// Einzelne Quelle:
//   …/api/cron/import?source=ibjjf
//
// Lokal und ausführlicher geht dasselbe über scripts/import-dry-run.ts.

// starts_at und timezone gehören dazu, obwohl der Importer sie nur für ONE
// schreibt: Ohne sie sieht der Abgleich in plan.ts die vorhandene Anfangszeit
// nicht und meldet sie in jedem Lauf als neu.
const COLUMNS =
  "slug,date,sport,promotion,title,main,venue,broadcaster,note,source," +
  "source_key,source_url,starts_at,timezone";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const dry = url.searchParams.get("dry") === "1";
  const only = url.searchParams.getAll("source").filter(Boolean);

  const unknown = only.filter((id) => !SOURCES.some((s) => s.id === id));
  if (unknown.length > 0) {
    return NextResponse.json(
      { error: "unknown_source", unknown, known: SOURCES.map((s) => s.id) },
      { status: 400 }
    );
  }

  const db = supabaseAdmin();
  const { data: existingRows, error: readError } = await db
    .from("events")
    .select(COLUMNS);

  if (readError) {
    // Fehlt eine der Import-Spalten, ist die Migration noch nicht eingespielt.
    const missingColumns = /source/.test(readError.message);
    return NextResponse.json(
      {
        error: missingColumns ? "migration_missing" : "events_query_failed",
        detail: readError.message,
        ...(missingColumns
          ? { hint: "supabase/migration-event-import.sql im SQL-Editor ausführen" }
          : {}),
      },
      { status: 500 }
    );
  }

  const existing = (existingRows ?? []) as unknown as ExistingRow[];
  const results = await loadAll(only);

  const report: Record<string, unknown>[] = [];
  let inserted = 0;
  let updated = 0;
  let wrote = false;

  for (const result of results) {
    if (result.error) {
      // Eine unerreichbare Quelle ist kein Grund, den ganzen Lauf abzubrechen —
      // die anderen drei sollen trotzdem durchlaufen.
      report.push({ source: result.id, error: result.error });
      continue;
    }

    const plan = buildPlan(result.id, result.events, existing);
    const entry: Record<string, unknown> = {
      source: result.id,
      found: result.events.length,
      inserts: plan.inserts.length,
      updates: plan.updates.length,
      unchanged: plan.unchanged,
      notes: plan.notes.map((n) => `${n.title}: ${n.reason}`),
      filtered: result.skipped.map((s) => `${s.count}x ${s.reason}`),
    };

    if (dry) {
      entry.wouldInsert = plan.inserts.map((i) => ({
        slug: i.row.slug,
        date: i.row.date,
        title: i.row.title,
        venue: i.row.venue,
      }));
      entry.wouldUpdate = plan.updates.map((u) => ({
        slug: u.row.slug,
        changes: u.changes.map((c) => `${c.field}: "${c.from}" -> "${c.to}"`),
      }));
      report.push(entry);
      continue;
    }

    if (plan.inserts.length > 0) {
      const rows = plan.inserts.map((i) => i.row);
      const { error } = await db.from("events").insert(rows);
      if (!error) {
        inserted += rows.length;
        wrote = true;
      } else {
        // Ein Stapel, eine verletzte Bedingung — und Postgres bricht den
        // ganzen INSERT ab, keine einzige Zeile kommt an. Deshalb im
        // Fehlerfall noch einmal einzeln: Die gesunden Zeilen landen
        // trotzdem, und der Bericht nennt die eine, die klemmt, statt nur
        // "irgendwas war". Ein Doppeleintrag kann dabei nicht entstehen,
        // `slug` ist unique — eine schon angelegte Zeile faellt mit einer
        // Kollisionsmeldung auf, statt still ein zweites Mal zu erscheinen.
        entry.batchError = error.message;
        const failed: string[] = [];
        let ok = 0;
        for (const row of rows) {
          const single = await db.from("events").insert(row);
          if (single.error) failed.push(`${row.slug}: ${single.error.message}`);
          else ok++;
        }
        inserted += ok;
        if (ok > 0) wrote = true;
        entry.inserts = ok;
        if (failed.length > 0) entry.insertErrors = failed;
      }
    }

    // Einzeln statt als Upsert: Ein Upsert auf slug würde bei einer Umbenennung
    // eine zweite Zeile anlegen, und onConflict auf (source, source_key) kann
    // versehentlich eine fremde Zeile überschreiben. Es sind wenige Zeilen pro
    // Lauf — hier zählt Vorhersagbarkeit mehr als eine gesparte Abfrage.
    const updateErrors: string[] = [];
    for (const u of plan.updates) {
      const { slug, source, source_key, ...fields } = u.row;
      void slug;
      const { error } = await db
        .from("events")
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq("source", source)
        .eq("source_key", source_key);
      if (error) updateErrors.push(`${u.row.slug}: ${error.message}`);
      else {
        updated++;
        wrote = true;
      }
    }
    if (updateErrors.length > 0) entry.updateErrors = updateErrors;

    report.push(entry);
  }

  // Der Kalender liest die Events per ISR mit einer Stunde Vorlauf. Ohne das
  // hier stünden frisch importierte Termine bis zu eine Stunde lang nicht in
  // den Listen.
  if (wrote) revalidateTag("events", { expire: 0 });

  // Der Bericht hatte bisher keinen Empfaenger. Ein Cron-Aufruf wertet die
  // Antwort nicht aus, und Vercel protokolliert nur die Statuszeile — ein Lauf,
  // der nichts anlegte, sah damit genauso aus wie einer, der alles anlegte.
  // Im November 2026 wurde deshalb wochenlang ein Ausfall gesucht, den es nie
  // gab: Die Termine fehlten nicht, sie wurden absichtlich uebersprungen, und
  // niemand konnte das sehen. Seitdem steht das Ergebnis in den
  // Runtime-Logs — `vercel logs --environment production`.
  const summary = report
    .map((r) =>
      r.error
        ? `${String(r.source)}=FEHLER`
        : `${String(r.source)}=+${String(r.inserts)}/~${String(r.updates)}/=${String(r.unchanged)}`
    )
    .join(" ");
  console.log(
    `[import]${dry ? " dry" : ""} inserted=${inserted} updated=${updated} ${summary}`
  );

  // Alles, was schiefging, noch einmal einzeln und als Fehler — damit ein
  // Filter auf Fehlerstufe (`vercel logs --level error`) es findet.
  const problems = report.filter(
    (r) => r.error || r.batchError || r.insertErrors || r.updateErrors
  );
  if (problems.length > 0) {
    console.error(`[import] ${problems.length} Quelle(n) mit Problemen:`, JSON.stringify(problems));
  }

  return NextResponse.json({
    dry,
    inserted,
    updated,
    sources: report,
    at: new Date().toISOString(),
  });
}
