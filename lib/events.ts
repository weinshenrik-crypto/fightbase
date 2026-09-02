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
    title: "OKTAGON 93: Roušal vs. Mågård",
    main: "Roušal vs. Mågård",
    fighters: ["Roušal", "Mågård"],
    venue: "Winning Group Arena, Brno",
    broadcaster: "DAZN",
    note: "Featherweight main event between Czech home favorite Radek Roušal (on a four-fight finishing streak) and former two-time OKTAGON champion Jonas \"Shark\" Mågård. The original Brito vs. Gogoladze title fight was pulled from this card after Brito vacated the belt and signed with the UFC.",
    undercard: ["Kalašnik vs. Rayomba", "Kinehan vs. Cook", "Bruknar vs. Haywood"],
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
  {
    id: "one-fight-night-48",
    date: "2026-10-03",
    sport: "MMA",
    promotion: "ONE Championship",
    title: "ONE Fight Night 48",
    main: "Erdogan vs. Elliott",
    fighters: ["Erdogan", "Elliott"],
    venue: "Lumpinee Stadium, Bangkok",
    broadcaster: "Prime Video",
    note: "Shamil Erdogan (13-0) meets Paul Elliott with vacant ONE heavyweight MMA title implications on the line.",
  },
  {
    id: "one-samurai-4",
    date: "2026-10-17",
    sport: "Kickboxing",
    promotion: "ONE Championship",
    title: "ONE SAMURAI 4",
    main: "Haggerty vs. Akimoto",
    fighters: ["Haggerty", "Akimoto"],
    venue: "Ariake Arena, Tokyo",
    broadcaster: "-",
    note: "Jonathan Haggerty defends the ONE bantamweight kickboxing title against Hiroki Akimoto; Superlek vs. Jonathan Di Bella also headlines.",
  },
  {
    id: "oktagon-98",
    date: "2026-11-21",
    sport: "MMA",
    promotion: "OKTAGON",
    title: "OKTAGON 98",
    main: "Card TBA",
    venue: "WERK ARENA, Třinec",
    broadcaster: "DAZN",
    note: "Main event not yet announced.",
  },
  {
    id: "one-samurai-5",
    date: "2026-11-18",
    sport: "Kickboxing",
    promotion: "ONE Championship",
    title: "ONE SAMURAI 5",
    main: "Card TBA",
    venue: "EBARA WAVE Arena Ota, Tokyo",
    broadcaster: "-",
    note: "Main event not yet announced.",
  },
  {
    id: "judo-grand-slam-tokyo",
    date: "2026-12-05",
    sport: "Judo",
    promotion: "IJF Judo Grand Slam",
    title: "Judo Grand Slam Tokyo",
    main: "Elite finals across all weight classes",
    venue: "Tokyo, Japan",
    broadcaster: "-",
    note: "The final Grand Slam of the 2026 IJF World Judo Tour season, held in judo's Japanese heartland — a key world-ranking event.",
  },
  {
    id: "oktagon-99",
    date: "2026-12-05",
    sport: "MMA",
    promotion: "OKTAGON",
    title: "OKTAGON 99",
    main: "Card TBA",
    venue: "Westfalenhalle, Dortmund",
    broadcaster: "DAZN / RTL+",
    note: "Main event not yet announced.",
  },
  {
    id: "one-fight-night-49",
    date: "2026-12-12",
    sport: "MMA",
    promotion: "ONE Championship",
    title: "ONE Fight Night 49",
    main: "Card TBA",
    venue: "Lumpinee Stadium, Bangkok",
    broadcaster: "-",
    note: "Main event not yet announced.",
  },
  {
    id: "ufc-335",
    date: "2026-12-12",
    sport: "MMA",
    promotion: "UFC",
    title: "UFC 335",
    main: "Main event TBD",
    venue: "T-Mobile Arena, Las Vegas",
    broadcaster: "ESPN+/PPV",
    note: "Closes out the UFC's 2026 numbered-event slate; no UFC events beyond this date are confirmed yet.",
  },
  {
    id: "glory-collision-10",
    date: "2026-12-12",
    sport: "Kickboxing",
    promotion: "GLORY",
    title: "GLORY Collision 10",
    main: "Kromah vs. Plazibat",
    fighters: ["Kromah", "Plazibat"],
    venue: "GelreDome, Arnhem",
    broadcaster: "-",
    note: "Heavyweight title fight; also features a Trindade vs. Demirkapu rematch of their GLORY 110 featherweight title bout.",
    undercard: ["Trindade vs. Demirkapu (rematch)"],
  },
  {
    id: "oktagon-100",
    date: "2026-12-29",
    sport: "MMA",
    promotion: "OKTAGON",
    title: "OKTAGON 100",
    main: "Card TBA",
    venue: "O2 Arena, Prague",
    broadcaster: "DAZN",
    note: "Milestone 100th numbered OKTAGON event, marketed as \"100 tournaments, 10 years.\"",
  },
  {
    id: "k1-world-max-70kg-final",
    date: "2026-12-29",
    sport: "Kickboxing",
    promotion: "K-1",
    title: "K-1 World MAX 2026 — 70kg World Championship Final",
    main: "70kg tournament final",
    venue: "Yokohama Buntai, Yokohama",
    broadcaster: "-",
    note: "Final of K-1's flagship 70kg tournament, a separate promotion from GLORY giving kickboxing extra depth on the calendar.",
  },
  {
    id: "oktagon-stuttgart",
    date: "2027-01-16",
    sport: "MMA",
    promotion: "OKTAGON",
    title: "OKTAGON — Stuttgart",
    main: "Card TBA",
    venue: "Hanns-Martin-Schleyer-Halle, Stuttgart",
    broadcaster: "DAZN / RTL+",
    note: "Main event and official numbering not yet announced.",
  },
  {
    id: "wkf-karate1-tbilisi",
    date: "2027-01-08",
    sport: "Karate",
    promotion: "WKF Karate 1",
    title: "Karate 1 Series A Tbilisi",
    main: "Kumite & kata across all weight classes",
    venue: "Tbilisi, Georgia",
    broadcaster: "-",
    note: "Part of the WKF's global qualification series toward the 2027 season.",
  },
  {
    id: "ibjjf-euros-2027",
    date: "2027-01-13",
    sport: "Jiu-Jitsu",
    promotion: "IBJJF",
    title: "European IBJJF Jiu-Jitsu Championship 2027",
    main: "Gi & no-gi divisions, all belt levels",
    venue: "Lisbon, Portugal",
    broadcaster: "-",
    note: "The largest annual gi/no-gi European IBJJF title event, drawing thousands of competitors across all belt levels.",
  },
  {
    id: "wkf-karate1-istanbul",
    date: "2027-01-29",
    sport: "Karate",
    promotion: "WKF Karate 1",
    title: "Karate 1 Premier League Istanbul",
    main: "Kumite & kata across all weight classes",
    venue: "Istanbul, Turkey",
    broadcaster: "-",
    note: "A top-tier Premier League leg feeding Olympic-cycle world rankings.",
  },
  {
    id: "uww-zagreb-open-2027",
    date: "2027-02-04",
    sport: "Wrestling",
    promotion: "UWW",
    title: "UWW Ranking Series — Zagreb Open 2027",
    main: "Freestyle, Greco-Roman & women's wrestling",
    venue: "Zagreb, Croatia",
    broadcaster: "-",
    note: "Traditionally the season-opening leg of United World Wrestling's Ranking Series, drawing top senior wrestlers across all styles.",
  },
  {
    id: "wkf-karate1-rome",
    date: "2027-03-11",
    sport: "Karate",
    promotion: "WKF Karate 1",
    title: "Karate 1 Premier League Rome",
    main: "Kumite & kata across all weight classes",
    venue: "Rome, Italy",
    broadcaster: "-",
    note: "A top-tier Premier League leg feeding Olympic-cycle world rankings.",
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

// Official promotion homepages we're confident about — never guessed.
export const PROMOTION_LINKS: Record<string, string> = {
  ADCC: "https://adcombat.com",
  GLORY: "https://glorykickboxing.com",
  "IJF Judo Grand Slam": "https://www.ijf.org",
  OKTAGON: "https://oktagonmma.com",
  UFC: "https://www.ufc.com",
  UWW: "https://uww.org",
  "WKF Karate 1": "https://www.wkf.net",
  "World Taekwondo": "https://www.worldtaekwondo.org",
  "Queensberry Promotions": "https://queensberry.co.uk",
  "Riyadh Season": "https://riyadhseason.sa",
  "ONE Championship": "https://www.onefc.com",
  IBJJF: "https://ibjjf.com",
};

// Best-effort city/locality extracted from a "Venue, City" style string,
// used for optional structured-data address fields.
export function venueLocality(venue: string) {
  const parts = venue.split(",").map((p) => p.trim());
  return parts.length > 1 ? parts[parts.length - 1] : null;
}

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
