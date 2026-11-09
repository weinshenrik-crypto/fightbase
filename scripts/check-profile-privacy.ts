// Prueft, dass der oeffentliche anon key keine E-Mail-Adressen aus profiles
// lesen kann.
//
//   npx tsx scripts/check-profile-privacy.ts
//
// Anlass: Die Regel aus schema.sql
//
//   create policy "Profiles are viewable by everyone"
//     on profiles for select using (true);
//
// erlaubt jede Spalte jeder Zeile — Row Level Security arbeitet zeilenweise.
// Damit stand `email` der Rolle `anon` offen, also dem Schluessel, der
// bauartbedingt in jedem Browser-Bundle liegt. Am 6. November 2026 liessen
// sich so die Adressen aller elf Konten mit einem Aufruf abrufen, waehrend
// die Oberflaeche "your email stays private" verspricht.
//
// Behoben wird das ueber Spaltenrechte
// (supabase/migration-profiles-email-private.sql). Dieses Skript ist die
// Gegenprobe dazu und der Regressionsschutz: Wer die Rechte spaeter neu setzt
// oder die Tabelle neu anlegt, faellt hier auf.
//
// Ohne Datenbankzugang wird der Test uebersprungen statt zu scheitern — so
// haelt es auch check-promotion-names.ts, damit die CI ohne Secrets durchlaeuft.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let failures = 0;
const check = (label: string, ok: boolean) => {
  if (!ok) { failures++; console.error(`FEHLGESCHLAGEN: ${label}`); }
};

async function ask(columns: string) {
  const res = await fetch(`${url}/rest/v1/profiles?select=${columns}&limit=1`, {
    headers: { apikey: key!, Authorization: `Bearer ${key!}` },
    cache: "no-store",
  });
  return { status: res.status, body: await res.text() };
}

async function main() {
  if (!url || !key) {
    console.log(
      "Hinweis: NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY fehlen — der Test wird uebersprungen."
    );
    return;
  }

  // 1. Die eigentliche Sache: email darf mit dem oeffentlichen Schluessel
  //    nicht lesbar sein. PostgREST antwortet bei fehlendem Spaltenrecht mit
  //    401/403 und einer Meldung, die die Spalte nennt.
  const mail = await ask("email");
  const blocked = mail.status >= 400 || !/@/.test(mail.body);
  check(
    `email ist mit dem anon key nicht lesbar (HTTP ${mail.status})`,
    blocked
  );
  if (!blocked) {
    console.error(
      "  -> supabase/migration-profiles-email-private.sql im SQL-Editor ausfuehren."
    );
  }

  // 2. select=* darf die Adresse ebenfalls nicht durchreichen — sonst waere
  //    die Sperre aus 1. mit einem Sternchen zu umgehen.
  const all = await ask("*");
  check(
    `select=* liefert keine Adressen (HTTP ${all.status})`,
    all.status >= 400 || !/"email":"[^"]*@/.test(all.body)
  );

  // 3. Was das Forum braucht, muss weiter gehen: Autorennamen stehen in
  //    fremden Zeilen und werden ueber profiles(username) eingebunden.
  const name = await ask("id,username");
  check(`username bleibt lesbar (HTTP ${name.status})`, name.status === 200);

  if (failures > 0) {
    console.error(`\n${failures} Pruefung(en) fehlgeschlagen`);
    process.exit(1);
  }
  console.log("ok — alle Pruefungen bestanden");
}
main();
