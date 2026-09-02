import Link from "next/link";

export const metadata = {
  title: "Impressum — Fightbase",
};

export default function Impressum() {
  return (
    <div className="max-w-[480px] md:max-w-2xl mx-auto min-h-screen px-5 py-10 font-body text-text">
      <Link href="/" className="text-[13px] text-accent">
        ← Back to Fightbase
      </Link>
      <h1 className="font-display font-bold text-[26px] mt-4 mb-6">
        Legal Notice (Impressum)
      </h1>

      <h2 className="font-semibold text-[15px] mb-1">
        Information according to § 5 TMG (German Telemedia Act)
      </h2>
      <p className="text-[14px] text-muted leading-relaxed mb-5">
        Henrik Weins
        <br />
        Friedensstraße 4
        <br />
        52224 Stolberg (Rhld.)
        <br />
        Germany
      </p>

      <h2 className="font-semibold text-[15px] mb-1">Contact</h2>
      <p className="text-[14px] text-muted leading-relaxed mb-5">
        Email: weinshenrik@gmail.com
      </p>

      <h2 className="font-semibold text-[15px] mb-1">
        Responsible for content according to § 18 Abs. 2 MStV (German
        Interstate Media Treaty)
      </h2>
      <p className="text-[14px] text-muted leading-relaxed mb-5">
        Henrik Weins (address as above)
      </p>

      <h2 className="font-semibold text-[15px] mb-1">Disclaimer</h2>
      <p className="text-[14px] text-muted leading-relaxed">
        Fightbase is a private, non-commercial project providing an
        overview of combat sports events. Despite careful review of the
        content, we assume no liability for the content of external
        links. The operators of linked pages are solely responsible for
        their content.
      </p>
    </div>
  );
}
