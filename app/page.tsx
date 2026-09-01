"use client";

import { useEffect, useMemo, useState } from "react";

// ---- Seed data (researched Aug 2026, curated manually) -----------------
const EVENTS = [
  {
    id: "oktagon-93",
    date: "2026-09-12",
    sport: "MMA",
    promotion: "OKTAGON",
    title: "OKTAGON 93",
    main: "Brito vs. Gogoladze",
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

export default function Home() {
  const [filter, setFilter] = useState("All");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [loaded, setLoaded] = useState(false);

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
    return EVENTS.filter((e) => {
      if (filter !== "All" && e.sport !== filter) return false;
      if (onlyFavorites && !favorites.includes(e.promotion)) return false;
      return true;
    }).sort((a, b) => (a.date > b.date ? 1 : -1));
  }, [filter, onlyFavorites, favorites]);

  return (
    <div className="max-w-[480px] mx-auto min-h-screen pb-10">
      {/* Header */}
      <header className="px-5 pt-7 pb-4 border-b border-border">
        <h1 className="font-display font-bold text-[28px] tracking-wide text-text">
          FIGHTBASE
        </h1>
        <p className="text-[13px] text-faint mt-1">
          Boxing · MMA · Muay Thai · Kickboxing · Jiu-Jitsu · Judo · Wrestling
          · Karate · Taekwondo
        </p>
      </header>

      {/* Sport filter */}
      <div className="flex gap-2 px-5 pt-4 flex-wrap">
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

      {/* Favorites */}
      <div className="px-5 pt-4 pb-4 border-b border-border">
        <label className="flex items-center gap-2 text-[13px] text-muted mb-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={onlyFavorites}
            onChange={(e) => setOnlyFavorites(e.target.checked)}
            className="accent-accent w-[15px] h-[15px]"
          />
          Favorites only
        </label>
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

      {/* Timeline */}
      <main className="px-5 pt-5 flex flex-col gap-[18px]">
        {filtered.length === 0 && (
          <div className="text-center py-10">
            <p className="text-[15px] text-text mb-1">No events.</p>
            <p className="text-[13px] text-dim">
              Adjust the filter or turn off &quot;Favorites only&quot;.
            </p>
          </div>
        )}
        {filtered.map((e) => {
          const { weekday, day, month } = formatDate(e.date);
          const dLeft = daysUntil(e.date);
          const isFav = favorites.includes(e.promotion);
          return (
            <div key={e.id} className="flex gap-3.5">
              <div className="w-12 shrink-0 text-center pt-1">
                <div className="text-[11px] text-dim uppercase">
                  {weekday}
                </div>
                <div className="font-display font-semibold text-[26px] leading-none text-text">
                  {day}
                </div>
                <div className="text-[11px] text-dim">{month}</div>
              </div>
              <div
                className={`flex-1 rounded-[10px] border p-3.5 px-4 ${
                  isFav
                    ? "border-borderFav bg-panelFav"
                    : "border-border bg-panel"
                }`}
              >
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[11px] font-semibold text-accent tracking-wide">
                    {e.sport}
                  </span>
                  <span className="text-[11px] text-dim">
                    {dLeft === 0
                      ? "today"
                      : dLeft > 0
                      ? `in ${dLeft} days`
                      : "past"}
                  </span>
                </div>
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
                {e.note && (
                  <p className="text-[12px] text-dim leading-relaxed">
                    {e.note}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </main>

      <footer className="px-5 pt-6">
        <p className="text-[11px] text-[#4A4A4E] leading-relaxed">
          Seed data researched manually, as of late Aug 2026. Cards and
          cancellations change — always confirm with the promotion directly.
        </p>
      </footer>
    </div>
  );
}
