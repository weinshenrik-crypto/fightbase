// Prueft, dass kein JSON-LD-Block roh in ein <script>-Tag geschrieben wird.
//
//   npx tsx scripts/check-jsonld-escaping.ts
//
// Anlass: `JSON.stringify` maskiert Anfuehrungszeichen, aber nicht "<".
// Ein Wert, der "</script>" enthaelt, beendet damit das Tag — alles dahinter
// liest der Browser als HTML. Kaempferprofile legt seit
// migration-self-register.sql jeder angemeldete Nutzer selbst an, und `name`
// und `nickname` landen im JSON-LD von app/fighters/[slug]/page.tsx. Das war
// gespeichertes Cross-Site-Scripting im Ursprung der Seite, also mit Zugriff
// auf die Supabase-Sitzung im localStorage.
//
// Zwei Pruefungen: der Helfer selbst, und dass ihn auch alle benutzen.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { jsonLdHtml } from "../lib/jsonLd";

let failures = 0;
const check = (label: string, ok: boolean) => {
  if (!ok) { failures++; console.error(`FEHLGESCHLAGEN: ${label}`); }
};

// 1. Der Helfer macht ein </script> unschaedlich und bleibt gueltiges JSON.
{
  const boese = { name: '</script><img src=x onerror=alert(1)>' };
  const out = jsonLdHtml(boese);
  check("kein </script> mehr im Ergebnis", !/<\/script/i.test(out));
  check("ueberhaupt kein rohes '<'", !out.includes("<"));
  check(
    "der geparste Wert bleibt unveraendert",
    JSON.parse(out).name === boese.name
  );
  check(
    "U+2028 wird maskiert",
    !jsonLdHtml({ a: "x y" }).includes(" ")
  );
  check("normale Daten bleiben lesbar", JSON.parse(jsonLdHtml({ a: 1 })).a === 1);
}

// 2. Niemand schreibt mehr roh in ein Script-Tag.
{
  const roots = ["app", "components", "lib"];
  const offenders: string[] = [];
  const walk = (dir: string) => {
    for (const e of readdirSync(dir)) {
      const p = join(dir, e);
      if (statSync(p).isDirectory()) { walk(p); continue; }
      if (!/\.(tsx?|jsx?)$/.test(e)) continue;
      const src = readFileSync(p, "utf8");
      // __html: JSON.stringify(...) — genau das Muster, das die Luecke war.
      if (/__html:\s*JSON\.stringify\(/.test(src)) offenders.push(p);
    }
  };
  for (const r of roots) walk(r);
  check(
    `kein "__html: JSON.stringify(" mehr (gefunden: ${offenders.join(", ") || "keine"})`,
    offenders.length === 0
  );
}

if (failures > 0) {
  console.error(`\n${failures} Pruefung(en) fehlgeschlagen`);
  process.exit(1);
}
console.log("ok — alle Pruefungen bestanden");
