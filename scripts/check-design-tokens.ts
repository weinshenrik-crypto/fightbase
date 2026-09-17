// Prueft das Farb-System statt des Aussehens.
//
// 1. Im JSX duerfen keine rohen Hex-Werte in Tailwinds Arbitrary-Value-Syntax
//    stehen. CLAUDE.md verbietet sie, und genau daran ist der Kontrast zweimal
//    vorbeigelaufen: #5A5A5E lag bei 2.66:1, #4A4A4E bei 2.07:1 — beide unter
//    den 4.5:1, die WCAG AA fuer normalen Text verlangt, waehrend jedes Token
//    im System die Huerde nimmt.
// 2. Jede Farbe, die im Produkt Text traegt, erreicht auf base und auf panel
//    mindestens 4.5:1. Die Werte kommen aus tailwind.config.ts, damit die
//    Pruefung die Konfiguration bewacht und nicht eine Kopie davon.
//
// Markenfarben fremder Anbieter als String ("#4285F4" fuer Google, "#1877F2"
// fuer Facebook) sind erlaubt: sie gehoeren dem Anbieter, nicht diesem Design.
// Sie stehen als SVG-Attribut, nicht in einer Tailwind-Klasse, und fallen
// deshalb nicht unter Pruefung 1.
//
//   npx tsx scripts/check-design-tokens.ts

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import config from "../tailwind.config";

let failures = 0;
const check = (label: string, ok: boolean) => {
  if (!ok) {
    failures++;
    console.error(`FEHLGESCHLAGEN: ${label}`);
  }
};

// --- 1. Keine rohen Hex-Werte in Tailwind-Klassen ---

function tsxFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...tsxFiles(p));
    else if (name.endsWith(".tsx")) out.push(p);
  }
  return out;
}

const offenders: string[] = [];
for (const file of [...tsxFiles("app"), ...tsxFiles("components")]) {
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, i) => {
      const hits = line.match(/\[#[0-9A-Fa-f]{3,8}\]/g);
      if (hits) offenders.push(`${file}:${i + 1}  ${hits.join(" ")}`);
    });
}
check(`keine rohen Hex-Werte in Tailwind-Klassen (${offenders.length} gefunden)`, offenders.length === 0);
for (const o of offenders) console.error(`  ${o}`);

// --- 2. Jede Textfarbe erreicht WCAG AA ---

function luminance(hex: string): number {
  const ch = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = ch.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

function ratio(a: string, b: string): number {
  const la = luminance(a) + 0.05;
  const lb = luminance(b) + 0.05;
  return Math.max(la, lb) / Math.min(la, lb);
}

const colors = (config.theme?.extend?.colors ?? {}) as Record<string, string>;

// Nur Farben, die tatsaechlich Text tragen. Fuer Rahmen und Flaechen gilt
// 4.5:1 nicht — borderStrong steht deshalb bewusst nicht in dieser Liste.
const TEXT_TOKENS = ["text", "muted", "faint", "dim", "accentText"];
const SURFACES: Array<[string, string]> = [
  ["base", colors.base],
  ["panel", colors.panel],
];

for (const name of TEXT_TOKENS) {
  const hex = colors[name];
  check(`Token ${name} existiert in tailwind.config.ts`, typeof hex === "string");
  if (typeof hex !== "string") continue;
  for (const [surface, bg] of SURFACES) {
    const r = ratio(hex, bg);
    check(`${name} (${hex}) auf ${surface}: ${r.toFixed(2)}:1 >= 4.5:1`, r >= 4.5);
  }
}

if (failures > 0) {
  console.error(`\n${failures} Pruefung(en) fehlgeschlagen`);
  process.exit(1);
}
console.log("ok — alle Pruefungen bestanden");
