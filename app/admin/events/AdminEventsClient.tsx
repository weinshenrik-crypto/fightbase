"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { SPORTS } from "@/lib/events";
import { useStoredLang } from "@/lib/clientStore";

/**
 * Pflegemaske fuer die events-Tabelle.
 *
 * Warum ueberhaupt, wo es den Supabase Table Editor gibt: Der Table Editor
 * kennt die Regeln dieses Projekts nicht. Er laesst eine Karte ohne Datum zu,
 * er sagt nicht, dass `undercard` nur bestaetigte Kaempfe enthalten darf, und
 * er verraet nicht, dass eine Zeile vom Importer stammt und beim naechsten
 * Cron-Lauf wieder ueberschrieben wird. Genau das steht hier an den Feldern.
 *
 * Was diese Seite ausdruecklich *nicht* tut: Rechte pruefen. Wer schreiben
 * darf, steht in den RLS-Policies der Tabelle. Die Seite zeigt den Admin-Status
 * nur an, damit klar ist, warum ein Speichern fehlschlaegt.
 */

// Die Spalten, die das Formular pflegt. starts_at/timezone sind bewusst
// nullable: Fuer die meisten Termine ist die Anfangszeit Monate im Voraus nicht
// angekuendigt, und kein Wert ist besser als ein geschaetzter.
type EventRow = {
  id: string;
  slug: string;
  date: string;
  sport: string;
  promotion: string;
  title: string;
  main: string;
  fighter_a: string | null;
  fighter_b: string | null;
  venue: string;
  broadcaster: string;
  note: string;
  undercard: string[] | null;
  starts_at: string | null;
  timezone: string | null;
  source: string | null;
  source_url: string | null;
};

type FormState = {
  slug: string;
  date: string;
  sport: string;
  promotion: string;
  title: string;
  main: string;
  fighter_a: string;
  fighter_b: string;
  venue: string;
  broadcaster: string;
  note: string;
  undercard: string;
  starts_at: string;
  timezone: string;
};

const EMPTY: FormState = {
  slug: "",
  date: "",
  sport: "MMA",
  promotion: "",
  title: "",
  main: "",
  fighter_a: "",
  fighter_b: "",
  venue: "",
  broadcaster: "-",
  note: "",
  undercard: "",
  starts_at: "",
  timezone: "",
};

const STRINGS = {
  en: {
    heading: "Manage events",
    intro:
      "Writes go straight to the events table. What you may change is decided by its row-level security policies, not by this page.",
    back: "← Back to Fightbase",
    signedOut: "Sign in on the main page first — this page writes as your account.",
    notAdmin:
      "Your account is not marked as admin. You can look around, but saving will be rejected by the database.",
    isAdmin: "Signed in as admin.",
    loading: "Loading events…",
    newEvent: "New event",
    editing: "Editing",
    cancel: "Cancel",
    save: "Save",
    saving: "Saving…",
    remove: "Delete",
    confirmRemove: "Really delete? This cannot be undone.",
    saved: "Saved.",
    deleted: "Deleted.",
    required: "slug, date, sport, promotion, title and main are required.",
    slugTaken: "That slug is already taken.",
    importedWarn:
      "This row comes from the automatic importer. Your changes will be overwritten on the next run unless you clear its source field.",
    fields: {
      slug: "Slug (URL part)",
      date: "Date",
      sport: "Sport",
      promotion: "Promotion",
      title: "Title",
      main: "Main event / what is contested",
      fighter_a: "Fighter A",
      fighter_b: "Fighter B",
      venue: "Venue",
      broadcaster: "Broadcaster",
      note: "Note",
      undercard: "Undercard (one bout per line)",
      starts_at: "Start (local to you, stored absolute)",
      timezone: "Venue timezone (IANA)",
    },
    hints: {
      slug: "Lower case, no spaces. Becomes /events/<slug> and should not change afterwards.",
      fighters:
        "Only both together create a fighter pairing. Leave empty for tournaments.",
      undercard: "Only bouts the promotion has confirmed. Never guess.",
      starts_at:
        "Leave empty if the promotion has not announced a time. A guessed time is worse than none.",
      timezone: 'e.g. Asia/Tokyo. Only set it together with a start time.',
    },
    search: "Filter by title, slug or promotion",
    count: (n: number) => `${n} events`,
    imported: "imported",
    manual: "manual",
  },
  de: {
    heading: "Events verwalten",
    intro:
      "Schreibt direkt in die events-Tabelle. Was du aendern darfst, entscheiden deren RLS-Policies, nicht diese Seite.",
    back: "← Zurück zu Fightbase",
    signedOut:
      "Melde dich zuerst auf der Hauptseite an — diese Seite schreibt mit deinem Konto.",
    notAdmin:
      "Dein Konto ist nicht als Admin markiert. Ansehen geht, Speichern lehnt die Datenbank ab.",
    isAdmin: "Als Admin angemeldet.",
    loading: "Events werden geladen…",
    newEvent: "Neues Event",
    editing: "Bearbeiten",
    cancel: "Abbrechen",
    save: "Speichern",
    saving: "Speichert…",
    remove: "Löschen",
    confirmRemove: "Wirklich löschen? Das lässt sich nicht rückgängig machen.",
    saved: "Gespeichert.",
    deleted: "Gelöscht.",
    required: "slug, date, sport, promotion, title und main sind Pflicht.",
    slugTaken: "Diesen Slug gibt es schon.",
    importedWarn:
      "Diese Zeile stammt vom automatischen Import. Der naechste Lauf ueberschreibt deine Aenderung, solange das source-Feld gesetzt bleibt.",
    fields: {
      slug: "Slug (URL-Teil)",
      date: "Datum",
      sport: "Sportart",
      promotion: "Promotion",
      title: "Titel",
      main: "Hauptkampf / was ausgetragen wird",
      fighter_a: "Kämpfer A",
      fighter_b: "Kämpfer B",
      venue: "Austragungsort",
      broadcaster: "Übertragung",
      note: "Hinweis",
      undercard: "Undercard (ein Kampf pro Zeile)",
      starts_at: "Beginn (deine Ortszeit, absolut gespeichert)",
      timezone: "Zeitzone des Austragungsorts (IANA)",
    },
    hints: {
      slug: "Kleinschreibung, keine Leerzeichen. Wird zu /events/<slug> und sollte danach nicht mehr wechseln.",
      fighters:
        "Nur beide zusammen ergeben eine Paarung. Bei Turnieren leer lassen.",
      undercard: "Nur Kämpfe, die die Promotion bestätigt hat. Nichts raten.",
      starts_at:
        "Leer lassen, wenn der Veranstalter keine Zeit angekündigt hat. Eine geschätzte Zeit ist schlechter als keine.",
      timezone: "z.B. Asia/Tokyo. Nur zusammen mit einer Anfangszeit setzen.",
    },
    search: "Nach Titel, Slug oder Promotion filtern",
    count: (n: number) => `${n} Events`,
    imported: "importiert",
    manual: "von Hand",
  },
};

