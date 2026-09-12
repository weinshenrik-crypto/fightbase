// Prueft getEventBySlug() gegen ein gestubbtes fetch: URL-Bau,
// Slug-Encoding, Zeilen-Mapping und die Fehlerpfade. Der 404-Fall fuer frisch
// eingetragene Events laesst sich sonst nur gegen eine echte Datenbank testen.
//
//   npx tsx scripts/check-event-lookup.ts

process.env.NEXT_PUBLIC_SUPABASE_URL = "https://db.example.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";

import { getEventBySlug, EVENT_LOOKUP_REVALIDATE } from "../lib/eventsDb";

let failures = 0;
const check = (label: string, ok: boolean) => {
  if (!ok) { failures++; console.error(`FEHLGESCHLAGEN: ${label}`); }
};

const ROW = {
  slug: "oktagon-93", date: "2026-09-12", sport: "MMA", promotion: "OKTAGON",
  title: "OKTAGON 93", main: "Roušal vs. Mågård",
  fighter_a: "Roušal", fighter_b: "Mågård",
  venue: "Brno", broadcaster: "DAZN", note: "Hinweis",
  undercard: ["A vs. B"], starts_at: null, timezone: null,
};

let lastUrl = "";
let lastInit: RequestInit | undefined;
function stub(res: { ok: boolean; json?: unknown; throws?: boolean }) {
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    lastUrl = String(url);
    lastInit = init;
    if (res.throws) throw new Error("network down");
    return { ok: res.ok, json: async () => res.json, text: async () => "" };
  }) as unknown as typeof fetch;
}

async function main() {
  // 1. Treffer
  stub({ ok: true, json: [ROW] });
  const hit = await getEventBySlug("oktagon-93");
  check("Treffer wird gemappt", hit?.id === "oktagon-93" && hit?.main === "Roušal vs. Mågård");
  check("Kaempferpaar wird uebernommen", JSON.stringify(hit?.fighters) === '["Roušal","Mågård"]');
  check("Undercard wird uebernommen", JSON.stringify(hit?.undercard) === '["A vs. B"]');
  check("fragt genau eine Zeile ab", lastUrl.includes("slug=eq.oktagon-93") && lastUrl.includes("limit=1"));
  // Regressionsschutz: Mit cache:"no-store" kippt die Detailseite beim
  // On-demand-Rendern von statisch auf dynamisch, und Next beantwortet jeden
  // unbekannten Slug mit 500 statt 404. Der kurze ISR-Cache muss es sein.
  const init = lastInit as { cache?: string; next?: { revalidate?: number; tags?: string[] } };
  check("nicht no-store (sonst 500 statt 404)", init?.cache !== "no-store");
  check("kurzer ISR-Cache statt Vollcache", init?.next?.revalidate === EVENT_LOOKUP_REVALIDATE);
  check("haengt am events-Tag", init?.next?.tags?.includes("events") === true);

  // 2. Slug, der escaped werden muss — darf die Query nicht aufbrechen
  stub({ ok: true, json: [] });
  await getEventBySlug("a&b=c d");
  check("Slug wird URL-kodiert", lastUrl.includes("slug=eq.a%26b%3Dc%20d"));

  // 3. Leeres Ergebnis: echtes 404, kein Fehler
  stub({ ok: true, json: [] });
  check("unbekannter Slug ergibt null", (await getEventBySlug("gibt-es-nicht")) === null);

  // 4. Fehlerpfade duerfen nicht werfen — der Aufrufer soll 404 liefern
  stub({ ok: false, json: null });
  check("HTTP-Fehler ergibt null", (await getEventBySlug("x")) === null);
  stub({ ok: true, throws: true });
  check("Netzwerkfehler ergibt null", (await getEventBySlug("x")) === null);

  // 5. Fehlende Env darf ebenfalls nicht werfen
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  check("fehlende Env ergibt null", (await getEventBySlug("x")) === null);
  process.env.NEXT_PUBLIC_SUPABASE_URL = url;

  if (failures > 0) { console.error(`\n${failures} Pruefung(en) fehlgeschlagen`); process.exit(1); }
  console.log(`ok — alle Pruefungen bestanden`);
}
main();
