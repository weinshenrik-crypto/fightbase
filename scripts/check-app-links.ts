// Prueft, dass jeder Host aus dem autoVerify-Filter auch wirklich verknuepft ist.
//
// Anlass: Im Manifest standen fightbase.io und www.fightbase.io. Vercel leitet
// www mit 308 um, Googles Pruefdienst folgt dem nicht und meldet
// ERROR_CODE_REDIRECT. Auf Android 11 und aelter reisst ein solcher Host alles
// mit — laut Android-Doku wird die App nur dann Standard-Handler, "if it finds
// a matching Digital Asset Links file for *all* hosts in the manifest". Bei
// minSdk 24 waren die Deep Links dort also komplett tot, und auf dem Emulator
// musste die Verifizierung von Hand erzwungen werden.
//
// Das faellt sonst niemandem auf: Die App startet, die Seite laedt, nur der
// Link geht in den Browser statt in die App.
//
//   npx tsx scripts/check-app-links.ts

import { readFileSync } from "node:fs";

let failures = 0;
const check = (label: string, ok: boolean) => {
  if (!ok) {
    failures++;
    console.error(`FEHLGESCHLAGEN: ${label}`);
  }
};

const MANIFEST = "android/app/src/main/AndroidManifest.xml";

/**
 * Die Hosts aus den Intent-Filtern mit autoVerify="true".
 *
 * Bewusst ohne XML-Bibliothek: Es geht um einen Block in einer Datei, die
 * dieses Projekt selbst pflegt. Kommentare werden vorher entfernt, sonst
 * zaehlte der Hinweis auf www mit, der genau erklaert, warum es dort nicht
 * mehr steht.
 */
export function autoVerifyHosts(manifest: string): string[] {
  const withoutComments = manifest.replace(/<!--[\s\S]*?-->/g, "");
  const hosts: string[] = [];
  const filters = withoutComments.matchAll(
    /<intent-filter[^>]*android:autoVerify="true"[^>]*>([\s\S]*?)<\/intent-filter>/g
  );
  for (const filter of filters) {
    for (const data of filter[1].matchAll(/android:host="([^"]+)"/g)) {
      hosts.push(data[1]);
    }
  }
  return Array.from(new Set(hosts));
}

const manifest = readFileSync(MANIFEST, "utf8");
const hosts = autoVerifyHosts(manifest);

check(`mindestens ein autoVerify-Host im Manifest (${hosts.length} gefunden)`, hosts.length > 0);
console.log(`Hosts im Manifest: ${hosts.join(", ") || "keine"}`);

// Die Erkennung selbst gegen feste Beispiele, damit sie nicht still kaputtgeht.
const SAMPLE = `
  <intent-filter android:autoVerify="true">
    <data android:scheme="https" />
    <data android:host="a.example" />
    <data android:host="b.example" />
  </intent-filter>
  <intent-filter>
    <data android:host="nicht-verifiziert.example" />
  </intent-filter>
`;
const found = autoVerifyHosts(SAMPLE);
check(
  "liest beide Hosts eines autoVerify-Filters",
  found.length === 2 && found.includes("a.example") && found.includes("b.example")
);
check(
  "ignoriert Filter ohne autoVerify",
  !found.includes("nicht-verifiziert.example")
);
check(
  "ignoriert Hosts, die nur im Kommentar stehen",
  autoVerifyHosts(
    `<intent-filter android:autoVerify="true"><!-- <data android:host="alt.example" /> --><data android:host="neu.example" /></intent-filter>`
  ).join() === "neu.example"
);

/** Fragt Googles Pruefdienst — denselben, den Android beim Installieren nutzt. */
async function verify(host: string) {
  const url =
    "https://digitalassetlinks.googleapis.com/v1/statements:list" +
    `?source.web.site=https://${host}` +
    "&relation=delegate_permission/common.handle_all_urls";
  const res = await fetch(url);
  if (!res.ok) return { reachable: false as const };
  const body = (await res.json()) as {
    errorCode?: string[];
    statements?: Array<{ target?: { androidApp?: { packageName?: string } } }>;
  };
  return {
    reachable: true as const,
    errors: body.errorCode ?? [],
    packages: (body.statements ?? [])
      .map((s) => s.target?.androidApp?.packageName)
      .filter(Boolean) as string[],
  };
}

async function main() {
  const pkg = (manifest.match(/applicationId "([^"]+)"/) ?? [])[1] ?? "io.fightbase.app";

  for (const host of hosts) {
    let result;
    try {
      result = await verify(host);
    } catch {
      result = { reachable: false as const };
    }

    if (!result.reachable) {
      // Kein Netz oder der Dienst antwortet nicht — das ist kein Befund ueber
      // die App. Lieber uebergehen als die CI aus dem falschen Grund rot
      // faerben, wie beim Build-Schritt auch.
      console.log(`Hinweis: ${host} konnte nicht geprueft werden (Dienst nicht erreichbar).`);
      continue;
    }

    if (result.errors.length > 0) {
      failures++;
      console.error(`FEHLGESCHLAGEN: ${host} ist nicht verknuepft (${result.errors.join(", ")})`);
      if (result.errors.includes("ERROR_CODE_REDIRECT")) {
        console.error(
          "  Der Host leitet weiter. Googles Dienst folgt dem nicht.\n" +
          "  Entweder den Host aus dem autoVerify-Filter nehmen, oder\n" +
          "  /.well-known/assetlinks.json dort ohne Weiterleitung ausliefern."
        );
      }
      console.error(
        "  Auf Android 11 und aelter reisst ein Host die Verifizierung aller\n" +
        "  anderen mit — die Deep Links waeren dort komplett tot."
      );
      continue;
    }

    check(`${host} ist mit ${pkg} verknuepft`, result.packages.includes(pkg));
  }
}

main().then(() => {
  if (failures > 0) {
    console.error(`\n${failures} Pruefung(en) fehlgeschlagen`);
    process.exit(1);
  }
  console.log("ok — alle Pruefungen bestanden");
});
