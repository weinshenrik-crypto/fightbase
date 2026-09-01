"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

// ---- Seed data (researched Aug 2026, curated manually) -----------------
type FightEvent = {
  id: string;
  date: string;
  sport: string;
  promotion: string;
  title: string;
  main: string;
  fighters?: [string, string];
  venue: string;
  broadcaster: string;
  note: string;
};

const EVENTS: FightEvent[] = [
  {
    id: "oktagon-93",
    date: "2026-09-12",
    sport: "MMA",
    promotion: "OKTAGON",
    title: "OKTAGON 93",
    main: "Brito vs. Gogoladze",
    fighters: ["Brito", "Gogoladze"],
    venue: "Winning Group Arena, Brno",
    broadcaster: "DAZN",
    note: "One of OKTAGON's most important cities — 17 events held here so far.",
  },
  {
    id: "phoenix-fc5",
    date: "2026-09-19",
    sport: "MMA",
    promotion: "Phoenix Fighting Championship",
    title: "PFC 5",
    main: "Rundsporthalle Baunatal card",
    venue: "Rundsporthalle, Baunatal",
    broadcaster: "-",
    note: "MMA & K1, an explosive fight night.",
  },
  {
    id: "oktagon-94",
    date: "2026-09-26",
    sport: "MMA",
    promotion: "OKTAGON",
    title: "OKTAGON 94: The Biggest Comeback Ever",
    main: "Frankfurt stadium card",
    venue: "Deutsche Bank Park, Frankfurt",
    broadcaster: "DAZN / RTL+",
    note: "In 2024, OKTAGON broke the MMA world attendance record here with 60,000 fans. Comeback show in the same stadium.",
  },
  {
    id: "steko-1",
    date: "2026-10-03",
    sport: "Boxing",
    promotion: "STEKO'S Fight Night",
    title: "World title fights, Munich",
    main: "O. Plasene, C. Netza and others",
    venue: "Munich",
    broadcaster: "-",
    note: "Multiple world title fights on one card.",
  },
  {
    id: "oktagon-95",
    date: "2026-10-17",
    sport: "MMA",
    promotion: "OKTAGON",
    title: "OKTAGON 95",
    main: "Kincl vs. Humburger",
    fighters: ["Kincl", "Humburger"],
    venue: "KV Arena, Karlovy Vary",
    broadcaster: "DAZN",
    note: "Former champion Kincl against Humburger, a fight Humburger requested himself.",
  },
  {
    id: "rtl-freetv",
    date: "2026-10-18",
    sport: "MMA",
    promotion: "OKTAGON",
    title: "OKTAGON — Free-TV Premiere",
    main: "Germany's MMA elite in Cologne",
    venue: "Cologne",
    broadcaster: "RTL (Free-TV)",
    note: "MMA's first-ever German free-TV broadcast — a statement for the sport's future here.",
  },
  {
    id: "korn-hass",
    date: "2026-10-03",
    sport: "Muay Thai",
    promotion: "K.O.RNHASS Fight Night",
    title: "K.O.RNHASS Fight Night",
    main: "K1 / MMA / Boxing / Muay Thai",
    venue: "Festival tent, Irschenberg",
    broadcaster: "-",
    note: "Pro and amateur bouts, national and world title fights across multiple styles.",
  },
  {
    id: "sauerland-mf",
    date: "2026-11-07",
    sport: "Boxing",
    promotion: "MF Sports (Sauerland)",
    title: "MF Sports — Germany comeback",
    main: "Card TBA",
    venue: "TBA, Germany",
    broadcaster: "TBA",
    note: "The Sauerland brothers are independent again and plan to promote in Germany again in 2026.",
  },
  {
    id: "glory-109",
    date: "2026-09-05",
    sport: "Kickboxing",
    promotion: "GLORY",
    title: "GLORY 109",
    main: "Rotterdam fight card",
    venue: "RTM Stage, Rotterdam",
    broadcaster: "-",
    note: "The world's leading kickboxing promotion returns to its Rotterdam home venue.",
  },
  {
    id: "judo-grand-slam-hungary",
    date: "2026-09-11",
    sport: "Judo",
    promotion: "IJF Judo Grand Slam",
    title: "Judo Grand Slam Hungary",
    main: "Elite -60kg to +100kg finals",
    venue: "Budapest, Hungary",
    broadcaster: "IJF TV",
    note: "One of the IJF's premier annual Grand Slam stops, drawing Olympic medalists across all weight classes.",
  },
  {
    id: "adcc-2026",
    date: "2026-09-12",
    sport: "Jiu-Jitsu",
    promotion: "ADCC",
    title: "ADCC World Championship 2026",
    main: "No-gi grappling's biggest stage",
    venue: "Krakow, Poland",
    broadcaster: "FloGrappling",
    note: "Held every two years; the top submission grapplers across weight classes plus the openweight superfight.",
  },
  {
    id: "karate1-salzburg",
    date: "2026-10-02",
    sport: "Karate",
    promotion: "WKF Karate 1",
    title: "Karate 1 Series A Salzburg",
    main: "Kumite & kata across all weight classes",
    venue: "Salzburg, Austria",
    broadcaster: "-",
    note: "Part of the WKF's global qualification series toward the 2026 Karate World Cup.",
  },
  {
    id: "uww-worlds-2026",
    date: "2026-10-24",
    sport: "Wrestling",
    promotion: "UWW",
    title: "World Wrestling Championships 2026",
    main: "Freestyle, Greco-Roman & women's wrestling",
    venue: "Astana, Kazakhstan",
    broadcaster: "-",
    note: "Relocated from Bahrain; wrestling's most important non-Olympic championship, running through Nov 1.",
  },
  {
    id: "wt-grand-prix-final",
    date: "2026-11-28",
    sport: "Taekwondo",
    promotion: "World Taekwondo",
    title: "World Taekwondo Grand Prix Final",
    main: "Season finale — top 8 ranked fighters per division",
    venue: "Incheon, South Korea",
    broadcaster: "-",
    note: "Exact date still TBA at time of writing (World Taekwondo lists Nov/Dec) — check worldtaekwondo.org closer to the date.",
  },
];

