import LegalShell from "@/components/LegalShell";

export const metadata = {
  title: "Privacy Policy — Fightbase",
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

function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accentText"
    >
      {children}
    </a>
  );
}

export default function Datenschutz() {
  const en = (
    <>
      <Section title="1. Data Controller">
        <p>
          Henrik Weins
          <br />
          Friedensstraße 4, 52224 Stolberg (Rhld.), Germany
          <br />
          Email: weinshenrik@gmail.com
        </p>
      </Section>

      <Section title="2. Hosting">
        <p>
          This website is hosted by Vercel Inc. (USA). When you visit the site,
          Vercel automatically processes technical data (e.g. IP address, time
          of access, page requested) required to operate the infrastructure
          (server log files). More information:{" "}
          <Ext href="https://vercel.com/legal/privacy-policy">
            Vercel Privacy Policy
          </Ext>
          .
        </p>
      </Section>

      <Section title="3. Registration, Login &amp; Database (Supabase)">
        <p className="mb-2">
          We use Supabase (Supabase Inc., USA/EU) for registration and login.
          When you register, we store your email address and an encrypted
          password. You can optionally choose a forum username — this is shown
          publicly in the forum instead of your email, which stays private.
        </p>
        <p>
          Legal basis: Art. 6(1)(b) GDPR (performance of a contract). More
          information:{" "}
          <Ext href="https://supabase.com/privacy">Supabase Privacy Policy</Ext>
          .
        </p>
      </Section>

      <Section title="4. Login via Google, GitHub, Discord or Facebook">
        <p className="mb-2">
          Instead of a password you can sign in with an existing account at
          Google, GitHub, Discord or Facebook. If you use this option, the
          provider tells us your email address and confirms the login. We do
          not receive your password, and we do not post anything to those
          accounts.
        </p>
        <p>
          The provider learns that you signed in to Fightbase, and processes
          the login under its own privacy policy. If you would rather not share
          that, register with an email address and a password instead. Legal
          basis: Art. 6(1)(b) GDPR (performance of a contract).
        </p>
      </Section>

      <Section title="5. Email Reminders (Resend)">
        <p className="mb-2">
          If you mark events as favorites while logged in, we send you a
          reminder email before those events. These emails are delivered by
          Resend (Resend, Inc., USA), which processes your email address and
          the content of the message on our behalf.
        </p>
        <p>
          Legal basis: Art. 6(1)(b) GDPR (performance of a contract). You can
          stop the emails at any time by removing your favorites or deleting
          your account. More information:{" "}
          <Ext href="https://resend.com/legal/privacy-policy">
            Resend Privacy Policy
          </Ext>
          .
        </p>
      </Section>

      <Section title="6. Reach Measurement (Vercel Analytics)">
        <p className="mb-2">
          We use Vercel Analytics to see how many people visit which pages. It
          works without cookies and without a cross-site identifier: no profile
          is built about you, and you are not tracked onto other websites.
          Vercel derives an anonymous hash per visit from technical request
          data, which cannot be traced back to you and is discarded after 24
          hours.
        </p>
        <p>
          Legal basis: Art. 6(1)(f) GDPR (legitimate interest in understanding
          which content is used). More information:{" "}
          <Ext href="https://vercel.com/docs/analytics/privacy-policy">
            Vercel Analytics Privacy
          </Ext>
          .
        </p>
      </Section>

      <Section title="7. Local Storage in Your Browser">
        <p>
          Fightbase stores the following data locally in your browser
          (localStorage), not on our servers:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>
            Your selected favorite promotions, as long as you are not logged in
          </li>
          <li>Your login status (session token), once logged in</li>
          <li>
            Your chosen UI language and whether you dismissed the cookie notice
          </li>
        </ul>
        <p className="mt-2">
          This storage is technically necessary for the site&apos;s basic
          functionality (Art. 6(1)(f) GDPR, legitimate interest in operating the
          site). You can delete it at any time via your browser settings.
        </p>
      </Section>

      <Section title="8. Forum">
        <p>
          Content you post in the forum (threads, replies) is publicly visible
          to all visitors and linked to your chosen username. You can delete
          your own posts and threads at any time.
        </p>
      </Section>

      <Section title="9. Your Rights">
        <p>You have the right, at any time, to:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Access your stored data (Art. 15 GDPR)</li>
          <li>Rectify inaccurate data (Art. 16 GDPR)</li>
          <li>Erasure of your data (Art. 17 GDPR)</li>
          <li>Restriction of processing (Art. 18 GDPR)</li>
          <li>Data portability (Art. 20 GDPR)</li>
          <li>Object to processing (Art. 21 GDPR)</li>
        </ul>
        <p className="mt-2">
          To exercise these rights, or to delete your account, simply email
          weinshenrik@gmail.com.
        </p>
      </Section>

      <Section title="10. Right to Complain">
        <p>
          You have the right to lodge a complaint with a data protection
          supervisory authority regarding the processing of your personal data,
          e.g. with the North Rhine-Westphalia data protection authority
          (Landesbeauftragte für Datenschutz und Informationsfreiheit NRW, LDI
          NRW), which is responsible for this site.
        </p>
      </Section>

      <Section title="11. Changes">
        <p>
          This privacy policy may be updated as the site evolves. The version
          published on this page always applies.
        </p>
        <p className="mt-2 text-[12px] text-dim">
          Last updated: September 2026
        </p>
      </Section>
    </>
  );

  const de = (
    <>
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
          Diese Website wird von Vercel Inc. (USA) gehostet. Beim Aufruf der
          Seite verarbeitet Vercel automatisch technische Daten (z. B.
          IP-Adresse, Zeitpunkt des Zugriffs, aufgerufene Seite), die für den
          Betrieb der Infrastruktur erforderlich sind (Server-Logfiles).
          Weitere Informationen:{" "}
          <Ext href="https://vercel.com/legal/privacy-policy">
            Datenschutzerklärung von Vercel
          </Ext>
          .
        </p>
      </Section>

      <Section title="3. Registrierung, Login und Datenbank (Supabase)">
        <p className="mb-2">
          Für Registrierung und Login nutzen wir Supabase (Supabase Inc.,
          USA/EU). Bei der Registrierung speichern wir deine E-Mail-Adresse und
          ein verschlüsseltes Passwort. Optional kannst du einen Benutzernamen
          für das Forum wählen — dieser wird dort öffentlich angezeigt, deine
          E-Mail-Adresse bleibt privat.
        </p>
        <p>
          Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Erfüllung eines
          Vertrags). Weitere Informationen:{" "}
          <Ext href="https://supabase.com/privacy">
            Datenschutzerklärung von Supabase
          </Ext>
          .
        </p>
      </Section>

      <Section title="4. Anmeldung über Google, GitHub, Discord oder Facebook">
        <p className="mb-2">
          Statt eines Passworts kannst du dich mit einem bestehenden Konto bei
          Google, GitHub, Discord oder Facebook anmelden. Nutzt du diese
          Möglichkeit, übermittelt der jeweilige Anbieter uns deine
          E-Mail-Adresse und bestätigt die Anmeldung. Dein Passwort erhalten
          wir nicht, und wir veröffentlichen nichts über diese Konten.
        </p>
        <p>
          Der Anbieter erfährt dabei, dass du dich bei Fightbase angemeldet
          hast, und verarbeitet den Vorgang nach seiner eigenen
          Datenschutzerklärung. Wenn du das nicht möchtest, registriere dich
          stattdessen mit E-Mail-Adresse und Passwort. Rechtsgrundlage: Art. 6
          Abs. 1 lit. b DSGVO (Erfüllung eines Vertrags).
        </p>
      </Section>

      <Section title="5. E-Mail-Erinnerungen (Resend)">
        <p className="mb-2">
          Wenn du als angemeldeter Nutzer Events zu deinen Favoriten hinzufügst,
          senden wir dir vor diesen Events eine Erinnerung per E-Mail. Der
          Versand läuft über Resend (Resend, Inc., USA); dabei werden deine
          E-Mail-Adresse und der Inhalt der Nachricht in unserem Auftrag
          verarbeitet.
        </p>
        <p>
          Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Erfüllung eines
          Vertrags). Du kannst die E-Mails jederzeit beenden, indem du deine
          Favoriten entfernst oder dein Konto löschst. Weitere Informationen:{" "}
          <Ext href="https://resend.com/legal/privacy-policy">
            Datenschutzerklärung von Resend
          </Ext>
          .
        </p>
      </Section>

      <Section title="6. Reichweitenmessung (Vercel Analytics)">
        <p className="mb-2">
          Wir nutzen Vercel Analytics, um zu sehen, wie viele Menschen welche
          Seiten aufrufen. Das funktioniert ohne Cookies und ohne
          seitenübergreifende Kennung: Es wird kein Profil über dich gebildet,
          und du wirst nicht auf andere Websites verfolgt. Vercel bildet pro
          Besuch aus technischen Anfragedaten einen anonymen Hash, der sich
          nicht auf dich zurückführen lässt und nach 24 Stunden verworfen wird.
        </p>
        <p>
          Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse
          daran, zu verstehen, welche Inhalte genutzt werden). Weitere
          Informationen:{" "}
          <Ext href="https://vercel.com/docs/analytics/privacy-policy">
            Datenschutzhinweise zu Vercel Analytics
          </Ext>
          .
        </p>
      </Section>

      <Section title="7. Speicherung in deinem Browser">
        <p>
          Fightbase speichert die folgenden Daten lokal in deinem Browser
          (localStorage), nicht auf unseren Servern:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>
            deine ausgewählten Lieblings-Promotionen, solange du nicht
            angemeldet bist
          </li>
          <li>deinen Anmeldestatus (Session-Token), sobald du angemeldet bist</li>
          <li>
            deine gewählte Sprache und ob du den Cookie-Hinweis weggeklickt
            hast
          </li>
        </ul>
        <p className="mt-2">
          Diese Speicherung ist für die Grundfunktionen der Seite technisch
          erforderlich (Art. 6 Abs. 1 lit. f DSGVO, berechtigtes Interesse am
          Betrieb der Seite). Du kannst sie jederzeit über deine
          Browser-Einstellungen löschen.
        </p>
      </Section>

      <Section title="8. Forum">
        <p>
          Was du im Forum schreibst (Themen, Antworten), ist für alle Besucher
          öffentlich sichtbar und mit deinem gewählten Benutzernamen verknüpft.
          Du kannst eigene Beiträge und Themen jederzeit löschen.
        </p>
      </Section>

      <Section title="9. Deine Rechte">
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
          Um diese Rechte auszuüben oder dein Konto zu löschen, genügt eine
          E-Mail an weinshenrik@gmail.com.
        </p>
      </Section>

      <Section title="10. Beschwerderecht">
        <p>
          Du hast das Recht, dich über die Verarbeitung deiner
          personenbezogenen Daten bei einer Datenschutz-Aufsichtsbehörde zu
          beschweren, etwa bei der für diese Seite zuständigen
          Landesbeauftragten für Datenschutz und Informationsfreiheit
          Nordrhein-Westfalen (LDI NRW).
        </p>
      </Section>

      <Section title="11. Änderungen">
        <p>
          Diese Datenschutzerklärung kann angepasst werden, wenn sich die Seite
          weiterentwickelt. Es gilt jeweils die auf dieser Seite
          veröffentlichte Fassung.
        </p>
        <p className="mt-2 text-[12px] text-dim">Stand: September 2026</p>
      </Section>
    </>
  );

  return (
    <LegalShell
      en={en}
      de={de}
      titleEn="Privacy Policy"
      titleDe="Datenschutzerklärung"
    />
  );
}
