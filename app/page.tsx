"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

import {
  EVENTS,
  SPORTS,
  formatDate,
  daysUntil,
  watchLinks,
  fighterSlug,
  allFighterNames,
  upcomingFightsFor,
  type FightEvent,
} from "@/lib/events";
import FighterIllustration from "@/components/FighterIllustration";

function FighterAvatar({
  name,
  photoUrl,
  onClick,
}: {
  name: string;
  photoUrl?: string | null;
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
      <FighterIllustration name={name} size={44} photoUrl={photoUrl} />
      <span className="text-[11px] text-muted text-center leading-tight">
        {name}
      </span>
    </button>
  );
}

type FighterRow = {
  name: string;
  slug?: string | null;
  nickname: string | null;
  sport: string | null;
  record: string | null;
  bio: string | null;
  career: string | null;
  photo_url: string | null;
  photo_credit?: string | null;
  claimed_by?: string | null;
};

function FighterModal({
  name,
  canEdit,
  isFav,
  onToggleFav,
  onClose,
  onSaved,
  L,
}: {
  name: string;
  canEdit: boolean;
  isFav: boolean;
  onToggleFav?: () => void;
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
            <FighterIllustration
              name={name}
              size={48}
              photoUrl={fighter.photo_url}
            />
            <h3 className="font-display font-semibold text-[20px] text-text">
              {name}
            </h3>
            {onToggleFav && (
              <button
                onClick={onToggleFav}
                className={`text-[17px] leading-none ${
                  isFav ? "text-accent" : "text-dim"
                }`}
                aria-label="Favorite this fighter"
              >
                {isFav ? "★" : "☆"}
              </button>
            )}
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
            {fighter.photo_url && fighter.photo_credit && (
              <p className="text-[10px] text-dim mt-3">
                {fighter.photo_credit}
              </p>
            )}
            <Link
              href={`/fighters/${fighterSlug(name)}`}
              className="text-[13px] text-dim underline block mt-4"
            >
              View full profile page ↗
            </Link>
            {canEdit && (
              <button
                onClick={() => setEditing(true)}
                className="text-[13px] text-accent mt-2"
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
  isEventFav,
  onToggleEventFav,
  isOpen,
  onToggle,
  onSelectFighter,
  fightersData,
  L,
}: {
  e: FightEvent;
  isFav: boolean;
  isEventFav: boolean;
  onToggleEventFav?: () => void;
  isOpen: boolean;
  onToggle: () => void;
  onSelectFighter: (name: string) => void;
  fightersData: Record<string, FighterRow>;
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
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-dim">
              {dLeft === 0
                ? L.today
                : dLeft > 0
                ? `${L.daysPrefix}${dLeft}${L.daysSuffix}`
                : L.past}
            </span>
            {onToggleEventFav && (
              <button
                onClick={(ev) => {
                  ev.stopPropagation();
                  onToggleEventFav();
                }}
                className={`text-[13px] leading-none ${
                  isEventFav ? "text-accent" : "text-dim"
                }`}
                aria-label="Favorite this event"
              >
                {isEventFav ? "★" : "☆"}
              </button>
            )}
          </div>
        </div>

        {e.fighters && (
          <div className="flex items-center justify-between mb-2 px-1">
            <FighterAvatar
              name={e.fighters[0]}
              photoUrl={fightersData[e.fighters[0]]?.photo_url}
              onClick={() => onSelectFighter(e.fighters![0])}
            />
            <span className="text-[11px] text-dim font-semibold">VS</span>
            <FighterAvatar
              name={e.fighters[1]}
              photoUrl={fightersData[e.fighters[1]]?.photo_url}
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
            {e.undercard && e.undercard.length > 0 && (
              <div className="mb-2">
                {e.undercard.map((fight, i) => (
                  <p key={i} className="text-[12px] text-muted">
                    Pre Card {i + 1}: {fight}
                  </p>
                ))}
              </div>
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
            <Link
              href={`/events/${e.id}`}
              className="text-[11px] text-dim underline block mt-2"
            >
              Permalink ↗
            </Link>
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

const FAQ = [
  {
    q: "What is the best way to keep track of upcoming combat sports events?",
    a: "Fightbase is a free, independent calendar that lists upcoming Boxing, MMA, Muay Thai, Kickboxing, Jiu-Jitsu, Judo, Wrestling, Karate and Taekwondo events in one place, so you don't have to check a dozen different promotion websites separately.",
  },
  {
    q: "Does Fightbase cover more than just MMA and boxing?",
    a: "Yes — Fightbase tracks nine combat sports: Boxing, MMA, Muay Thai, Kickboxing, Jiu-Jitsu, Judo, Wrestling, Karate and Taekwondo, and you can filter the calendar by any combination of them.",
  },
  {
    q: "Is Fightbase free to use?",
    a: "Yes, Fightbase is completely free and doesn't sell tickets. For each event it links to the official broadcaster or promotion so you know exactly where to watch.",
  },
  {
    q: "Can I follow a specific fighter or promotion?",
    a: "Yes — star your favorite promotions to follow their events, and every fighter has their own profile page showing upcoming fights. Fighters can also register and maintain their own profile directly on Fightbase.",
  },
];

const TABS = ["events", "favorites", "fighters", "forum", "account"] as const;
type TabId = (typeof TABS)[number];

type Lang = "en" | "de";

type FavoriteType = "sport" | "fighter" | "promotion" | "event";
type Favorite = { type: FavoriteType; value: string };

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
    noFavHint: "Star a sport, promotion, fighter or event to see it here.",
    favLoginPrompt:
      "Log in to save favorites and get notified about new events.",
    favSportsLabel: "Sports",
    favPromotionsLabel: "Promotions",
    favFightersLabel: "Fighters",
    favEventsLabel: "Events",
    noFavFighters: "No favorite fighters yet — star one from the Fighters tab.",
    noFavEvents: "No favorite events yet — star one on an event card.",
    favUpcomingLabel: "Upcoming",
    emailNotifLabel:
      "Email me about new events and reminders for my favorites",
    notifPromptTitle: "Stay in the loop?",
    notifPromptBody:
      "Get an email when a new event matches your favorites, or when one you're following is coming up in a few days.",
    notifPromptYes: "Yes, notify me",
    notifPromptNo: "No thanks",
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
    legalImprint: "Legal Notice",
    legalPrivacy: "Privacy Policy",
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
    noFavHint:
      "Markiere eine Sportart, Promotion, Fighter oder ein Event, um es hier zu sehen.",
    favLoginPrompt:
      "Melde dich an, um Favoriten zu speichern und über neue Events benachrichtigt zu werden.",
    favSportsLabel: "Sportarten",
    favPromotionsLabel: "Promotions",
    favFightersLabel: "Kämpfer",
    favEventsLabel: "Events",
    noFavFighters:
      "Noch keine Lieblingskämpfer — markiere einen im Kämpfer-Tab.",
    noFavEvents:
      "Noch keine Lieblings-Events — markiere eins auf einer Event-Karte.",
    favUpcomingLabel: "Anstehend",
    emailNotifLabel:
      "Per E-Mail über neue Events und Erinnerungen zu meinen Favoriten informieren",
    notifPromptTitle: "Auf dem Laufenden bleiben?",
    notifPromptBody:
      "Bekomm eine E-Mail, wenn ein neues Event zu deinen Favoriten passt oder eins davon in ein paar Tagen ansteht.",
    notifPromptYes: "Ja, benachrichtigen",
    notifPromptNo: "Nein danke",
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
    legalImprint: "Impressum",
    legalPrivacy: "Datenschutz",
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
  const [filter, setFilter] = useState<string[]>([]);
  const [fighterSportFilter, setFighterSportFilter] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [showNotifPrompt, setShowNotifPrompt] = useState(false);
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
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [regName, setRegName] = useState("");
  const [regNickname, setRegNickname] = useState("");
  const [regSport, setRegSport] = useState("");
  const [regRecord, setRegRecord] = useState("");
  const [regBio, setRegBio] = useState("");
  const [regCareer, setRegCareer] = useState("");
  const [regError, setRegError] = useState<string | null>(null);
  const [regSaving, setRegSaving] = useState(false);
  const [fighterSearch, setFighterSearch] = useState("");
  const [eventSearch, setEventSearch] = useState("");

  useEffect(() => {
    if (fightersLoaded) return;
    supabase
      .from("fighters")
      .select("*")
      .then(({ data }) => {
        const byName: Record<string, FighterRow> = {};
        (data as FighterRow[] | null)?.forEach((f) => (byName[f.name] = f));
        setFightersData(byName);
        setFightersLoaded(true);
      });
  }, [fightersLoaded]);

  useEffect(() => {
    try {
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
      .select("role, username, email_notifications, notif_prompt_seen")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        setIsAdmin(data?.role === "admin");
        setUsername(data?.username ?? null);
        setEmailNotifications(!!data?.email_notifications);
        if (data && !data.notif_prompt_seen) setShowNotifPrompt(true);
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

  async function handleRegisterFighter(ev: React.FormEvent) {
    ev.preventDefault();
    if (!session || !regName.trim()) return;
    setRegSaving(true);
    setRegError(null);
    const name = regName.trim();
    const slug = fighterSlug(name);
    const { data, error } = await supabase
      .from("fighters")
      .insert({
        name,
        slug,
        nickname: regNickname.trim() || null,
        sport: regSport.trim() || null,
        record: regRecord.trim() || null,
        bio: regBio.trim() || null,
        career: regCareer.trim() || null,
        claimed_by: session.user.id,
      })
      .select()
      .single();
    setRegSaving(false);
    if (error) {
      setRegError(
        error.message.includes("duplicate")
          ? "A fighter with that name already exists."
          : error.message
      );
      return;
    }
    setFightersData((prev) => ({ ...prev, [name]: data as FighterRow }));
    setShowRegisterForm(false);
    setRegName("");
    setRegNickname("");
    setRegSport("");
    setRegRecord("");
    setRegBio("");
    setRegCareer("");
    setSelectedFighter(name);
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
    if (!session) {
      setFavorites([]);
      setEmailNotifications(false);
      return;
    }
    supabase
      .from("favorites")
      .select("type, value")
      .then(({ data }) => {
        setFavorites((data as Favorite[] | null) ?? []);
      });
  }, [session]);

  function isFavorited(type: FavoriteType, value: string) {
    return favorites.some((f) => f.type === type && f.value === value);
  }

  async function toggleFavorite(type: FavoriteType, value: string) {
    if (!session) return;
    const already = isFavorited(type, value);
    setFavorites((prev) =>
      already
        ? prev.filter((f) => !(f.type === type && f.value === value))
        : [...prev, { type, value }]
    );
    if (already) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", session.user.id)
        .eq("type", type)
        .eq("value", value);
    } else {
      await supabase
        .from("favorites")
        .insert({ user_id: session.user.id, type, value });
    }
  }

  async function handleToggleEmailNotifications() {
    if (!session) return;
    const next = !emailNotifications;
    setEmailNotifications(next);
    await supabase
      .from("profiles")
      .update({ email_notifications: next })
      .eq("id", session.user.id);
  }

  async function handleNotifPromptChoice(enable: boolean) {
    if (!session) return;
    setEmailNotifications(enable);
    setShowNotifPrompt(false);
    await supabase
      .from("profiles")
      .update({ email_notifications: enable, notif_prompt_seen: true })
      .eq("id", session.user.id);
  }

  function toggleSport(
    sport: string,
    current: string[],
    setter: (v: string[]) => void
  ) {
    if (sport === "All") {
      setter([]);
      return;
    }
    setter(
      current.includes(sport)
        ? current.filter((s) => s !== sport)
        : [...current, sport]
    );
  }

  const allPromotions = useMemo(
    () => Array.from(new Set(EVENTS.map((e) => e.promotion))),
    []
  );

  const filtered = useMemo(() => {
    const q = eventSearch.trim().toLowerCase();
    return EVENTS.filter((e) => {
      if (filter.length > 0 && !filter.includes(e.sport)) return false;
      if (!q) return true;
      const haystack = [
        e.title,
        e.main,
        e.promotion,
        e.venue,
        ...(e.fighters ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    }).sort((a, b) => (a.date > b.date ? 1 : -1));
  }, [filter, eventSearch]);

  const favoriteFighters = useMemo(
    () => favorites.filter((f) => f.type === "fighter").map((f) => f.value),
    [favorites]
  );

  const favoriteEvents = useMemo(() => {
    return EVENTS.filter((e) =>
      favorites.some((f) => {
        if (f.type === "promotion") return f.value === e.promotion;
        if (f.type === "sport") return f.value === e.sport;
        if (f.type === "event") return f.value === e.id;
        if (f.type === "fighter") return e.fighters?.includes(f.value);
        return false;
      })
    ).sort((a, b) => (a.date > b.date ? 1 : -1));
  }, [favorites]);

  const fighterList = useMemo(() => {
    const names = Array.from(
      new Set([...allFighterNames(), ...Object.keys(fightersData)])
    ).sort();
    return names.map((name) => ({
      name,
      upcoming: upcomingFightsFor(name),
    }));
  }, [fightersData]);

  const visibleFighters = useMemo(() => {
    const q = fighterSearch.trim().toLowerCase();
    return fighterList.filter(({ name }) => {
      if (q && !name.toLowerCase().includes(q)) return false;
      if (fighterSportFilter.length > 0) {
        const sport = fightersData[name]?.sport;
        if (!sport || !fighterSportFilter.includes(sport)) return false;
      }
      return true;
    });
  }, [fighterList, fighterSearch, fighterSportFilter, fightersData]);

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
          {/* Search */}
          <div className="px-5 pt-4">
            <input
              type="text"
              placeholder="Search events, fighters, promotions…"
              value={eventSearch}
              onChange={(e) => setEventSearch(e.target.value)}
              className="w-full bg-panel border border-border rounded-md px-3.5 py-2 text-[14px] text-text placeholder:text-dim outline-none focus:border-accent"
            />
          </div>

          {/* Sport filter */}
          <div className="flex gap-2 px-5 pt-4 pb-4 flex-wrap border-b border-border">
            {SPORTS.map((s) => {
              const active = s === "All" ? filter.length === 0 : filter.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSport(s, filter, setFilter)}
                  className={`text-[13px] font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
                    active
                      ? "bg-accent border-accent text-white"
                      : "border-[#3A3A3C] text-muted"
                  }`}
                >
                  {s}
                </button>
              );
            })}
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
                isFav={isFavorited("promotion", e.promotion)}
                isEventFav={isFavorited("event", e.id)}
                onToggleEventFav={
                  session ? () => toggleFavorite("event", e.id) : undefined
                }
                isOpen={expandedId === e.id}
                onToggle={() =>
                  setExpandedId(expandedId === e.id ? null : e.id)
                }
                onSelectFighter={setSelectedFighter}
                fightersData={fightersData}
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
          {!session ? (
            <div className="px-5 pt-10 text-center">
              <p className="text-[14px] text-dim mb-4">{L.favLoginPrompt}</p>
              <button
                onClick={() => setTab("account")}
                className="bg-accent text-white text-[13px] font-semibold rounded-md px-4 py-2.5"
              >
                {L.tabAccount}
              </button>
            </div>
          ) : (
            <>
              <div className="px-5 pt-4 pb-4 border-b border-border flex flex-col gap-3.5">
                <div>
                  <p className="text-[11px] font-semibold text-dim uppercase tracking-wide mb-1.5">
                    {L.favSportsLabel}
                  </p>
                  <div className="flex gap-1.5 flex-wrap">
                    {SPORTS.filter((s) => s !== "All").map((s) => {
                      const isFav = isFavorited("sport", s);
                      return (
                        <button
                          key={s}
                          onClick={() => toggleFavorite("sport", s)}
                          className={`text-[12px] px-2.5 py-1 rounded-md border transition-colors ${
                            isFav
                              ? "border-accent text-text"
                              : "border-[#2E2E30] bg-panel text-faint"
                          }`}
                        >
                          {isFav ? "★" : "☆"} {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-dim uppercase tracking-wide mb-1.5">
                    {L.favPromotionsLabel}
                  </p>
                  <div className="flex gap-1.5 flex-wrap">
                    {allPromotions.map((p) => {
                      const isFav = isFavorited("promotion", p);
                      return (
                        <button
                          key={p}
                          onClick={() => toggleFavorite("promotion", p)}
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

                <div>
                  <p className="text-[11px] font-semibold text-dim uppercase tracking-wide mb-1.5">
                    {L.favFightersLabel}
                  </p>
                  {favoriteFighters.length === 0 ? (
                    <p className="text-[12px] text-dim">{L.noFavFighters}</p>
                  ) : (
                    <div className="flex gap-1.5 flex-wrap">
                      {favoriteFighters.map((name) => (
                        <button
                          key={name}
                          onClick={() => toggleFavorite("fighter", name)}
                          className="text-[12px] px-2.5 py-1 rounded-md border border-accent text-text"
                        >
                          ★ {name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-dim uppercase tracking-wide mb-1.5">
                    {L.favEventsLabel}
                  </p>
                  {favorites.filter((f) => f.type === "event").length ===
                  0 ? (
                    <p className="text-[12px] text-dim">{L.noFavEvents}</p>
                  ) : (
                    <div className="flex gap-1.5 flex-wrap">
                      {favorites
                        .filter((f) => f.type === "event")
                        .map((f) => {
                          const ev = EVENTS.find((e) => e.id === f.value);
                          return (
                            <button
                              key={f.value}
                              onClick={() => toggleFavorite("event", f.value)}
                              className="text-[12px] px-2.5 py-1 rounded-md border border-accent text-text"
                            >
                              ★ {ev?.main ?? f.value}
                            </button>
                          );
                        })}
                    </div>
                  )}
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
                    isEventFav={isFavorited("event", e.id)}
                    onToggleEventFav={() => toggleFavorite("event", e.id)}
                    isOpen={expandedId === e.id}
                    onToggle={() =>
                      setExpandedId(expandedId === e.id ? null : e.id)
                    }
                    onSelectFighter={setSelectedFighter}
                    fightersData={fightersData}
                    L={L}
                  />
                ))}
              </main>
            </>
          )}
        </>
      )}

      {tab === "fighters" && (
        <>
          <div className="px-5 pt-4 pb-4 border-b border-border flex flex-col gap-3 md:flex-row md:items-center">
            <input
              type="text"
              placeholder="Search fighters…"
              value={fighterSearch}
              onChange={(e) => setFighterSearch(e.target.value)}
              className="flex-1 bg-panel border border-border rounded-md px-3.5 py-2 text-[14px] text-text placeholder:text-dim outline-none focus:border-accent"
            />
            {session && (
              <button
                onClick={() => setShowRegisterForm((v) => !v)}
                className="text-[13px] font-semibold text-accent shrink-0"
              >
                {showRegisterForm ? "Cancel" : "+ Register as a fighter"}
              </button>
            )}
          </div>

          <div className="flex gap-2 px-5 pt-4 pb-4 flex-wrap border-b border-border">
            {SPORTS.map((s) => {
              const active =
                s === "All"
                  ? fighterSportFilter.length === 0
                  : fighterSportFilter.includes(s);
              return (
                <button
                  key={s}
                  onClick={() =>
                    toggleSport(s, fighterSportFilter, setFighterSportFilter)
                  }
                  className={`text-[13px] font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
                    active
                      ? "bg-accent border-accent text-white"
                      : "border-[#3A3A3C] text-muted"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>

          {showRegisterForm && session && (
            <form
              onSubmit={handleRegisterFighter}
              className="px-5 py-4 border-b border-border flex flex-col gap-2 md:max-w-md"
            >
              <input
                required
                placeholder="Full name"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="bg-panel border border-border rounded-md px-3 py-2 text-[13px] text-text placeholder:text-dim outline-none focus:border-accent"
              />
              <input
                placeholder="Nickname"
                value={regNickname}
                onChange={(e) => setRegNickname(e.target.value)}
                className="bg-panel border border-border rounded-md px-3 py-2 text-[13px] text-text placeholder:text-dim outline-none focus:border-accent"
              />
              <input
                placeholder="Sport (e.g. MMA, Boxing)"
                value={regSport}
                onChange={(e) => setRegSport(e.target.value)}
                className="bg-panel border border-border rounded-md px-3 py-2 text-[13px] text-text placeholder:text-dim outline-none focus:border-accent"
              />
              <input
                placeholder="Record (e.g. 5-1-0)"
                value={regRecord}
                onChange={(e) => setRegRecord(e.target.value)}
                className="bg-panel border border-border rounded-md px-3 py-2 text-[13px] text-text placeholder:text-dim outline-none focus:border-accent"
              />
              <textarea
                placeholder="Short bio"
                rows={3}
                value={regBio}
                onChange={(e) => setRegBio(e.target.value)}
                className="bg-panel border border-border rounded-md px-3 py-2 text-[13px] text-text placeholder:text-dim outline-none focus:border-accent resize-none"
              />
              <textarea
                placeholder="Career history"
                rows={3}
                value={regCareer}
                onChange={(e) => setRegCareer(e.target.value)}
                className="bg-panel border border-border rounded-md px-3 py-2 text-[13px] text-text placeholder:text-dim outline-none focus:border-accent resize-none"
              />
              <button
                type="submit"
                disabled={regSaving}
                className="bg-accent text-white text-[13px] font-semibold rounded-md py-2.5 disabled:opacity-50"
              >
                {regSaving ? "Creating…" : "Create my fighter profile"}
              </button>
              {regError && (
                <p className="text-[12px] text-accent">{regError}</p>
              )}
            </form>
          )}

          {!session && (
            <p className="px-5 pt-4 text-[13px] text-dim border-b border-border pb-4">
              Log in to register your own fighter profile.
            </p>
          )}

          <main className="px-5 pt-5 pb-10 flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-3">
          {visibleFighters.map(({ name, upcoming }) => {
            const info = fightersData[name];
            const next = upcoming[0];
            return (
              <div
                key={name}
                onClick={() => setSelectedFighter(name)}
                className="cursor-pointer text-left border border-border bg-panel rounded-[10px] p-3.5 hover:border-accent transition-colors"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <FighterIllustration
                      name={name}
                      size={44}
                      photoUrl={info?.photo_url}
                    />
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
                  {session && (
                    <button
                      onClick={(ev) => {
                        ev.stopPropagation();
                        toggleFavorite("fighter", name);
                      }}
                      className={`text-[15px] leading-none shrink-0 ${
                        isFavorited("fighter", name)
                          ? "text-accent"
                          : "text-dim"
                      }`}
                      aria-label="Favorite this fighter"
                    >
                      {isFavorited("fighter", name) ? "★" : "☆"}
                    </button>
                  )}
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
                <Link
                  href={`/fighters/${fighterSlug(name)}`}
                  onClick={(ev) => ev.stopPropagation()}
                  className="text-[11px] text-dim underline mt-1 inline-block"
                >
                  Full profile page ↗
                </Link>
              </div>
            );
          })}
          {visibleFighters.length === 0 && (
            <p className="text-[13px] text-dim md:col-span-full">
              {fighterList.length === 0
                ? L.noFightersYet
                : "No fighters match your search."}
            </p>
          )}
          </main>
        </>
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

              <label className="flex items-start gap-2.5 mb-5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={handleToggleEmailNotifications}
                  className="mt-0.5 accent-accent"
                />
                <span className="text-[13px] text-muted leading-snug">
                  {L.emailNotifLabel}
                </span>
              </label>

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
          canEdit={
            isAdmin ||
            (!!session &&
              fightersData[selectedFighter]?.claimed_by === session.user.id)
          }
          isFav={isFavorited("fighter", selectedFighter)}
          onToggleFav={
            session
              ? () => toggleFavorite("fighter", selectedFighter)
              : undefined
          }
          onClose={() => setSelectedFighter(null)}
          onSaved={(f) =>
            setFightersData((prev) => ({ ...prev, [f.name]: f }))
          }
          L={L}
        />
      )}

      {showNotifPrompt && session && (
        <div className="fixed inset-0 bg-black/70 flex items-end md:items-center justify-center z-50 p-0 md:p-5">
          <div className="bg-panel border border-border rounded-t-2xl md:rounded-2xl w-full md:max-w-sm p-6">
            <h3 className="font-display font-semibold text-[18px] text-text mb-2">
              {L.notifPromptTitle}
            </h3>
            <p className="text-[13px] text-muted leading-relaxed mb-5">
              {L.notifPromptBody}
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleNotifPromptChoice(true)}
                className="bg-accent text-white text-[14px] font-semibold rounded-md py-2.5"
              >
                {L.notifPromptYes}
              </button>
              <button
                onClick={() => handleNotifPromptChoice(false)}
                className="text-[13px] text-dim py-1"
              >
                {L.notifPromptNo}
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="px-5 pt-8 pb-2 border-t border-border mt-4">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: FAQ.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            }),
          }}
        />
        <h2 className="font-display font-semibold text-[16px] text-text mb-3">
          Frequently asked questions
        </h2>
        <div className="flex flex-col gap-4">
          {FAQ.map((f) => (
            <div key={f.q}>
              <p className="text-[13px] font-semibold text-text mb-1">
                {f.q}
              </p>
              <p className="text-[13px] text-muted leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="px-5 py-6 flex gap-4 justify-center border-t border-border mt-4">
        <Link href="/impressum" className="text-[12px] text-dim">
          {L.legalImprint}
        </Link>
        <Link href="/datenschutz" className="text-[12px] text-dim">
          {L.legalPrivacy}
        </Link>
      </div>
    </div>
  );
}
