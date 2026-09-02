import Link from "next/link";

export const metadata = {
  title: "Datenschutz — Fightbase",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <h2 className="font-semibold text-[15px] mb-1.5 text-text">{title}</h2>
      <div className="text-[14px] text-muted leading-relaxed">{children}</div>
    </section>
  );
}

export default function Datenschutz() {
  return (
    <div className="max-w-[480px] md:max-w-2xl mx-auto min-h-screen px-5 py-10 font-body text-text">
      <Link href="/" className="text-[13px] text-accent">
        ← Back to Fightbase
      </Link>
      <h1 className="font-display font-bold text-[26px] mt-4 mb-6">
        Datenschutzerklärung
      </h1>

      <Section title="1. Verantwortlicher">
        <p>
          Henrik Weins
          <br />
          Friedensstraße 4, 52224 Stolberg (Rhld.), Deutschland
          <br />
          E-Mail: weinshenrik@gmail.com
        </p>
      </Section>

      <Section title="2. Hosting">
        <p>
          Diese Website wird bei Vercel Inc. (USA) gehostet. Beim Aufruf der
          Seite verarbeitet Vercel automatisch technische Daten (u.a.
          IP-Adresse, Zeitpunkt des Zugriffs, aufgerufene Seite), die zum
          Betrieb der Infrastruktur erforderlich sind (Server-Logfiles).
          Weitere Informationen:{" "}
          <a
            href="https://vercel.com/legal/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent"
          >
            Vercel Privacy Policy
          </a>
          .
        </p>
      </Section>

      <Section title="3. Registrierung, Login &amp; Datenbank (Supabase)">
        <p className="mb-2">
          Für Registrierung und Login nutzen wir Supabase (Supabase Inc.,
          USA/EU). Bei der Registrierung werden E-Mail-Adresse und ein
          verschlüsseltes Passwort gespeichert. Optional kannst du einen
          Forum-Usernamen vergeben — dieser wird anstelle deiner E-Mail
          öffentlich im Forum angezeigt, deine E-Mail-Adresse bleibt
          privat.
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Erfüllung des
          Nutzungsvertrags). Weitere Informationen:{" "}
          <a
            href="https://supabase.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent"
          >
            Supabase Privacy Policy
          </a>
          .
        </p>
      </Section>

      <Section title="4. Lokale Speicherung im Browser">
        <p>
          Fightbase speichert folgende Daten lokal in deinem Browser
          (localStorage), nicht auf unseren Servern:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>
            Deine ausgewählten Favoriten (Promotions), solange du nicht
            eingeloggt bist
          </li>
          <li>Dein Anmelde-Status (Session-Token), wenn du eingeloggt bist</li>
          <li>Ob du diesen Cookie-Hinweis bereits bestätigt hast</li>
        </ul>
        <p className="mt-2">
          Diese Speicherung ist für die Grundfunktion der Seite technisch
          notwendig (Art. 6 Abs. 1 lit. f DSGVO, berechtigtes Interesse am
          Betrieb der Seite). Du kannst sie jederzeit über die
          Browser-Einstellungen löschen.
        </p>
      </Section>

      <Section title="5. Forum">
        <p>
          Inhalte, die du im Forum veröffentlichst (Threads, Beiträge), sind
          öffentlich für alle Besucher sichtbar und werden mit deinem
          gewählten Username verknüpft. Du kannst eigene Beiträge und
          Threads jederzeit selbst löschen.
        </p>
      </Section>

      <Section title="6. Deine Rechte">
        <p>Du hast jederzeit das Recht auf:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Auskunft über deine gespeicherten Daten (Art. 15 DSGVO)</li>
          <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
          <li>Löschung deiner Daten (Art. 17 DSGVO)</li>
          <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
        </ul>
        <p className="mt-2">
          Zur Ausübung dieser Rechte oder zur Löschung deines Accounts
          genügt eine E-Mail an weinshenrik@gmail.com.
        </p>
      </Section>

      <Section title="7. Beschwerderecht">
        <p>
          Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde
          über die Verarbeitung deiner personenbezogenen Daten zu
          beschweren, z. B. bei der für Nordrhein-Westfalen zuständigen
          Landesbeauftragten für Datenschutz und Informationsfreiheit
          (LDI NRW).
        </p>
      </Section>

      <Section title="8. Änderungen">
        <p>
          Diese Datenschutzerklärung kann bei Weiterentwicklung der Seite
          angepasst werden. Es gilt jeweils die aktuelle, auf dieser Seite
          veröffentlichte Fassung.
        </p>
        <p className="mt-2 text-[12px] text-dim">Stand: September 2026</p>
      </Section>
    </div>
  );
}
