"use client";

import Link from "next/link";
import { useState } from "react";
import { useStoredLang, setStoredLang, type Lang } from "@/lib/clientStore";

export type SocialPost = {
  slug: string;
  date: string;
  title: string;
  promotion: string;
  sport: string;
  captions: Record<Lang, string>;
};

type Weekend = { from: string; to: string; count: number; captions: Record<Lang, string> };

const STRINGS = {
  en: {
    heading: "Social posts",
    intro:
      "Images and captions for Instagram and TikTok, straight from the events table. Download the image, copy the text, post. Music on TikTok has to be added in the app.",
    back: "← Back to Fightbase",
    postLang: "Post language",
    weekend: "This weekend",
    weekendHint: "Feed post / carousel, 1080 × 1350.",
    events: (n: number) => `${n} event${n === 1 ? "" : "s"}`,
    highlights: "Fights with an announced pairing",
    highlightsHint: (d: number) => `Next ${d} days. Story, Reel and TikTok, 1080 × 1920 — one post each.`,
    noHighlights: "No announced pairings in this period.",
    others: "Other events",
    othersHint:
      "Tournaments and cards without a pairing. Better kept to the weekend post — one post per tournament reads as spam.",
    image: "Open image",
    copy: "Copy caption",
    copied: "Copied",
  },
  de: {
    heading: "Social-Media-Posts",
    intro:
      "Bilder und Bildunterschriften für Instagram und TikTok, direkt aus der events-Tabelle. Bild herunterladen, Text kopieren, posten. Musik muss auf TikTok in der App dazu.",
    back: "← Zurück zu Fightbase",
    postLang: "Sprache der Posts",
    weekend: "Dieses Wochenende",
    weekendHint: "Feed-Post / Karussell, 1080 × 1350.",
    events: (n: number) => `${n} Event${n === 1 ? "" : "s"}`,
    highlights: "Kämpfe mit angekündigter Paarung",
    highlightsHint: (d: number) => `Nächste ${d} Tage. Story, Reel und TikTok, 1080 × 1920 — je ein Post.`,
    noHighlights: "In diesem Zeitraum keine angekündigten Paarungen.",
    others: "Weitere Events",
    othersHint:
      "Turniere und Karten ohne Paarung. Besser im Wochenend-Post aufgehoben — ein Post je Turnier wirkt wie Spam.",
    image: "Bild öffnen",
    copy: "Text kopieren",
    copied: "Kopiert",
  },
};

function CopyButton({ text, label, done }: { text: string; label: string; done: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setOk(true);
          setTimeout(() => setOk(false), 1500);
        } catch {
          // Zwischenablage blockiert: Der Text steht ja daneben zum Markieren.
        }
      }}
      className="bg-accent text-white text-[13px] font-semibold rounded-md px-4 py-2"
    >
      {ok ? done : label}
    </button>
  );
}

function Caption({ text }: { text: string }) {
  return (
    <textarea
      readOnly
      value={text}
      rows={Math.min(14, text.split("\n").length + 1)}
      className="w-full bg-base border border-border rounded-md p-3 text-[12px] text-muted font-body leading-relaxed"
    />
  );
}