/** starts_at ist timestamptz; das Eingabefeld liefert lokale Zeit ohne Zone. */
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function rowToForm(row: EventRow): FormState {
  return {
    slug: row.slug,
    date: row.date,
    sport: row.sport,
    promotion: row.promotion,
    title: row.title,
    main: row.main,
    fighter_a: row.fighter_a ?? "",
    fighter_b: row.fighter_b ?? "",
    venue: row.venue ?? "",
    broadcaster: row.broadcaster ?? "-",
    note: row.note ?? "",
    undercard: (row.undercard ?? []).join("\n"),
    starts_at: toLocalInput(row.starts_at),
    timezone: row.timezone ?? "",
  };
}

export default function AdminEventsClient() {
  const lang = useStoredLang();
  const L = STRINGS[lang];

  const [session, setSession] = useState<Session | null>(null);
  const [account, setAccount] = useState<{ userId: string; role: string | null } | null>(
    null
  );
  const [rows, setRows] = useState<EventRow[] | null>(null);
  const [editing, setEditing] = useState<EventRow | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [confirming, setConfirming] = useState<string | null>(null);
  // Hochzaehlen statt eine Ladefunktion aus dem Effekt heraus aufzurufen: Der
  // Aufruf im Effektkoerper waere ein synchrones setState und damit ein
  // zusaetzlicher Renderdurchlauf (react-hooks/set-state-in-effect).
  const [reloadToken, setReloadToken] = useState(0);
  const reload = () => setReloadToken((t) => t + 1);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) =>
      setSession(s)
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  // Wie in HomeClient: Die Rolle wird zusammen mit der user_id gehalten und
  // beim Rendern dagegen geprueft, statt sie beim Logout zurueckzusetzen.
  useEffect(() => {
    if (!session) return;
    const userId = session.user.id;
    supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => setAccount({ userId, role: data?.role ?? null }));
  }, [session]);

  const isAdmin =
    !!session && account?.userId === session.user.id && account.role === "admin";

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("events")
      .select("*")
      .order("date", { ascending: false })
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (err) setError(err.message);
        setRows((data as EventRow[] | null) ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || rows === null) return rows ?? [];
    return rows.filter((r) =>
      [r.title, r.slug, r.promotion, r.main].some((v) =>
        (v ?? "").toLowerCase().includes(q)
      )
    );
  }, [rows, query]);

  function startNew() {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
    setMessage(null);
    setError(null);
  }

  function startEdit(row: EventRow) {
    setEditing(row);
    setForm(rowToForm(row));
    setOpen(true);
    setMessage(null);
    setError(null);
  }

  async function save(ev: React.FormEvent) {
    ev.preventDefault();
    setError(null);
    setMessage(null);

    const required = ["slug", "date", "sport", "promotion", "title", "main"] as const;
    if (required.some((k) => !form[k].trim())) {
      setError(L.required);
      return;
    }

    // fighter_a/fighter_b ergeben nur als Paar Sinn — die Kalenderlogik zeigt
    // sie ausschliesslich zusammen an.
    const a = form.fighter_a.trim();
    const b = form.fighter_b.trim();
    const payload = {
      slug: form.slug.trim(),
      date: form.date,
      sport: form.sport,
      promotion: form.promotion.trim(),
      title: form.title.trim(),
      main: form.main.trim(),
      fighter_a: a && b ? a : null,
      fighter_b: a && b ? b : null,
      venue: form.venue.trim(),
      broadcaster: form.broadcaster.trim() || "-",
      note: form.note.trim(),
      undercard: form.undercard
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
      timezone: form.starts_at && form.timezone.trim() ? form.timezone.trim() : null,
    };

    setSaving(true);
    const { error: err } = editing
      ? await supabase.from("events").update(payload).eq("id", editing.id)
      : await supabase.from("events").insert(payload);
    setSaving(false);

    if (err) {
      setError(err.message.includes("duplicate") ? L.slugTaken : err.message);
      return;
    }
    setMessage(L.saved);
    setOpen(false);
    setEditing(null);
    reload();
  }

  async function remove(row: EventRow) {
    setError(null);
    const { error: err } = await supabase.from("events").delete().eq("id", row.id);
    setConfirming(null);
    if (err) {
      setError(err.message);
      return;
    }
    setMessage(L.deleted);
    reload();
  }

  const field =
    "w-full bg-panel border border-border rounded-md px-3 py-2 text-[14px] text-text placeholder:text-dim outline-none focus:border-accent";
  const label = "block text-[12px] text-muted mb-1";
  const hint = "text-[11px] text-dim mt-1 leading-snug";

  return (
    <div className="max-w-[480px] md:max-w-4xl mx-auto min-h-screen px-5 py-10 font-body text-text">
      <div className="flex items-center justify-between gap-4 mb-5">
        <Link href="/" className="text-[13px] text-accentText">
          {L.back}
        </Link>
      </div>

      <h1 className="font-display text-[28px] font-semibold mb-1">{L.heading}</h1>
      <p className="text-[13px] text-muted leading-relaxed mb-5">{L.intro}</p>

      {/* Nur ein Hinweis, keine Zugangskontrolle — die steckt in den Policies. */}
      <p
        className={`text-[12px] mb-5 ${
          !session || !isAdmin ? "text-accentText" : "text-dim"
        }`}
      >
        {!session ? L.signedOut : isAdmin ? L.isAdmin : L.notAdmin}
      </p>

      {message && <p className="text-[13px] text-muted mb-3">{message}</p>}
      {error && <p className="text-[13px] text-accentText mb-3">{error}</p>}

      <div className="flex flex-col md:flex-row md:items-center gap-2.5 mb-5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={L.search}
          className={field}
        />
        <button
          onClick={startNew}
          className="shrink-0 bg-accent text-white text-[13px] font-semibold rounded-md px-4 py-2"
        >
          {L.newEvent}
        </button>
      </div>

      {open && (
        <form
          onSubmit={save}
          className="border border-border rounded-[10px] p-4 mb-6 flex flex-col gap-3.5 bg-panel"
        >
          <p className="font-display text-[16px] font-semibold">
            {editing ? `${L.editing}: ${editing.slug}` : L.newEvent}
          </p>

          {editing?.source && (
            <p className="text-[12px] text-accentText leading-snug">
              {L.importedWarn}
            </p>
          )}

          <div className="grid md:grid-cols-2 gap-3.5">
            <div>
              <label className={label} htmlFor="f-slug">
                {L.fields.slug}
              </label>
              <input
                id="f-slug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className={field}
              />
              <p className={hint}>{L.hints.slug}</p>
            </div>
            <div>
              <label className={label} htmlFor="f-date">
                {L.fields.date}
              </label>
              <input
                id="f-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={field}
              />
            </div>
            <div>
              <label className={label} htmlFor="f-sport">
                {L.fields.sport}
              </label>
              <select
                id="f-sport"
                value={form.sport}
                onChange={(e) => setForm({ ...form, sport: e.target.value })}
                className={field}
              >
                {SPORTS.filter((s) => s !== "All").map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label} htmlFor="f-promotion">
                {L.fields.promotion}
              </label>
              <input
                id="f-promotion"
                value={form.promotion}
                onChange={(e) => setForm({ ...form, promotion: e.target.value })}
                className={field}
              />
            </div>
            <div className="md:col-span-2">
              <label className={label} htmlFor="f-title">
                {L.fields.title}
              </label>
              <input
                id="f-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={field}
              />
            </div>
            <div className="md:col-span-2">
              <label className={label} htmlFor="f-main">
                {L.fields.main}
              </label>
              <input
                id="f-main"
                value={form.main}
                onChange={(e) => setForm({ ...form, main: e.target.value })}
                className={field}
              />
            </div>
            <div>
              <label className={label} htmlFor="f-fa">
                {L.fields.fighter_a}
              </label>
              <input
                id="f-fa"
                value={form.fighter_a}
                onChange={(e) => setForm({ ...form, fighter_a: e.target.value })}
                className={field}
              />
            </div>
            <div>
              <label className={label} htmlFor="f-fb">
                {L.fields.fighter_b}
              </label>
              <input
                id="f-fb"
                value={form.fighter_b}
                onChange={(e) => setForm({ ...form, fighter_b: e.target.value })}
                className={field}
              />
              <p className={hint}>{L.hints.fighters}</p>
            </div>
            <div>
              <label className={label} htmlFor="f-venue">
                {L.fields.venue}
              </label>
              <input
                id="f-venue"
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                className={field}
              />
            </div>
            <div>
              <label className={label} htmlFor="f-broadcaster">
                {L.fields.broadcaster}
              </label>
              <input
                id="f-broadcaster"
                value={form.broadcaster}
                onChange={(e) => setForm({ ...form, broadcaster: e.target.value })}
                className={field}
              />
            </div>
            <div>
              <label className={label} htmlFor="f-starts">
                {L.fields.starts_at}
              </label>
              <input
                id="f-starts"
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                className={field}
              />
              <p className={hint}>{L.hints.starts_at}</p>
            </div>
            <div>
              <label className={label} htmlFor="f-tz">
                {L.fields.timezone}
              </label>
              <input
                id="f-tz"
                value={form.timezone}
                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                className={field}
                placeholder="Asia/Tokyo"
              />
              <p className={hint}>{L.hints.timezone}</p>
            </div>
            <div className="md:col-span-2">
              <label className={label} htmlFor="f-note">
                {L.fields.note}
              </label>
              <textarea
                id="f-note"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                rows={3}
                className={`${field} resize-none`}
              />
            </div>
            <div className="md:col-span-2">
              <label className={label} htmlFor="f-undercard">
                {L.fields.undercard}
              </label>
              <textarea
                id="f-undercard"
                value={form.undercard}
                onChange={(e) => setForm({ ...form, undercard: e.target.value })}
                rows={4}
                className={`${field} resize-none`}
                placeholder="Kalašnik vs. Rayomba"
              />
              <p className={hint}>{L.hints.undercard}</p>
            </div>
          </div>

          <div className="flex gap-2.5">
            <button
              type="submit"
              disabled={saving}
              className="bg-accent text-white text-[13px] font-semibold rounded-md px-4 py-2 disabled:opacity-60"
            >
              {saving ? L.saving : L.save}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setEditing(null);
              }}
              className="text-[13px] rounded-md px-4 py-2 border border-border text-text"
            >
              {L.cancel}
            </button>
          </div>
        </form>
      )}

      {rows === null ? (
        <p className="text-[13px] text-dim">{L.loading}</p>
      ) : (
        <>
          <p className="text-[12px] text-dim mb-2.5">{L.count(visible.length)}</p>
          <div className="flex flex-col gap-2">
            {visible.map((row) => (
              <div
                key={row.id}
                className="border border-border rounded-[10px] p-3 bg-panel flex flex-col md:flex-row md:items-center gap-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold truncate">{row.title}</p>
                  <p className="text-[12px] text-dim truncate">
                    {row.date} · {row.sport} · {row.promotion} · {row.slug}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-[11px] px-2 py-0.5 rounded-md border ${
                    row.source
                      ? "border-borderFav text-accentText"
                      : "border-border text-dim"
                  }`}
                >
                  {row.source ? `${L.imported} · ${row.source}` : L.manual}
                </span>
                <div className="shrink-0 flex gap-2">
                  <button
                    onClick={() => startEdit(row)}
                    className="text-[12px] rounded-md px-3 py-1.5 border border-border text-text"
                  >
                    {L.editing}
                  </button>
                  {confirming === row.id ? (
                    <button
                      onClick={() => remove(row)}
                      className="text-[12px] rounded-md px-3 py-1.5 bg-accent text-white"
                    >
                      {L.confirmRemove}
                    </button>
                  ) : (
                    <button
                      onClick={() => setConfirming(row.id)}
                      className="text-[12px] rounded-md px-3 py-1.5 border border-border text-accentText"
                    >
                      {L.remove}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
