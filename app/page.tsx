"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

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

// Deterministic hue per fighter name — original illustration, not a photo.
function nameHue(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

function FighterIllustration({
  name,
  size = 44,
}: {
  name: string;
  size?: number;
}) {
  const hue = nameHue(name);
  return (
    <div
      style={{
        width: size,
        height: size,
        background: `hsl(${hue}, 40%, 20%)`,
        border: `1px solid hsl(${hue}, 40%, 32%)`,
      }}
      className="rounded-full flex items-center justify-center shrink-0"
    >
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24">
        <circle cx="12" cy="5.5" r="2.6" fill={`hsl(${hue}, 65%, 72%)`} />
        <path
          d="M8.2 9 L15.8 9 L14.8 19.5 L9.2 19.5 Z"
          fill={`hsl(${hue}, 55%, 55%)`}
        />
        <circle cx="6.8" cy="8.4" r="1.9" fill={`hsl(${hue}, 65%, 72%)`} />
        <circle cx="17.2" cy="8.4" r="1.9" fill={`hsl(${hue}, 65%, 72%)`} />
      </svg>
    </div>
  );
}

// Official homepages for broadcasters we know — never guessed, only real domains.
const BROADCASTER_LINKS: Record<string, string> = {
  DAZN: "https://www.dazn.com",
  "RTL+": "https://plus.rtl.de",
  "RTL (Free-TV)": "https://www.rtl.de",
  FloGrappling: "https://www.flograppling.com",
  "IJF TV": "https://www.ijf.org",
  "ESPN+/PPV": "https://plus.espn.com",
};

function watchLinks(broadcaster: string) {
  if (broadcaster === "-" || broadcaster === "TBA") return [];
  return broadcaster
    .split("/")
    .map((b) => b.trim())
    .filter(Boolean)
    .map((label) => ({ label, url: BROADCASTER_LINKS[label] }));
}

function FighterAvatar({
  name,
  onClick,
}: {
  name: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={(ev) => {
        ev.stopPropagation();
        onClick();
      }}
      className="flex flex-col items-center gap-1 w-16"
    >
      <FighterIllustration name={name} size={44} />
      <span className="text-[11px] text-muted text-center leading-tight">
        {name}
      </span>
    </button>
  );
}

type FighterRow = {
  name: string;
  nickname: string | null;
  sport: string | null;
  record: string | null;
  bio: string | null;
  career: string | null;
  photo_url: string | null;
};

function FighterModal({
  name,
  isAdmin,
  onClose,
  onSaved,
  L,
}: {
  name: string;
  isAdmin: boolean;
  onClose: () => void;
  onSaved?: (fighter: FighterRow) => void;
  L: Strings;
}) {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fighter, setFighter] = useState<FighterRow>({
    name,
    nickname: "",
    sport: "",
    record: "",
    bio: "",
    career: "",
    photo_url: "",
  });

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("fighters")
      .select("*")
      .eq("name", name)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        if (data) setFighter(data as FighterRow);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [name]);

  async function handleSave() {
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const updated = { ...fighter, name, updated_by: userData.user?.id };
    await supabase
      .from("fighters")
      .upsert(updated, { onConflict: "name" });
    setSaving(false);
    setEditing(false);
    onSaved?.(updated);
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/70 flex items-end md:items-center justify-center z-50 p-0 md:p-5"
    >
      <div
        onClick={(ev) => ev.stopPropagation()}
        className="bg-panel border border-border rounded-t-2xl md:rounded-2xl w-full md:max-w-md max-h-[85vh] overflow-y-auto p-5"
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <FighterIllustration name={name} size={48} />
            <h3 className="font-display font-semibold text-[20px] text-text">
              {name}
            </h3>
          </div>
          <button onClick={onClose} className="text-dim text-[20px] leading-none">
            ×
          </button>
        </div>

        {loading ? (
          <p className="text-[13px] text-dim">{L.loading}</p>
        ) : editing ? (
          <div className="flex flex-col gap-2.5">
            <input
              placeholder={L.nicknamePlaceholder}
              value={fighter.nickname ?? ""}
              onChange={(e) =>
                setFighter({ ...fighter, nickname: e.target.value })
              }
              className="bg-black/30 border border-border rounded-md px-3 py-2 text-[13px] text-text placeholder:text-dim outline-none focus:border-accent"
            />
            <input
              placeholder={L.sportPlaceholder}
              value={fighter.sport ?? ""}
              onChange={(e) =>
                setFighter({ ...fighter, sport: e.target.value })
              }
              className="bg-black/30 border border-border rounded-md px-3 py-2 text-[13px] text-text placeholder:text-dim outline-none focus:border-accent"
            />
            <input
              placeholder={L.recordPlaceholder}
              value={fighter.record ?? ""}
              onChange={(e) =>
                setFighter({ ...fighter, record: e.target.value })
              }
              className="bg-black/30 border border-border rounded-md px-3 py-2 text-[13px] text-text placeholder:text-dim outline-none focus:border-accent"
            />
            <input
              placeholder={L.photoUrlPlaceholder}
              value={fighter.photo_url ?? ""}
              onChange={(e) =>
                setFighter({ ...fighter, photo_url: e.target.value })
              }
              className="bg-black/30 border border-border rounded-md px-3 py-2 text-[13px] text-text placeholder:text-dim outline-none focus:border-accent"
            />
            <textarea
              placeholder={L.bioPlaceholder}
              rows={3}
              value={fighter.bio ?? ""}
              onChange={(e) => setFighter({ ...fighter, bio: e.target.value })}
              className="bg-black/30 border border-border rounded-md px-3 py-2 text-[13px] text-text placeholder:text-dim outline-none focus:border-accent resize-none"
            />
            <textarea
              placeholder={L.careerPlaceholder}
              rows={4}
              value={fighter.career ?? ""}
              onChange={(e) =>
                setFighter({ ...fighter, career: e.target.value })
              }
              className="bg-black/30 border border-border rounded-md px-3 py-2 text-[13px] text-text placeholder:text-dim outline-none focus:border-accent resize-none"
            />
            <div className="flex gap-2 mt-1">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-accent text-white text-[13px] font-semibold rounded-md py-2 disabled:opacity-50"
              >
                {saving ? L.saving : L.save}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="text-[13px] text-dim px-3"
              >
                {L.cancel}
              </button>
            </div>
          </div>
        ) : (
          <div>
            {fighter.nickname && (
              <p className="text-[13px] text-accent mb-1">
                &quot;{fighter.nickname}&quot;
              </p>
            )}
            {fighter.sport && (
              <p className="text-[12px] text-faint mb-0.5">{fighter.sport}</p>
            )}
            {fighter.record && (
              <p className="text-[12px] text-faint mb-3">
                {L.recordPlaceholder.split(" (")[0]}: {fighter.record}
              </p>
            )}
            {fighter.bio ? (
              <p className="text-[13px] text-muted leading-relaxed mb-3 whitespace-pre-wrap">
                {fighter.bio}
              </p>
            ) : (
              <p className="text-[13px] text-dim mb-3">
                {L.noProfileYet} {name}.
              </p>
            )}
            {fighter.career && (
              <>
                <h4 className="text-[12px] font-semibold text-text mb-1">
                  {L.career}
                </h4>
                <p className="text-[13px] text-muted leading-relaxed whitespace-pre-wrap">
                  {fighter.career}
                </p>
              </>
            )}
            {isAdmin && (
              <button
                onClick={() => setEditing(true)}
                className="text-[13px] text-accent mt-4"
              >
                {fighter.bio ? L.editProfile : L.addProfile}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EventCard({
  e,
  isFav,
  isOpen,
  onToggle,
  onSelectFighter,
  L,
}: {
  e: FightEvent;
  isFav: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onSelectFighter: (name: string) => void;
  L: Strings;
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
            {dLeft === 0
              ? L.today
              : dLeft > 0
              ? `${L.daysPrefix}${dLeft}${L.daysSuffix}`
              : L.past}
          </span>
        </div>

        {e.fighters && (
          <div className="flex items-center justify-between mb-2 px-1">
            <FighterAvatar
              name={e.fighters[0]}
              onClick={() => onSelectFighter(e.fighters![0])}
            />
            <span className="text-[11px] text-dim font-semibold">VS</span>
            <FighterAvatar
              name={e.fighters[1]}
              onClick={() => onSelectFighter(e.fighters![1])}
            />
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
                      {L.watchOn} {l.label} ↗
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
              {links.length > 0 ? L.tapForDetailsWatch : L.tapForDetails}
            </p>
          )
        )}
      </div>
    </div>
  );
}

const TABS = ["events", "favorites", "fighters", "forum", "account"] as const;
type TabId = (typeof TABS)[number];

type Lang = "en" | "de";

const STRINGS = {
  en: {
    tabEvents: "Events",
    tabFavorites: "Favorites",
    tabFighters: "Fighters",
    tabForum: "Forum",
    tabAccount: "Account",
    noEvents: "No events.",
    adjustFilter: "Adjust the filter.",
    tapForDetails: "Tap for details",
    tapForDetailsWatch: "Tap for details & where to watch",
    watchOn: "Watch on",
    today: "today",
    past: "past",
    daysPrefix: "in ",
    daysSuffix: " days",
    anonymous: "Anonymous",
    by: "by",
    footerNote:
      "Seed data researched manually, as of late Aug 2026. Cards and cancellations change — always confirm with the promotion directly.",
    favStarPrompt: "Star a promotion to follow its events here.",
    noFavYet: "No favorites yet.",
    noFavHint: "Star a promotion above to see its events here.",
    nextFight: "Next:",
    noUpcoming: "No upcoming fights listed.",
    noFightersYet: "No fighters listed yet.",
    forumTitle: "Forum",
    forumSubtitle: "Talk fights with other fans.",
    forumLoginToPost: "Log in to start a new thread.",
    threadTitlePlaceholder: "Thread title",
    firstMessagePlaceholder: "First message (optional)",
    newThread: "New thread",
    noThreadsYet: "No threads yet — start the first one.",
    backToThreads: "← Back to threads",
    deleteThread: "Delete thread",
    delete: "Delete",
    noRepliesYet: "No replies yet.",
    replyPlaceholder: "Write a reply…",
    reply: "Reply",
    forumLoginToReply: "Log in to reply to this thread.",
    createAccount: "Create account",
    logIn: "Log in",
    signupSubtitle:
      "Sign up to sync your favorites across devices and get notified before events start.",
    email: "Email",
    password: "Password",
    signUp: "Sign up",
    pleaseWait: "Please wait…",
    haveAccount: "Already have an account? Log in",
    newHere: "New here? Create an account",
    loggedInAs: "Logged in as",
    adminBadge: "★ Admin — you can edit fighter profiles",
    forumUsername: "Forum username:",
    chooseUsername: "Choose a forum username (your email stays private):",
    usernamePlaceholder: "Username",
    save: "Save",
    logOut: "Log out",
    confirmEmailNotice: "Check your email to confirm your account.",
    loading: "Loading…",
    noProfileYet: "No profile yet for",
    career: "Career",
    editProfile: "Edit profile",
    addProfile: "Add profile",
    cancel: "Cancel",
    saving: "Saving…",
    nicknamePlaceholder: "Nickname",
    sportPlaceholder: "Sport",
    recordPlaceholder: "Record (e.g. 18-3-0)",
    photoUrlPlaceholder: "Photo URL",
    bioPlaceholder: "Bio",
    careerPlaceholder: "Career history",
    cookieText:
      "We only store technically necessary data in your browser (login status, favorites) — no advertising or tracking cookies. More in our",
    cookieLink: "Privacy Policy",
    cookieAccept: "Got it",
  },
  de: {
    tabEvents: "Events",
    tabFavorites: "Favoriten",
    tabFighters: "Kämpfer",
    tabForum: "Forum",
    tabAccount: "Konto",
    noEvents: "Keine Events.",
    adjustFilter: "Filter anpassen.",
    tapForDetails: "Antippen für Details",
    tapForDetailsWatch: "Antippen für Details & wo man's schauen kann",
    watchOn: "Schauen auf",
    today: "heute",
    past: "vergangen",
    daysPrefix: "in ",
    daysSuffix: " Tagen",
    anonymous: "Anonym",
    by: "von",
    footerNote:
      "Daten manuell recherchiert, Stand Ende Aug 2026. Termine und Absagen ändern sich — bitte immer bei der Promotion direkt bestätigen lassen.",
    favStarPrompt: "Markiere eine Promotion, um ihre Events hier zu sehen.",
    noFavYet: "Noch keine Favoriten.",
    noFavHint: "Markiere oben eine Promotion, um ihre Events hier zu sehen.",
    nextFight: "Nächster Fight:",
    noUpcoming: "Keine anstehenden Fights gelistet.",
    noFightersYet: "Noch keine Fighter gelistet.",
    forumTitle: "Forum",
    forumSubtitle: "Sprich mit anderen Fans über Fights.",
    forumLoginToPost: "Melde dich an, um einen neuen Thread zu starten.",
    threadTitlePlaceholder: "Thread-Titel",
    firstMessagePlaceholder: "Erste Nachricht (optional)",
    newThread: "Neuer Thread",
    noThreadsYet: "Noch keine Threads — starte den ersten.",
    backToThreads: "← Zurück zu den Threads",
    deleteThread: "Thread löschen",
    delete: "Löschen",
    noRepliesYet: "Noch keine Antworten.",
    replyPlaceholder: "Antwort schreiben…",
    reply: "Antworten",
    forumLoginToReply: "Melde dich an, um auf diesen Thread zu antworten.",
    createAccount: "Konto erstellen",
    logIn: "Anmelden",
    signupSubtitle:
      "Registrier dich, um deine Favoriten geräteübergreifend zu synchronisieren und vor Events benachrichtigt zu werden.",
    email: "E-Mail",
    password: "Passwort",
    signUp: "Registrieren",
    pleaseWait: "Einen Moment…",
    haveAccount: "Schon ein Konto? Anmelden",
    newHere: "Neu hier? Konto erstellen",
    loggedInAs: "Angemeldet als",
    adminBadge: "★ Admin — du kannst Fighter-Profile bearbeiten",
    forumUsername: "Forum-Username:",
    chooseUsername:
      "Wähle einen Forum-Usernamen (deine E-Mail bleibt privat):",
    usernamePlaceholder: "Username",
    save: "Speichern",
    logOut: "Abmelden",
    confirmEmailNotice: "Bestätige dein Konto über den Link in deiner E-Mail.",
    loading: "Lädt…",
    noProfileYet: "Noch kein Profil für",
    career: "Werdegang",
    editProfile: "Profil bearbeiten",
    addProfile: "Profil hinzufügen",
    cancel: "Abbrechen",
    saving: "Speichert…",
    nicknamePlaceholder: "Spitzname",
    sportPlaceholder: "Sportart",
    recordPlaceholder: "Bilanz (z.B. 18-3-0)",
    photoUrlPlaceholder: "Foto-URL",
    bioPlaceholder: "Bio",
    careerPlaceholder: "Werdegang",
    cookieText:
      "Wir speichern nur technisch notwendige Daten in deinem Browser (Login-Status, Favoriten) — keine Werbe- oder Tracking-Cookies. Mehr dazu in unserer",
    cookieLink: "Datenschutzerklärung",
    cookieAccept: "Verstanden",
  },
} as const;

type Strings = { [K in keyof (typeof STRINGS)["en"]]: string };

type ForumThread = {
  id: string;
  title: string;
  created_at: string;
  created_by: string | null;
  profiles?: { username: string | null } | null;
};

type ForumPost = {
  id: string;
  thread_id: string;
  content: string;
  created_at: string;
  user_id: string | null;
  profiles?: { username: string | null } | null;
};

export default function Home() {
  const [tab, setTab] = useState<TabId>("events");
  const [lang, setLang] = useState<Lang>("en");
  const [filter, setFilter] = useState("All");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameSaving, setUsernameSaving] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [selectedFighter, setSelectedFighter] = useState<string | null>(null);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadBody, setNewThreadBody] = useState("");
  const [openThread, setOpenThread] = useState<ForumThread | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [forumError, setForumError] = useState<string | null>(null);
  const [fightersData, setFightersData] = useState<
    Record<string, FighterRow>
  >({});
  const [fightersLoaded, setFightersLoaded] = useState(false);

  useEffect(() => {
    if (tab !== "fighters" || fightersLoaded) return;
    supabase
      .from("fighters")
      .select("*")
      .then(({ data }) => {
        const byName: Record<string, FighterRow> = {};
        (data as FighterRow[] | null)?.forEach((f) => (byName[f.name] = f));
        setFightersData(byName);
        setFightersLoaded(true);
      });
  }, [tab, fightersLoaded]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("fightbase:favorites");
      if (stored) setFavorites(JSON.parse(stored));
      const storedLang = localStorage.getItem("fightbase:lang");
      if (storedLang === "de" || storedLang === "en") setLang(storedLang);
    } catch (e) {
      // ignore
    }
    setLoaded(true);
  }, []);

  function changeLang(next: Lang) {
    setLang(next);
    try {
      localStorage.setItem("fightbase:lang", next);
    } catch (e) {
      // ignore
    }
  }

  const L = STRINGS[lang];

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => setSession(newSession)
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setIsAdmin(false);
      setUsername(null);
      return;
    }
    supabase
      .from("profiles")
      .select("role, username")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        setIsAdmin(data?.role === "admin");
        setUsername(data?.username ?? null);
      });
  }, [session]);

  async function handleSaveUsername(ev: React.FormEvent) {
    ev.preventDefault();
    if (!session || !usernameInput.trim()) return;
    setUsernameSaving(true);
    setUsernameError(null);
    const { error } = await supabase
      .from("profiles")
      .update({ username: usernameInput.trim() })
      .eq("id", session.user.id);
    setUsernameSaving(false);
    if (error) {
      setUsernameError(
        error.message.includes("duplicate")
          ? "Username is already taken."
          : error.message
      );
    } else {
      setUsername(usernameInput.trim());
    }
  }

  function loadThreads() {
    setThreadsLoading(true);
    supabase
      .from("forum_threads")
      .select("id, title, created_at, created_by, profiles(username)")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setThreads((data as unknown as ForumThread[]) ?? []);
        setThreadsLoading(false);
      });
  }

  useEffect(() => {
    if (tab === "forum" && !openThread) loadThreads();
  }, [tab, openThread]);

  async function handleCreateThread(ev: React.FormEvent) {
    ev.preventDefault();
    if (!session) return;
    setForumError(null);
    const { data: thread, error } = await supabase
      .from("forum_threads")
      .insert({ title: newThreadTitle, created_by: session.user.id })
      .select()
      .single();
    if (error || !thread) {
      setForumError(error?.message ?? "Could not create thread.");
      return;
    }
    if (newThreadBody.trim()) {
      await supabase.from("forum_posts").insert({
        thread_id: thread.id,
        user_id: session.user.id,
        content: newThreadBody,
      });
    }
    setNewThreadTitle("");
    setNewThreadBody("");
    loadThreads();
  }

  function openThreadView(t: ForumThread) {
    setOpenThread(t);
    setPostsLoading(true);
    supabase
      .from("forum_posts")
      .select("id, thread_id, content, created_at, user_id, profiles(username)")
      .eq("thread_id", t.id)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setPosts((data as unknown as ForumPost[]) ?? []);
        setPostsLoading(false);
      });
  }

  async function handleReply(ev: React.FormEvent) {
    ev.preventDefault();
    if (!session || !openThread || !newPost.trim()) return;
    await supabase.from("forum_posts").insert({
      thread_id: openThread.id,
      user_id: session.user.id,
      content: newPost,
    });
    setNewPost("");
    openThreadView(openThread);
  }

  async function handleDeletePost(postId: string) {
    await supabase.from("forum_posts").delete().eq("id", postId);
    if (openThread) openThreadView(openThread);
  }

  async function handleDeleteThread(threadId: string) {
    await supabase.from("forum_threads").delete().eq("id", threadId);
    setOpenThread(null);
    loadThreads();
  }

  async function handleAuthSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setAuthError(null);
    setAuthNotice(null);
    setAuthLoading(true);
    const { error } =
      authMode === "signup"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });
    setAuthLoading(false);
    if (error) {
      setAuthError(error.message);
    } else if (authMode === "signup") {
      setAuthNotice(L.confirmEmailNotice);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

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

  const fighterList = useMemo(() => {
    const names = Array.from(
      new Set(EVENTS.flatMap((e) => e.fighters ?? []))
    ).sort();
    return names.map((name) => ({
      name,
      upcoming: EVENTS.filter(
        (e) => e.fighters?.includes(name) && daysUntil(e.date) >= 0
      ).sort((a, b) => (a.date > b.date ? 1 : -1)),
    }));
  }, []);

  return (
    <div className="max-w-[480px] md:max-w-3xl lg:max-w-5xl mx-auto min-h-screen pb-10">
      {/* Header */}
      <header className="px-5 pt-7 pb-4 border-b border-border flex items-center gap-3">
        <Image
          src="/logo-header.png"
          alt="Fightbase logo"
          width={40}
          height={40}
          className="rounded-[9px] shrink-0"
        />
        <div className="flex-1">
          <h1 className="font-display font-bold text-[28px] tracking-wide text-text">
            FIGHTBASE
          </h1>
          <p className="text-[13px] text-faint mt-1">
            Boxing · MMA · Muay Thai · Kickboxing · Jiu-Jitsu · Judo ·
            Wrestling · Karate · Taekwondo
          </p>
        </div>
        <div className="flex gap-1 shrink-0 border border-border rounded-md p-0.5">
          {(["en", "de"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => changeLang(l)}
              className={`text-[11px] font-semibold px-2 py-1 rounded ${
                lang === l ? "bg-accent text-white" : "text-dim"
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      {/* Tab bar */}
      <div className="flex px-5 border-b border-border md:justify-center md:gap-10">
        {TABS.map((id) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 md:flex-none text-[13px] font-semibold py-3 border-b-2 transition-colors ${
              tab === id
                ? "border-accent text-text"
                : "border-transparent text-faint"
            }`}
          >
            {
              {
                events: L.tabEvents,
                favorites: L.tabFavorites,
                fighters: L.tabFighters,
                forum: L.tabForum,
                account: L.tabAccount,
              }[id]
            }
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
          <main className="px-5 pt-5 flex flex-col gap-[18px] md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-5 lg:grid-cols-3">
            {filtered.length === 0 && (
              <div className="text-center py-10 md:col-span-full">
                <p className="text-[15px] text-text mb-1">{L.noEvents}</p>
                <p className="text-[13px] text-dim">{L.adjustFilter}</p>
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
                onSelectFighter={setSelectedFighter}
                L={L}
              />
            ))}
          </main>

          <footer className="px-5 pt-6">
            <p className="text-[11px] text-[#4A4A4E] leading-relaxed">
              {L.footerNote}
            </p>
          </footer>
        </>
      )}

      {tab === "favorites" && (
        <>
          <div className="px-5 pt-4 pb-4 border-b border-border">
            <p className="text-[13px] text-muted mb-2.5">
              {L.favStarPrompt}
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

          <main className="px-5 pt-5 flex flex-col gap-[18px] pb-6 md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-5 lg:grid-cols-3">
            {favoriteEvents.length === 0 && (
              <div className="text-center py-10 md:col-span-full">
                <p className="text-[15px] text-text mb-1">{L.noFavYet}</p>
                <p className="text-[13px] text-dim">{L.noFavHint}</p>
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
                onSelectFighter={setSelectedFighter}
                L={L}
              />
            ))}
          </main>
        </>
      )}

      {tab === "fighters" && (
        <main className="px-5 pt-5 pb-10 flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-3">
          {fighterList.map(({ name, upcoming }) => {
            const info = fightersData[name];
            const next = upcoming[0];
            return (
              <button
                key={name}
                onClick={() => setSelectedFighter(name)}
                className="text-left border border-border bg-panel rounded-[10px] p-3.5 hover:border-accent transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <FighterIllustration name={name} size={44} />
                  <div>
                    <p className="text-[15px] font-semibold text-text">
                      {name}
                    </p>
                    {(info?.sport || info?.record) && (
                      <p className="text-[12px] text-faint">
                        {[info?.sport, info?.record]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                </div>
                {next ? (
                  <p className="text-[12px] text-muted">
                    {L.nextFight}{" "}
                    <span className="text-text">
                      {next.main} · {next.promotion}
                    </span>{" "}
                    · {L.daysPrefix}
                    {daysUntil(next.date)}
                    {L.daysSuffix}
                  </p>
                ) : (
                  <p className="text-[12px] text-dim">{L.noUpcoming}</p>
                )}
              </button>
            );
          })}
          {fighterList.length === 0 && (
            <p className="text-[13px] text-dim md:col-span-full">
              {L.noFightersYet}
            </p>
          )}
        </main>
      )}

      {tab === "forum" && (
        <main className="px-5 pt-5 pb-10 md:max-w-2xl md:mx-auto">
          {openThread ? (
            <>
              <button
                onClick={() => setOpenThread(null)}
                className="text-[13px] text-accent mb-3"
              >
                {L.backToThreads}
              </button>
              <div className="flex justify-between items-start mb-4">
                <h2 className="font-display font-semibold text-[19px] text-text">
                  {openThread.title}
                </h2>
                {session &&
                  (isAdmin || session.user.id === openThread.created_by) && (
                    <button
                      onClick={() => handleDeleteThread(openThread.id)}
                      className="text-[12px] text-accent shrink-0 ml-3"
                    >
                      {L.deleteThread}
                    </button>
                  )}
              </div>

              {postsLoading ? (
                <p className="text-[13px] text-dim">{L.loading}</p>
              ) : (
                <div className="flex flex-col gap-3 mb-5">
                  {posts.map((p) => (
                    <div
                      key={p.id}
                      className="border border-border bg-panel rounded-[10px] p-3"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-[12px] text-accent font-semibold">
                          {p.profiles?.username ?? L.anonymous}
                        </p>
                        {session &&
                          (isAdmin || session.user.id === p.user_id) && (
                            <button
                              onClick={() => handleDeletePost(p.id)}
                              className="text-[11px] text-dim hover:text-accent"
                            >
                              {L.delete}
                            </button>
                          )}
                      </div>
                      <p className="text-[13px] text-muted whitespace-pre-wrap">
                        {p.content}
                      </p>
                    </div>
                  ))}
                  {posts.length === 0 && (
                    <p className="text-[13px] text-dim">{L.noRepliesYet}</p>
                  )}
                </div>
              )}

              {session ? (
                <form onSubmit={handleReply} className="flex flex-col gap-2">
                  <textarea
                    required
                    rows={3}
                    placeholder={L.replyPlaceholder}
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="bg-panel border border-border rounded-md px-3.5 py-2.5 text-[14px] text-text placeholder:text-dim outline-none focus:border-accent resize-none"
                  />
                  <button
                    type="submit"
                    className="bg-accent text-white text-[14px] font-semibold rounded-md py-2.5 self-start px-5"
                  >
                    {L.reply}
                  </button>
                </form>
              ) : (
                <p className="text-[13px] text-dim">{L.forumLoginToReply}</p>
              )}
            </>
          ) : (
            <>
              <h2 className="font-display font-semibold text-[19px] text-text mb-1">
                {L.forumTitle}
              </h2>
              <p className="text-[13px] text-dim mb-5">{L.forumSubtitle}</p>

              {session ? (
                <form
                  onSubmit={handleCreateThread}
                  className="flex flex-col gap-2 mb-6 border-b border-border pb-6"
                >
                  <input
                    required
                    placeholder={L.threadTitlePlaceholder}
                    value={newThreadTitle}
                    onChange={(e) => setNewThreadTitle(e.target.value)}
                    className="bg-panel border border-border rounded-md px-3.5 py-2.5 text-[14px] text-text placeholder:text-dim outline-none focus:border-accent"
                  />
                  <textarea
                    rows={2}
                    placeholder={L.firstMessagePlaceholder}
                    value={newThreadBody}
                    onChange={(e) => setNewThreadBody(e.target.value)}
                    className="bg-panel border border-border rounded-md px-3.5 py-2.5 text-[14px] text-text placeholder:text-dim outline-none focus:border-accent resize-none"
                  />
                  <button
                    type="submit"
                    className="bg-accent text-white text-[14px] font-semibold rounded-md py-2.5 self-start px-5"
                  >
                    {L.newThread}
                  </button>
                  {forumError && (
                    <p className="text-[12px] text-accent">{forumError}</p>
                  )}
                </form>
              ) : (
                <p className="text-[13px] text-dim mb-6 border-b border-border pb-6">
                  {L.forumLoginToPost}
                </p>
              )}

              {threadsLoading ? (
                <p className="text-[13px] text-dim">{L.loading}</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {threads.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => openThreadView(t)}
                      className="text-left border border-border bg-panel rounded-[10px] p-3.5 hover:border-accent transition-colors"
                    >
                      <p className="text-[14px] font-semibold text-text">
                        {t.title}
                      </p>
                      <p className="text-[12px] text-faint mt-0.5">
                        {L.by} {t.profiles?.username ?? L.anonymous}
                      </p>
                    </button>
                  ))}
                  {threads.length === 0 && (
                    <p className="text-[13px] text-dim">{L.noThreadsYet}</p>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      )}

      {tab === "account" && (
        <main className="px-5 pt-6 pb-10 md:max-w-sm md:mx-auto">
          {session ? (
            <>
              <h2 className="font-display font-semibold text-[20px] text-text mb-1">
                {L.tabAccount}
              </h2>
              <p className="text-[13px] text-muted mb-1">
                {L.loggedInAs} {session.user.email}
              </p>
              {isAdmin && (
                <p className="text-[12px] text-accent font-semibold mb-4">
                  {L.adminBadge}
                </p>
              )}
              {!isAdmin && <div className="mb-4" />}

              <div className="mb-5">
                {username ? (
                  <p className="text-[13px] text-muted">
                    {L.forumUsername}{" "}
                    <span className="text-text">{username}</span>
                  </p>
                ) : (
                  <form
                    onSubmit={handleSaveUsername}
                    className="flex flex-col gap-2"
                  >
                    <label className="text-[12px] text-dim">
                      {L.chooseUsername}
                    </label>
                    <div className="flex gap-2">
                      <input
                        required
                        minLength={3}
                        placeholder={L.usernamePlaceholder}
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        className="flex-1 bg-panel border border-border rounded-md px-3 py-2 text-[13px] text-text placeholder:text-dim outline-none focus:border-accent"
                      />
                      <button
                        type="submit"
                        disabled={usernameSaving}
                        className="bg-accent text-white text-[13px] font-semibold rounded-md px-4 disabled:opacity-50"
                      >
                        {L.save}
                      </button>
                    </div>
                    {usernameError && (
                      <p className="text-[12px] text-accent">
                        {usernameError}
                      </p>
                    )}
                  </form>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="text-[14px] font-semibold rounded-md py-2.5 px-4 border border-border text-text"
              >
                {L.logOut}
              </button>
            </>
          ) : (
            <>
              <h2 className="font-display font-semibold text-[20px] text-text mb-1">
                {authMode === "signup" ? L.createAccount : L.logIn}
              </h2>
              <p className="text-[13px] text-dim mb-5">{L.signupSubtitle}</p>

              <form onSubmit={handleAuthSubmit} className="flex flex-col gap-3">
                <input
                  type="email"
                  required
                  placeholder={L.email}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-panel border border-border rounded-md px-3.5 py-2.5 text-[14px] text-text placeholder:text-dim outline-none focus:border-accent"
                />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder={L.password}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-panel border border-border rounded-md px-3.5 py-2.5 text-[14px] text-text placeholder:text-dim outline-none focus:border-accent"
                />
                <button
                  type="submit"
                  disabled={authLoading}
                  className="bg-accent text-white text-[14px] font-semibold rounded-md py-2.5 disabled:opacity-50"
                >
                  {authLoading
                    ? L.pleaseWait
                    : authMode === "signup"
                    ? L.signUp
                    : L.logIn}
                </button>
                {authError && (
                  <p className="text-[12px] text-accent text-center">
                    {authError}
                  </p>
                )}
                {authNotice && (
                  <p className="text-[12px] text-dim text-center">
                    {authNotice}
                  </p>
                )}
              </form>

              <button
                onClick={() =>
                  setAuthMode(authMode === "signup" ? "login" : "signup")
                }
                className="text-[13px] text-accent mt-4"
              >
                {authMode === "signup" ? L.haveAccount : L.newHere}
              </button>
            </>
          )}
        </main>
      )}

      {selectedFighter && (
        <FighterModal
          name={selectedFighter}
          isAdmin={isAdmin}
          onClose={() => setSelectedFighter(null)}
          onSaved={(f) =>
            setFightersData((prev) => ({ ...prev, [f.name]: f }))
          }
          L={L}
        />
      )}

      <div className="px-5 py-6 flex gap-4 justify-center border-t border-border mt-4">
        <Link href="/impressum" className="text-[12px] text-dim">
          Impressum
        </Link>
        <Link href="/datenschutz" className="text-[12px] text-dim">
          Datenschutz
        </Link>
      </div>
    </div>
  );
}
