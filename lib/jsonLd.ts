/**
 * JSON fuer ein <script type="application/ld+json">-Tag — ausbruchssicher.
 *
 * `JSON.stringify` maskiert Anfuehrungszeichen, aber **nicht** "<" und "/".
 * Ein Wert, der "</script>" enthaelt, beendet damit das Tag, und alles
 * dahinter liest der Browser wieder als HTML.
 *
 * Hier ist das keine Theorie. Seit supabase/migration-self-register.sql kann
 * jeder angemeldete Nutzer ein Kaempferprofil anlegen, und dessen `name` und
 * `nickname` landen in app/fighters/[slug]/page.tsx im JSON-LD. Ein Name wie
 *
 *   </script><img src=x onerror=...>
 *
 * waere damit gespeichertes Cross-Site-Scripting auf fightbase.io gewesen —
 * ausgefuehrt im Ursprung der Seite, also mit Zugriff auf die Supabase-Sitzung
 * im localStorage.
 *
 * "<" als < zu schreiben ist gueltiges JSON und aendert den geparsten
 * Wert nicht; "</script>" kann so nicht mehr entstehen. U+2028 und U+2029
 * kommen mit, weil sie in JSON erlaubt sind, in JavaScript aber als
 * Zeilenumbruch gelten.
 */
export function jsonLdHtml(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
