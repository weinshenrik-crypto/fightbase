import Link from "next/link";

export const metadata = {
  title: "Terms of Use — Fightbase",
  description:
    "The rules for using Fightbase: what the event data is and is not, forum conduct, accounts and liability.",
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
      {children}
    </section>
  );
}

export default function Terms() {
  return (
    <div className="max-w-[480px] md:max-w-2xl mx-auto min-h-screen px-5 py-10 font-body text-[13px] text-muted leading-relaxed">
      <Link href="/" className="text-[13px] text-accentText">
        ← Back to Fightbase
      </Link>

      <h1 className="font-display font-bold text-[26px] mt-4 mb-6 text-text">
        Terms of Use
      </h1>

      <Section title="1. What Fightbase Is">
        <p>
          Fightbase is a free, privately run calendar of combat sports events.
          It is operated by Henrik Weins as a non-commercial project. There is
          no charge for using it, no subscription and nothing for sale, so
          there is also no payment, cancellation or refund process.
        </p>
      </Section>

      <Section title="2. Event Data Is Information, Not a Guarantee">
        <p className="mb-2">
          Event dates, cards and broadcasters are compiled from the
          promotions&apos; own announcements and are kept as accurate as we
          can. Combat sports schedules change constantly: bouts are
          rearranged, fighters withdraw, cards are postponed and broadcast
          rights move between services, sometimes within days of an event.
        </p>
        <p>
          Treat everything here as a starting point, not as confirmation.
          Before you buy a ticket, book travel or pay for a stream, check the
          promotion&apos;s own website. We accept no liability for costs
          arising from a listing that turned out to be outdated or incorrect.
        </p>
      </Section>

      <Section title="3. No Affiliation With the Promotions">
        <p>
          Fightbase is independent. We are not affiliated with, endorsed by or
          acting on behalf of any promotion, federation or broadcaster listed
          on this site. Their names and event titles are used descriptively,
          to identify the events themselves. All trademarks belong to their
          respective owners. We do not sell tickets and do not link to
          unofficial streams.
        </p>
      </Section>

      <Section title="4. Accounts">
        <p className="mb-2">
          You can use Fightbase without an account. An account is only needed
          for favorites that follow you between devices, email reminders and
          the forum. You are responsible for keeping access to your account
          secure, and for everything posted through it.
        </p>
        <p>
          Register with your own identity or a pseudonym — but not by
          impersonating someone else. You can delete your account at any time
          by emailing us; see the{" "}
          <Link href="/datenschutz" className="text-accentText">
            Privacy Policy
          </Link>
          .
        </p>
      </Section>

      <Section title="5. Forum Rules">
        <p className="mb-2">
          The forum works on one principle: talk about fights, not about each
          other. Specifically, do not post:
        </p>
        <ul className="list-disc pl-5 mb-2 space-y-1">
          <li>
            insults, harassment, threats, or attacks on someone&apos;s origin,
            religion, gender or sexual orientation
          </li>
          <li>
            illegal content, or links to pirated streams and other infringing
            material
          </li>
          <li>advertising, referral links, spam or bot-posted content</li>
          <li>
            other people&apos;s personal data — addresses, phone numbers,
            private messages
          </li>
          <li>
            content you have no right to publish, including copyrighted photos
          </li>
        </ul>
        <p>
          You keep the rights to what you post, and grant us the right to
          display it on Fightbase. You are responsible for your own posts, not
          us — but see the next section for what we do about it.
        </p>
      </Section>

      <Section title="6. Moderation">
        <p>
          We may remove posts, threads or accounts that break these rules,
          usually without prior notice where the content is clearly illegal or
          abusive. If you think something was removed in error, email us and
          we will look at it again. Reports of unlawful content are welcome at
          the address in the{" "}
          <Link href="/impressum" className="text-accentText">
            Legal Notice
          </Link>
          , and are dealt with promptly.
        </p>
      </Section>

      <Section title="7. Availability">
        <p>
          Fightbase is offered as it is, with no promise of uptime. It is a
          side project: it can be unavailable for maintenance, break, or be
          discontinued entirely. Features can change or disappear. If the
          project ends, we will say so on this site beforehand where we
          reasonably can.
        </p>
      </Section>

      <Section title="8. External Links">
        <p>
          We link to promotions, federations and broadcasters. Those sites are
          not ours and we have no influence over their content. Responsibility
          for them lies with their respective operators.
        </p>
      </Section>

      <Section title="9. Liability">
        <p>
          We are liable without limitation for injury to life, body or health,
          and for damage caused intentionally or through gross negligence. For
          slight negligence we are liable only where an obligation essential
          to the purpose of this agreement has been breached, and then only up
          to the damage typically foreseeable for a service of this kind.
          Liability under the German Product Liability Act is unaffected.
        </p>
      </Section>

      <Section title="10. Changes to These Terms">
        <p>
          These terms may be updated as the site develops. The version
          published on this page applies. Substantial changes affecting
          registered users will be announced on the site.
        </p>
      </Section>

      <Section title="11. Applicable Law">
        <p>
          German law applies. If you are a consumer resident in the EU, this
          does not deprive you of the protection of mandatory provisions of
          the law of your country of residence. We are neither obliged nor
          willing to take part in dispute resolution proceedings before a
          consumer arbitration board.
        </p>
      </Section>

      <p className="mt-2 text-[12px] text-dim">Last updated: September 2026</p>
    </div>
  );
}
