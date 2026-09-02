// ---- Seed data (researched Aug 2026, curated manually) -----------------
export type FightEvent = {
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
  // Undercard bouts announced so far — only added once officially confirmed
  // by the promotion, never guessed. Most cards this far out aren't full yet.
  undercard?: string[];
};

export const EVENTS: FightEvent[] = [
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
  {
    id: "ufc-331",
    date: "2026-09-19",
    sport: "MMA",
    promotion: "UFC",
    title: "UFC 331",
    main: "Van vs. Pantoja 2",
    fighters: ["Van", "Pantoja"],
    venue: "Crypto.com Arena, Los Angeles",
    broadcaster: "ESPN+/PPV",
    note: "Flyweight title rematch between champion Joshua Van and former champion Alexandre Pantoja.",
  },
  {
    id: "ufc-332",
    date: "2026-10-03",
    sport: "MMA",
    promotion: "UFC",
    title: "UFC 332",
    main: "Figueiredo vs. Talbott, plus a Shevchenko title defense",
    venue: "Delta Center, Salt Lake City",
    broadcaster: "ESPN+/PPV",
    note: "Two-time women's flyweight champion Valentina Shevchenko defends against Natália Silva in the co-main.",
    undercard: ["Shevchenko vs. Silva"],
  },
  {
    id: "ufc-333",
    date: "2026-10-24",
    sport: "MMA",
    promotion: "UFC",
    title: "UFC 333",
    main: "Volkanovski vs. Evloev",
    fighters: ["Volkanovski", "Evloev"],
    venue: "Etihad Arena, Abu Dhabi",
    broadcaster: "ESPN+/PPV",
    note: "Featherweight title fight; Yan vs. Dvalishvili bantamweight trilogy co-headlines.",
    undercard: ["Yan vs. Dvalishvili"],
  },
  {
    id: "ufc-334",
    date: "2026-11-14",
    sport: "MMA",
    promotion: "UFC",
    title: "UFC 334",
    main: "Main event TBD",
    venue: "Madison Square Garden, New York City",
    broadcaster: "ESPN+/PPV",
    note: "UFC's first Madison Square Garden card since UFC 322 in Nov 2025.",
  },
  {
    id: "oktagon-96",
    date: "2026-10-31",
    sport: "MMA",
    promotion: "OKTAGON",
    title: "OKTAGON 96",
    main: "Gogoladze vs. Klinkhammer",
    fighters: ["Gogoladze", "Klinkhammer"],
    venue: "SAP Garden, Munich",
    broadcaster: "DAZN / RTL+",
    note: "Vacant welterweight title fight after Kaik Brito left the promotion.",
  },
  {
    id: "oktagon-97",
    date: "2026-11-07",
    sport: "MMA",
    promotion: "OKTAGON",
    title: "OKTAGON 97",
    main: "Severino vs. Holzer",
    fighters: ["Severino", "Holzer"],
    venue: "ZAG Arena, Hannover",
    broadcaster: "DAZN / RTL+",
    note: "Bantamweight champion Severino defends against German challenger Max Holzer.",
  },
  {
    id: "dubois-wardley-2",
    date: "2026-10-17",
    sport: "Boxing",
    promotion: "Queensberry Promotions",
    title: "Dubois vs. Wardley II",
    main: "Dubois vs. Wardley",
    fighters: ["Dubois", "Wardley"],
    venue: "The O2 Arena, London",
    broadcaster: "-",
    note: "Rematch of a 2026 Fight of the Year contender.",
  },
  {
    id: "canelo-mbilli",
    date: "2026-10-31",
    sport: "Boxing",
    promotion: "Riyadh Season",
    title: "Canelo vs. Mbilli",
    main: "Canelo vs. Mbilli",
    fighters: ["Canelo", "Mbilli"],
    venue: "Riyadh, Saudi Arabia",
    broadcaster: "-",
    note: "Canelo challenges for Mbilli's WBC super middleweight title, his first fight since losing to Crawford.",
  },
  {
    id: "glory-110",
    date: "2026-10-17",
    sport: "Kickboxing",
    promotion: "GLORY",
    title: "GLORY 110",
    main: "Trindade vs. Demirkapu",
    fighters: ["Trindade", "Demirkapu"],
    venue: "Lotto Arena, Antwerp",
    broadcaster: "-",
    note: "Vacant GLORY featherweight world title fight.",
  },
  {
    id: "glory-rivals-6",
    date: "2026-11-28",
    sport: "Kickboxing",
    promotion: "GLORY",
    title: "GLORY Rivals 6",
    main: "Up-and-coming prospects card",
    venue: "Maaspoort, Den Bosch",
    broadcaster: "-",
    note: "GLORY partners with Dutch regional promotion Ringfight Promotions to showcase rising talent.",
  },
];

export const SPORTS = [
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

export function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  const weekday = d.toLocaleDateString("en-GB", { weekday: "short" });
  const day = d.getDate();
  const month = d.toLocaleDateString("en-GB", { month: "short" });
  return { weekday, day, month };
}

export function daysUntil(iso: string) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(iso + "T00:00:00");
  return Math.round((target.getTime() - now.getTime()) / 86400000);
}

// Deterministic hue per fighter name — original illustration, not a photo.
export function nameHue(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

// Official homepages for broadcasters we know — never guessed, only real domains.
export const BROADCASTER_LINKS: Record<string, string> = {
  DAZN: "https://www.dazn.com",
  "RTL+": "https://plus.rtl.de",
  "RTL (Free-TV)": "https://www.rtl.de",
  FloGrappling: "https://www.flograppling.com",
  "IJF TV": "https://www.ijf.org",
  "ESPN+/PPV": "https://plus.espn.com",
};

export function watchLinks(broadcaster: string) {
  if (broadcaster === "-" || broadcaster === "TBA") return [];
  return broadcaster
    .split("/")
    .map((b) => b.trim())
    .filter(Boolean)
    .map((label) => ({ label, url: BROADCASTER_LINKS[label] }));
}

export function fighterSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function allFighterNames() {
  return Array.from(
    new Set(EVENTS.flatMap((e) => e.fighters ?? []))
  ).sort();
}

export function fighterBySlug(slug: string) {
  return allFighterNames().find((n) => fighterSlug(n) === slug) ?? null;
}

export function upcomingFightsFor(name: string) {
  return EVENTS.filter(
    (e) => e.fighters?.includes(name) && daysUntil(e.date) >= 0
  ).sort((a, b) => (a.date > b.date ? 1 : -1));
}
