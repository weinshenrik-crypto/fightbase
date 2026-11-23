// Sucht frei lizenzierte Fotos fuer Fighter ohne Bild und legt sie so an wie
// die bestehenden: Datei unter public/fighters/, dazu eine SQL-Datei mit
// photo_url und photo_credit.
//
//   npx tsx --env-file=.env.local scripts/find-fighter-photos.ts          # nur anzeigen
//   npx tsx --env-file=.env.local scripts/find-fighter-photos.ts --write  # herunterladen + SQL
//
// Danach die erzeugte supabase/seed-fighter-photos-<datum>.sql im SQL-Editor
// ausfuehren und die Bilder committen.
//
// Warum nur Wikimedia Commons: Fotos echter Kaempfer von Promotions oder
// Agenturen sind tabu (CLAUDE.md, "Nicht tun"). Commons-Fotos mit freier Lizenz
// duerfen verwendet werden, wenn der Urheber genannt wird — genau dafuer gibt
// es photo_credit.
//
// Zwei Regeln, damit kein falsches oder unerlaubtes Bild durchrutscht:
//
// - **Lizenz:** nur Public Domain, CC0, CC BY und CC BY-SA. Alles andere
//   (Fair Use, NC, ND, unklar) wird uebersprungen.
// - **Person:** Sicher ist nur das Bild, das der Wikipedia-Artikel des
//   Fighters selbst zeigt. Treffer aus der freien Commons-Suche koennen eine
//   andere Person mit gleichem Namen sein — sie werden nur angezeigt und mit
//   --write nicht uebernommen, ausser mit --include-search, und dann bitte
//   jedes Bild ansehen, bevor die SQL laeuft.
//
// Aus der Cloud-Umgebung heraus antwortet Wikimedia oft dauerhaft mit 429
// (geteilte IP). Vom eigenen Rechner aus geht es; das Skript wartet bei 429
// trotzdem und versucht es erneut.

import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const WRITE = process.argv.includes("--write");
const INCLUDE_SEARCH = process.argv.includes("--include-search");
const UA = "FightbasePhotoFinder/1.0 (https://fightbase.io)";
const THUMB_WIDTH = 600;

const ALLOWED_LICENSE = /^(public domain|cc0|cc by(-sa)? \d(\.\d)?)/i;

type Fighter = { name: string; bio: string | null; photo_url: string | null };
type Candidate = {
  file: string;
  license: string;
  artist: string;
  thumbUrl: string;
  fromArticle: boolean;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchJson(url: string): Promise<unknown> {
  for (const wait of [1000, 30_000, 120_000, 300_000]) {
    await sleep(wait);
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.status === 429) {
      console.error(`  (Wikimedia bremst, warte …)`);
      continue;
    }
    if (!res.ok) throw new Error(`${res.status} bei ${url}`);
    return res.json();
  }
  throw new Error("Wikimedia antwortet weiter mit 429 — spaeter erneut versuchen.");
}

function api(host: string, params: Record<string, string>) {
  const q = new URLSearchParams({ format: "json", ...params });
  return fetchJson(`https://${host}/w/api.php?${q}`);
}

/** "Daniel Dubois is a British …" → "Daniel Dubois"; Spitznamen in Anfuehrungszeichen fliegen raus. */
export function fullNameFromBio(name: string, bio: string | null): string {
  const m = bio?.match(/^(.+?) is (a|an|the) /);
  if (!m) return name;
  return m[1].replace(/\s*"[^"]*"\s*/g, " ").replace(/\s+/g, " ").trim();
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

async function describe(file: string, fromArticle: boolean): Promise<Candidate | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r: any = await api("commons.wikimedia.org", {
    action: "query",
    titles: `File:${file}`,
    prop: "imageinfo",
    iiprop: "extmetadata|url",
    iiurlwidth: String(THUMB_WIDTH),
  });
  const page = Object.values(r.query?.pages ?? {})[0] as
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { imageinfo?: any[] } | undefined;
  const info = page?.imageinfo?.[0];
  if (!info) return null;
  const md = info.extmetadata ?? {};
  return {
    file,
    license: md.LicenseShortName?.value ?? "",
    artist: stripHtml(md.Artist?.value ?? "") || "Unknown",
    thumbUrl: info.thumburl ?? info.url,
    fromArticle,
  };
}

