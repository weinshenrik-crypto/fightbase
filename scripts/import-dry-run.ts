// Trockenlauf für den Event-Import: holt alles, rechnet den Schreibplan durch
// und schreibt nichts.
//
//   npx tsx scripts/import-dry-run.ts                      # alle Quellen
//   npx tsx scripts/import-dry-run.ts ibjjf wkf            # nur diese
//   npx tsx scripts/import-dry-run.ts --json               # maschinenlesbar
//   npx tsx scripts/import-dry-run.ts --existing snap.json # gegen einen Abzug
//
// Ohne NEXT_PUBLIC_SUPABASE_URL/-ANON_KEY läuft er trotzdem: Der Abgleich
// erfolgt dann gegen eine leere Tabelle, alles erscheint als Neuanlage. Das
// reicht, um Parser und Filter zu beurteilen, sagt aber nichts darüber, was
// gegenüber dem echten Bestand passieren würde.
//
// Bewusst dieselbe buildPlan()-Funktion wie der Cron-Job — ein Trockenlauf mit
// eigener Logik würde das Falsche zeigen.

import { loadAll, SOURCES } from "../lib/eventSources";
import { buildPlan, type ExistingRow, type Plan } from "../lib/eventSources/plan";

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const existingFile = (() => {
  const i = args.indexOf("--existing");
  return i >= 0 ? args[i + 1] : null;
})();
const only = args.filter(
  (a, i) => !a.startsWith("--") && args[i - 1] !== "--existing"
);

const unknown = only.filter((id) => !SOURCES.some((s) => s.id === id));
if (unknown.length > 0) {
  console.error(
    `Unbekannte Quelle(n): ${unknown.join(", ")}. Bekannt: ${SOURCES.map((s) => s.id).join(", ")}`
  );
  process.exit(2);
}

/**
 * Bestehende Events lesen. Nutzt den anon key (nur Lesen) — der Trockenlauf
 * braucht keinen Service-Role-Key, und ohne den kann er auch nichts kaputt
 * machen.
 */
async function loadExisting(): Promise<{ rows: ExistingRow[]; note: string }> {
  // Abzug aus einer Datei — damit sich der Plan auch ohne Datenbankzugang
  // gegen den echten Bestand rechnen lässt.
  if (existingFile) {
    const { readFileSync } = await import("node:fs");
    const rows = JSON.parse(readFileSync(existingFile, "utf8")) as ExistingRow[];
    return { rows, note: `${rows.length} Zeilen aus ${existingFile}` };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return {
      rows: [],
      note: "ohne Datenbank (NEXT_PUBLIC_SUPABASE_URL/-ANON_KEY nicht gesetzt) — alles erscheint als Neuanlage",
    };
  }
  const res = await fetch(
    `${url}/rest/v1/events?select=slug,date,sport,promotion,title,main,venue,broadcaster,note,source,source_key,source_url`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" }
  );
  if (!res.ok) {
    const body = await res.text();
    // Fehlen die Spalten, ist die Migration noch nicht eingespielt.
    if (/source/.test(body)) {
      throw new Error(
        "Die Spalten source/source_key/source_url fehlen. " +
          "supabase/migration-event-import.sql im SQL-Editor ausfuehren."
      );
    }
    throw new Error(`Events konnten nicht gelesen werden (${res.status}): ${body}`);
  }
  const rows = (await res.json()) as ExistingRow[];
  return { rows, note: `${rows.length} Zeilen aus der Datenbank` };
}

function short(s: string, n = 64) {
  return s.length <= n ? s : `${s.slice(0, n - 1)}…`;
}

function printPlan(label: string, plan: Plan) {
  const { inserts, updates, notes, unchanged } = plan;
  console.log(
    `\n${label}: ${inserts.length} neu, ${updates.length} geändert, ` +
      `${unchanged} unverändert${notes.length ? `, ${notes.length} Hinweise` : ""}`
  );

  if (inserts.length > 0) {
    console.log("\n  NEU");
    for (const { row } of inserts) {
      console.log(`    ${row.date}  ${short(row.title)}`);
      console.log(`               ${row.slug}  |  ${short(row.venue, 44)}  |  ${row.main}`);
    }
  }
  if (updates.length > 0) {
    console.log("\n  GEAENDERT");
    for (const u of updates) {
      console.log(`    ${u.row.slug}`);
      for (const c of u.changes) {
        console.log(`      ${c.field}: "${short(c.from, 40)}" -> "${short(c.to, 40)}"`);
      }
    }
  }
  if (notes.length > 0) {
    console.log("\n  HINWEISE");
    for (const n of notes) console.log(`    ${short(n.title, 48)} — ${n.reason}`);
  }
}

async function main() {
  const existing = await loadExisting();
  const results = await loadAll(only);

  if (asJson) {
    const out = results.map((r) => ({
      source: r.id,
      error: r.error,
      skipped: r.skipped,
      plan: buildPlan(r.id, r.events, existing.rows),
    }));
    console.log(JSON.stringify({ existing: existing.note, sources: out }, null, 2));
    return;
  }

  console.log("TROCKENLAUF — es wird nichts geschrieben.");
  console.log(`Bestand: ${existing.note}`);

  let totalNew = 0;
  let totalChanged = 0;
  let failed = 0;

  for (const r of results) {
    if (r.error) {
      failed++;
      console.log(`\n${r.label}: FEHLER — ${r.error}`);
      continue;
    }
    const plan = buildPlan(r.id, r.events, existing.rows);
    totalNew += plan.inserts.length;
    totalChanged += plan.updates.length;
    printPlan(r.label, plan);

    if (r.skipped.length > 0) {
      console.log("\n  NICHT UEBERNOMMEN (aus der Quelle gefiltert)");
      for (const s of r.skipped) {
        console.log(`    ${String(s.count).padStart(4)}x  ${s.reason}`);
        for (const ex of s.sample) console.log(`          z.B. ${short(ex, 60)}`);
      }
    }
  }

  console.log(
    `\n----\nInsgesamt: ${totalNew} neue Events, ${totalChanged} Aenderungen` +
      (failed > 0 ? `, ${failed} Quelle(n) nicht erreichbar` : "")
  );
  console.log("Nichts davon wurde geschrieben.");
}

main().catch((e) => {
  console.error(`Trockenlauf abgebrochen: ${(e as Error).message}`);
  process.exit(1);
});