const SPORTS = [
  "All",
  "MMA",
  "Boxing",
  "Muay Thai",
  "Kickboxing",
  "Jiu-Jitsu",
  "Judo",
  "Wrestling",
  "Karate",
  "Taekwondo",
];

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  const weekday = d.toLocaleDateString("en-GB", { weekday: "short" });
  const day = d.getDate();
  const month = d.toLocaleDateString("en-GB", { month: "short" });
  return { weekday, day, month };
}

function daysUntil(iso: string) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(iso + "T00:00:00");
  return Math.round((target.getTime() - now.getTime()) / 86400000);
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// Official homepages for broadcasters we know — never guessed, only real domains.
const BROADCASTER_LINKS: Record<string, string> = {
  DAZN: "https://www.dazn.com",
  "RTL+": "https://plus.rtl.de",
  "RTL (Free-TV)": "https://www.rtl.de",
  FloGrappling: "https://www.flograppling.com",
  "IJF TV": "https://www.ijf.org",
};

function watchLinks(broadcaster: string) {
  if (broadcaster === "-" || broadcaster === "TBA") return [];
  return broadcaster
    .split("/")
    .map((b) => b.trim())
    .filter(Boolean)
    .map((label) => ({ label, url: BROADCASTER_LINKS[label] }));
}

function FighterAvatar({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center gap-1 w-16">
      <div className="w-11 h-11 rounded-full bg-[#2A2A2C] border border-[#3A3A3C] flex items-center justify-center text-[13px] font-semibold text-text shrink-0">
        {initials(name)}
      </div>
      <span className="text-[11px] text-muted text-center leading-tight">
        {name}
      </span>
    </div>
  );
}