export default function AdminSocialClient({
  weekend,
  highlights,
  others,
  horizonDays,
}: {
  weekend: Weekend;
  highlights: SocialPost[];
  others: SocialPost[];
  horizonDays: number;
}) {
  const uiLang = useStoredLang();
  const L = STRINGS[uiLang];
  // Die Sprache der Posts ist eine eigene Wahl: Wer die Seite auf Deutsch
  // liest, postet nicht zwingend auf Deutsch.
  const [postLang, setPostLang] = useState<Lang>("en");
  const q = postLang === "de" ? "?lang=de" : "";
  const weekendImg = `/api/social/weekend${postLang === "de" ? "?lang=de&" : "?"}date=${weekend.from}`;

  return (
    <div className="max-w-3xl mx-auto px-5 py-10 font-body text-text">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-[13px] text-accentText">
          {L.back}
        </Link>
        <div className="flex gap-2">
          {(["en", "de"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setStoredLang(l)}
              className={`text-[12px] font-semibold rounded-md px-3 py-1 border ${uiLang === l ? "border-accent text-text" : "border-border text-faint"}`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <h1 className="font-display font-bold text-[28px] mt-6 mb-2">{L.heading}</h1>
      <p className="text-[14px] text-muted leading-relaxed mb-5">{L.intro}</p>

      <div className="flex items-center gap-3 mb-8">
        <span className="text-[13px] text-faint">{L.postLang}</span>
        {(["en", "de"] as const).map((l) => (
          <button
            key={l}
            onClick={() => setPostLang(l)}
            className={`text-[12px] font-semibold rounded-md px-3 py-1 border ${postLang === l ? "border-accent text-text" : "border-border text-faint"}`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <section className="bg-panel border border-border rounded-lg p-5 mb-10">
        <h2 className="font-display font-semibold text-[20px]">{L.weekend}</h2>
        <p className="text-[13px] text-faint mb-4">
          {weekend.from} – {weekend.to} · {L.events(weekend.count)} · {L.weekendHint}
        </p>
        <div className="md:flex gap-5">
          <a href={weekendImg} target="_blank" rel="noopener" className="block shrink-0 mb-4 md:mb-0">
            {/* Erzeugtes PNG aus der eigenen Route — next/image braechte hier nichts. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={weekendImg} alt="" width={216} height={270} className="rounded-md border border-border" />
          </a>
          <div className="flex-1">
            <Caption text={weekend.captions[postLang]} />
            <div className="flex gap-3 mt-3">
              <CopyButton text={weekend.captions[postLang]} label={L.copy} done={L.copied} />
              <a href={weekendImg} target="_blank" rel="noopener" className="text-[13px] text-accentText self-center">
                {L.image}
              </a>
            </div>
          </div>
        </div>
      </section>

      <h2 className="font-display font-semibold text-[20px]">{L.highlights}</h2>
      <p className="text-[13px] text-faint mb-4">{L.highlightsHint(horizonDays)}</p>
      {highlights.length === 0 && <p className="text-[14px] text-muted mb-10">{L.noHighlights}</p>}
      {highlights.map((p) => {
        const img = `/api/social/event/${encodeURIComponent(p.slug)}${q}`;
        return (
          <section key={p.slug} className="bg-panel border border-border rounded-lg p-5 mb-5 md:flex gap-5">
            <a href={img} target="_blank" rel="noopener" className="block shrink-0 mb-4 md:mb-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" width={144} height={256} loading="lazy" className="rounded-md border border-border" />
            </a>
            <div className="flex-1">
              <p className="text-[12px] text-faint">
                {p.date} · {p.promotion} · {p.sport}
              </p>
              <h3 className="font-display font-semibold text-[18px] mb-3">{p.title}</h3>
              <Caption text={p.captions[postLang]} />
              <div className="flex gap-3 mt-3">
                <CopyButton text={p.captions[postLang]} label={L.copy} done={L.copied} />
                <a href={img} target="_blank" rel="noopener" className="text-[13px] text-accentText self-center">
                  {L.image}
                </a>
              </div>
            </div>
          </section>
        );
      })}

      <h2 className="font-display font-semibold text-[20px] mt-10">{L.others}</h2>
      <p className="text-[13px] text-faint mb-4">{L.othersHint}</p>
      <ul className="text-[13px] text-muted">
        {others.map((p) => (
          <li key={p.slug} className="flex gap-3 py-2 border-t border-border">
            <span className="text-faint w-[90px] shrink-0">{p.date}</span>
            <span className="flex-1">
              {p.title} <span className="text-faint">· {p.promotion}</span>
            </span>
            <a
              href={`/api/social/event/${encodeURIComponent(p.slug)}${q}`}
              target="_blank"
              rel="noopener"
              className="text-accentText shrink-0"
            >
              {L.image}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
