// Haelt die Offline-Seite der Android-App zusammen.
//
// Anlass: Auf dem Emulator zeigte die App bei abgeschaltetem Netz Chromes
// Fehlerseite statt der eigenen. Ursache war nicht die Seite selbst, sondern
// dass sie gar nicht im Build lag: Capacitor loest server.errorPath zu
// "https://localhost/error.html" auf und liefert das aus
// android/app/src/main/assets/public/ aus — und genau dieser Ordner steht in
// android/.gitignore. Er entsteht erst durch `npx cap sync android`. Ein
// frischer Checkout baut also stillschweigend eine App ohne Offline-Seite.
//
// Der eigentliche Riegel steht in android/app/build.gradle und bricht den
// Build ab. Dieses Skript prueft zwei Dinge, die ohne Netz und ohne Android
// SDK gehen: dass der Riegel noch da ist, und dass die Seite selbst
// eigenstaendig bleibt.
//
//   npx tsx scripts/check-android-offline-page.ts

import { readFileSync, existsSync } from "node:fs";

let failures = 0;
const check = (label: string, ok: boolean) => {
  if (!ok) {
    failures++;
    console.error(`FEHLGESCHLAGEN: ${label}`);
  }
};

// --- 1. Die Seite selbst ---

const PAGE = "native-web/error.html";
check(`${PAGE} existiert`, existsSync(PAGE));
if (existsSync(PAGE)) {
  const html = readFileSync(PAGE, "utf8");
  check("die Seite hat Inhalt", html.length > 500);

  // Sie wird genau dann gebraucht, wenn nichts geladen werden kann. Ein
  // <script src>, ein <link href> auf eine Schrift oder ein <img> von aussen
  // waere zu dem Zeitpunkt nicht erreichbar — die Seite saehe dann selbst
  // kaputt aus. Deshalb: alles inline.
  const externals = [
    ...html.matchAll(/<script[^>]+src=/gi),
    ...html.matchAll(/<link[^>]+href=/gi),
    ...html.matchAll(/<img[^>]+src=/gi),
    ...html.matchAll(/@import/gi),
  ];
  check(
    `keine Ressource von aussen (${externals.length} gefunden)`,
    externals.length === 0
  );

  // Der Knopf muss zurueck auf die Seite fuehren, sonst ist die Seite eine
  // Sackgasse.
  check("der Knopf fuehrt zurueck auf fightbase.io", html.includes("fightbase.io"));

  // Zweisprachig, wie der Rest des Projekts.
  check("Text auf Englisch", html.includes("No connection"));
  check("Text auf Deutsch", html.includes("Keine Verbindung"));
}

// --- 2. Der Riegel im Gradle-Build ---

const GRADLE = "android/app/build.gradle";
check(`${GRADLE} existiert`, existsSync(GRADLE));
if (existsSync(GRADLE)) {
  const gradle = readFileSync(GRADLE, "utf8");

  // Drei Faelle muss er abfangen. Fehlt einer, faellt genau der wieder durch.
  check(
    "Riegel: fehlende capacitor.config.json",
    gradle.includes("capacitor.config.json fehlt im Build")
  );
  check(
    "Riegel: fehlende Offline-Seite",
    gradle.includes("Die Offline-Seite fehlt im Build")
  );
  check(
    "Riegel: veraltete Offline-Seite (Inhaltsvergleich)",
    gradle.includes("source.text != synced.text")
  );
  check(
    "Riegel nennt den Befehl, der es behebt",
    gradle.includes("npx cap sync android")
  );
}

// --- 3. Der Grund, warum es den Riegel braucht ---

const IGNORE = "android/.gitignore";
if (existsSync(IGNORE)) {
  const ignored = readFileSync(IGNORE, "utf8");
  // Sollte Capacitor das eines Tages nicht mehr ignorieren, waere der Riegel
  // ueberfluessig — dann soll das hier auffallen und nicht unbemerkt bleiben.
  check(
    "assets/public ist weiterhin gitignored (sonst ist der Riegel hinfaellig)",
    ignored.includes("app/src/main/assets/public")
  );
}

if (failures > 0) {
  console.error(`\n${failures} Pruefung(en) fehlgeschlagen`);
  process.exit(1);
}
console.log("ok — alle Pruefungen bestanden");