function EventCard({
  e,
  isFav,
  isOpen,
  onToggle,
}: {
  e: FightEvent;
  isFav: boolean;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const { weekday, day, month } = formatDate(e.date);
  const dLeft = daysUntil(e.date);
  const links = watchLinks(e.broadcaster);

  return (
    <div className="flex gap-3.5">
      <div className="w-12 shrink-0 text-center pt-1">
        <div className="text-[11px] text-dim uppercase">{weekday}</div>
        <div className="font-display font-semibold text-[26px] leading-none text-text">
          {day}
        </div>
        <div className="text-[11px] text-dim">{month}</div>
      </div>
      <div
        onClick={onToggle}
        className={`flex-1 rounded-[10px] border p-3.5 px-4 cursor-pointer ${
          isFav ? "border-borderFav bg-panelFav" : "border-border bg-panel"
        }`}
      >
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[11px] font-semibold text-accent tracking-wide">
            {e.sport}
          </span>
          <span className="text-[11px] text-dim">
            {dLeft === 0 ? "today" : dLeft > 0 ? `in ${dLeft} days` : "past"}
          </span>
        </div>

        {e.fighters && (
          <div className="flex items-center justify-between mb-2 px-1">
            <FighterAvatar name={e.fighters[0]} />
            <span className="text-[11px] text-dim font-semibold">VS</span>
            <FighterAvatar name={e.fighters[1]} />
          </div>
        )}

        <h2 className="font-display font-semibold text-[18px] leading-tight text-text mb-1">
          {e.main}
        </h2>
        <p className="text-[13px] text-muted mb-0.5">
          {e.title} · {e.promotion}
        </p>
        <p className="text-[12px] text-faint mb-1.5">
          {e.venue}
          {e.broadcaster !== "-" ? ` · ${e.broadcaster}` : ""}
        </p>

        {isOpen ? (
          <div onClick={(ev) => ev.stopPropagation()} className="cursor-auto">
            {e.note && (
              <p className="text-[12px] text-dim leading-relaxed mb-2">
                {e.note}
              </p>
            )}
            {links.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1 border-t border-[#2E2E30] mt-1.5">
                {links.map((l) =>
                  l.url ? (
                    <a
                      key={l.label}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[12px] font-medium px-2.5 py-1 rounded-md bg-accent text-white"
                    >
                      Watch on {l.label} ↗
                    </a>
                  ) : (
                    <span
                      key={l.label}
                      className="text-[12px] px-2.5 py-1 rounded-md border border-[#2E2E30] text-faint"
                    >
                      {l.label}
                    </span>
                  )
                )}
              </div>
            )}
          </div>
        ) : (
          (e.note || links.length > 0) && (
            <p className="text-[11px] text-[#5A5A5E]">
              Tap for details{links.length > 0 ? " & where to watch" : ""}
            </p>
          )
        )}
      </div>
    </div>
  );
}

const TABS = [
  { id: "events", label: "Events" },
  { id: "favorites", label: "Favorites" },
  { id: "account", label: "Account" },
] as const;
type TabId = (typeof TABS)[number]["id"];

export default function Home() {
  const [tab, setTab] = useState<TabId>("events");
  const [filter, setFilter] = useState("All");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("fightbase:favorites");
      if (stored) setFavorites(JSON.parse(stored));
    } catch (e) {
      // ignore
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("fightbase:favorites", JSON.stringify(favorites));
  }, [favorites, loaded]);

  function toggleFavorite(promotion: string) {
    setFavorites((prev) =>
      prev.includes(promotion)
        ? prev.filter((p) => p !== promotion)
        : [...prev, promotion]
    );
  }

  const allPromotions = useMemo(
    () => Array.from(new Set(EVENTS.map((e) => e.promotion))),
    []
  );

  const filtered = useMemo(() => {
    return EVENTS.filter((e) => filter === "All" || e.sport === filter).sort(
      (a, b) => (a.date > b.date ? 1 : -1)
    );
  }, [filter]);

  const favoriteEvents = useMemo(() => {
    return EVENTS.filter((e) => favorites.includes(e.promotion)).sort(
      (a, b) => (a.date > b.date ? 1 : -1)
    );
  }, [favorites]);

  return (
    <div className="max-w-[480px] mx-auto min-h-screen pb-10">
      {/* Header */}
      <header className="px-5 pt-7 pb-4 border-b border-border flex items-center gap-3">
        <Image
          src="/logo-header.png"
          alt="Fightbase logo"
          width={40}
          height={40}
          className="rounded-[9px] shrink-0"
        />
        <div>
          <h1 className="font-display font-bold text-[28px] tracking-wide text-text">
            FIGHTBASE
          </h1>
          <p className="text-[13px] text-faint mt-1">
            Boxing · MMA · Muay Thai · Kickboxing · Jiu-Jitsu · Judo ·
            Wrestling · Karate · Taekwondo
          </p>
        </div>
      </header>

      {/* Tab bar */}
      <div className="flex px-5 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 text-[13px] font-semibold py-3 border-b-2 transition-colors ${
              tab === t.id
                ? "border-accent text-text"
                : "border-transparent text-faint"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "events" && (
        <>
          {/* Sport filter */}
          <div className="flex gap-2 px-5 pt-4 pb-4 flex-wrap border-b border-border">
            {SPORTS.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`text-[13px] font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
                  filter === s
                    ? "bg-accent border-accent text-white"
                    : "border-[#3A3A3C] text-muted"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Timeline */}
          <main className="px-5 pt-5 flex flex-col gap-[18px]">
            {filtered.length === 0 && (
              <div className="text-center py-10">
                <p className="text-[15px] text-text mb-1">No events.</p>
                <p className="text-[13px] text-dim">Adjust the filter.</p>
              </div>
            )}
            {filtered.map((e) => (
              <EventCard
                key={e.id}
                e={e}
                isFav={favorites.includes(e.promotion)}
                isOpen={expandedId === e.id}
                onToggle={() =>
                  setExpandedId(expandedId === e.id ? null : e.id)
                }
              />
            ))}
          </main>

          <footer className="px-5 pt-6">
            <p className="text-[11px] text-[#4A4A4E] leading-relaxed">
              Seed data researched manually, as of late Aug 2026. Cards and
              cancellations change — always confirm with the promotion
              directly.
            </p>
          </footer>
        </>
      )}

      {tab === "favorites" && (
        <>
          <div className="px-5 pt-4 pb-4 border-b border-border">
            <p className="text-[13px] text-muted mb-2.5">
              Star a promotion to follow its events here.
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {allPromotions.map((p) => {
                const isFav = favorites.includes(p);
                return (
                  <button
                    key={p}
                    onClick={() => toggleFavorite(p)}
                    className={`text-[12px] px-2.5 py-1 rounded-md border transition-colors ${
                      isFav
                        ? "border-accent text-text"
                        : "border-[#2E2E30] bg-panel text-faint"
                    }`}
                  >
                    {isFav ? "★" : "☆"} {p}
                  </button>
                );
              })}
            </div>
          </div>

          <main className="px-5 pt-5 flex flex-col gap-[18px] pb-6">
            {favoriteEvents.length === 0 && (
              <div className="text-center py-10">
                <p className="text-[15px] text-text mb-1">
                  No favorites yet.
                </p>
                <p className="text-[13px] text-dim">
                  Star a promotion above to see its events here.
                </p>
              </div>
            )}
            {favoriteEvents.map((e) => (
              <EventCard
                key={e.id}
                e={e}
                isFav={true}
                isOpen={expandedId === e.id}
                onToggle={() =>
                  setExpandedId(expandedId === e.id ? null : e.id)
                }
              />
            ))}
          </main>
        </>
      )}

      {tab === "account" && (
        <main className="px-5 pt-6 pb-10">
          <h2 className="font-display font-semibold text-[20px] text-text mb-1">
            {authMode === "signup" ? "Create account" : "Log in"}
          </h2>
          <p className="text-[13px] text-dim mb-5">
            Sign up to sync your favorites across devices and get notified
            before events start.
          </p>

          <form
            onSubmit={(ev) => ev.preventDefault()}
            className="flex flex-col gap-3"
          >
            <input
              type="email"
              placeholder="Email"
              className="bg-panel border border-border rounded-md px-3.5 py-2.5 text-[14px] text-text placeholder:text-dim outline-none focus:border-accent"
            />
            <input
              type="password"
              placeholder="Password"
              className="bg-panel border border-border rounded-md px-3.5 py-2.5 text-[14px] text-text placeholder:text-dim outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled
              className="bg-accent text-white text-[14px] font-semibold rounded-md py-2.5 opacity-50 cursor-not-allowed"
            >
              {authMode === "signup" ? "Sign up" : "Log in"}
            </button>
            <p className="text-[11px] text-dim text-center">
              Account backend is being connected — this form isn&apos;t live
              yet.
            </p>
          </form>

          <button
            onClick={() =>
              setAuthMode(authMode === "signup" ? "login" : "signup")
            }
            className="text-[13px] text-accent mt-4"
          >
            {authMode === "signup"
              ? "Already have an account? Log in"
              : "New here? Create an account"}
          </button>
        </main>
      )}
    </div>
  );
}
