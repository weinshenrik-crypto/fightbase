import Link from "next/link";

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

export default function Datenschutz() {
  return (
    <div className="max-w-[480px] md:max-w-2xl mx-auto min-h-screen px-5 py-10 font-body text-text">
      <Link href="/" className="text-[13px] text-accentText">
        ← Back to Fightbase
      </Link>
      <h1 className="font-display font-bold text-[26px] mt-4 mb-6">
        Privacy Policy
      </h1>

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
          This website is hosted by Vercel Inc. (USA). When you visit the
          site, Vercel automatically processes technical data (e.g. IP
          address, time of access, page requested) required to operate the
          infrastructure (server log files). More information:{" "}
          <a
            href="https://vercel.com/legal/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accentText"
          >
            Vercel Privacy Policy
          </a>
          .
        </p>
      </Section>

      <Section title="3. Registration, Login &amp; Database (Supabase)">
        <p className="mb-2">
          We use Supabase (Supabase Inc., USA/EU) for registration and
          login. When you register, we store your email address and an
          encrypted password. You can optionally choose a forum username —
          this is shown publicly in the forum instead of your email, which
          stays private.
        </p>
        <p>
          Legal basis: Art. 6(1)(b) GDPR (performance of a contract). More
          information:{" "}
          <a
            href="https://supabase.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accentText"
          >
            Supabase Privacy Policy
          </a>
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
          the login under its own privacy policy. If you would rather not
          share that, register with an email address and a password instead.
          Legal basis: Art. 6(1)(b) GDPR (performance of a contract).
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
          <a
            href="https://resend.com/legal/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accentText"
          >
            Resend Privacy Policy
          </a>
          .
        </p>
      </Section>

      <Section title="6. Reach Measurement (Vercel Analytics)">
        <p className="mb-2">
          We use Vercel Analytics to see how many people visit which pages.
          It works without cookies and without a cross-site identifier: no
          profile is built about you, and you are not tracked onto other
          websites. Vercel derives an anonymous hash per visit from technical
          request data, which cannot be traced back to you and is discarded
          after 24 hours.
        </p>
        <p>
          Legal basis: Art. 6(1)(f) GDPR (legitimate interest in
          understanding which content is used). More information:{" "}
          <a
            href="https://vercel.com/docs/analytics/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accentText"
          >
            Vercel Analytics Privacy
          </a>
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
            Your selected favorite promotions, as long as you are not
            logged in
          </li>
          <li>Your login status (session token), once logged in</li>
          <li>Your chosen UI language and whether you dismissed the cookie notice</li>
        </ul>
        <p className="mt-2">
          This storage is technically necessary for the site&apos;s basic
          functionality (Art. 6(1)(f) GDPR, legitimate interest in
          operating the site). You can delete it at any time via your
          browser settings.
        </p>
      </Section>

      <Section title="8. Forum">
        <p>
          Content you post in the forum (threads, replies) is publicly
          visible to all visitors and linked to your chosen username. You
          can delete your own posts and threads at any time.
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
          To exercise these rights, or to delete your account, simply
          email weinshenrik@gmail.com.
        </p>
      </Section>

      <Section title="10. Right to Complain">
        <p>
          You have the right to lodge a complaint with a data protection
          supervisory authority regarding the processing of your personal
          data, e.g. with the North Rhine-Westphalia data protection
          authority (Landesbeauftragte für Datenschutz und
          Informationsfreiheit NRW, LDI NRW), which is responsible for
          this site.
        </p>
      </Section>

      <Section title="11. Changes">
        <p>
          This privacy policy may be updated as the site evolves. The
          version published on this page always applies.
        </p>
        <p className="mt-2 text-[12px] text-dim">Last updated: September 2026</p>
      </Section>
    </div>
  );
}