async function candidatesFor(fullName: string): Promise<Candidate[]> {
  // 1. Das Bild aus dem Wikipedia-Artikel — gehoert sicher zur Person.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wiki: any = await api("en.wikipedia.org", {
    action: "query",
    titles: fullName,
    prop: "pageimages",
    piprop: "name",
    redirects: "1",
  });
  const page = Object.values(wiki.query?.pages ?? {})[0] as { pageimage?: string } | undefined;
  if (page?.pageimage) {
    const c = await describe(page.pageimage, true);
    if (c) return [c];
  }

  // 2. Freie Suche auf Commons — nur Dateien, deren Name den vollen Namen
  // enthaelt. Der Nachname allein holte Stolpersteine ("Holzer") und
  // Strassenschilder ("Rua da Trindade") herein.
  const norm = (s: string) => s.toLowerCase().replace(/[_\s]+/g, " ");
  const wanted = norm(fullName);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const search: any = await api("commons.wikimedia.org", {
    action: "query",
    list: "search",
    srsearch: `${fullName} filetype:bitmap`,
    srnamespace: "6",
    srlimit: "5",
  });
  const files: string[] = (search.query?.search ?? [])
    .map((s: { title: string }) => s.title.replace(/^File:/, ""))
    .filter((f: string) => norm(f).includes(wanted));
  const out: Candidate[] = [];
  for (const f of files.slice(0, 3)) {
    const c = await describe(f, false);
    if (c) out.push(c);
  }
  return out;
}

export function fileSlug(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const sql = (s: string) => `'${s.replace(/'/g, "''")}'`;

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error(
      "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY fehlen.\n" +
        "Aufruf mit: npx tsx --env-file=.env.local scripts/find-fighter-photos.ts"
    );
    process.exit(1);
  }
  const res = await fetch(`${url}/rest/v1/fighters?select=name,bio,photo_url&order=name`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`Supabase: ${res.status} ${await res.text()}`);
  const fighters = ((await res.json()) as Fighter[]).filter((f) => !f.photo_url);
  console.log(`${fighters.length} Fighter ohne Foto.\n`);

  const chosen: { fighter: Fighter; c: Candidate; path: string }[] = [];

  for (const fighter of fighters) {
    const full = fullNameFromBio(fighter.name, fighter.bio);
    const all = await candidatesFor(full);
    const ok = all.filter((c) => ALLOWED_LICENSE.test(c.license));
    const usable = ok.filter((c) => c.fromArticle || INCLUDE_SEARCH);

    console.log(`${fighter.name} (${full})`);
    if (all.length === 0) console.log("  – kein Bild gefunden");
    for (const c of all) {
      const tag = !ALLOWED_LICENSE.test(c.license)
        ? "Lizenz nicht frei, uebersprungen"
        : c.fromArticle
          ? "aus dem Wikipedia-Artikel"
          : "aus der Suche — Person pruefen!";
      console.log(`  ${c.file}  [${c.license}]  ${c.artist}  — ${tag}`);
    }

    if (usable[0]) {
      const ext = (usable[0].thumbUrl.match(/\.(jpe?g|png)(?:$|\?)/i)?.[1] ?? "jpg").toLowerCase();
      chosen.push({ fighter, c: usable[0], path: `/fighters/${fileSlug(fighter.name)}.${ext.replace("jpeg", "jpg")}` });
    }
  }

  console.log(`\n${chosen.length} von ${fighters.length} mit verwendbarem Foto.`);
  if (!WRITE) {
    if (chosen.length) console.log("Mit --write herunterladen und SQL schreiben.");
    return;
  }
  if (chosen.length === 0) return;

  mkdirSync(join("public", "fighters"), { recursive: true });
  const lines = [
    "-- Frei lizenzierte Fotos von Wikimedia Commons, gefunden mit",
    "-- scripts/find-fighter-photos.ts. Vor dem Ausfuehren jedes Bild unter",
    "-- public/fighters/ ansehen: Ist es die richtige Person?",
    "",
  ];
  for (const { fighter, c, path } of chosen) {
    const target = join("public", path);
    if (existsSync(target)) {
      console.log(`${target} existiert schon, nicht ueberschrieben.`);
    } else {
      await sleep(1000);
      const img = await fetch(c.thumbUrl, { headers: { "User-Agent": UA } });
      if (!img.ok) {
        console.error(`Download fehlgeschlagen (${img.status}): ${c.file}`);
        continue;
      }
      writeFileSync(target, Buffer.from(await img.arrayBuffer()));
    }
    const credit = `Photo: ${c.artist}, ${c.license}, via Wikimedia Commons`;
    lines.push(
      `-- Source: commons.wikimedia.org/wiki/File:${c.file.replace(/ /g, "_")} (${c.license}, ${c.artist})`,
      `update fighters set`,
      `  photo_url = ${sql(path)},`,
      `  photo_credit = ${sql(credit)}`,
      `where name = ${sql(fighter.name)};`,
      ""
    );
  }
  const out = join("supabase", `seed-fighter-photos-${new Date().toISOString().slice(0, 10)}.sql`);
  writeFileSync(out, lines.join("\n"));
  console.log(`\nGeschrieben: ${out}`);
}

if (process.argv[1]?.endsWith("find-fighter-photos.ts")) {
  main().catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
}
