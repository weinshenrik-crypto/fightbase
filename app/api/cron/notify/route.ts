import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { EVENTS, daysUntil, formatDate, type FightEvent } from "@/lib/events";

// Runs once a day (see vercel.json). For each event, two things can trigger
// an email: the event just got added to the calendar ("new_event"), or it's
// exactly REMINDER_DAYS away ("reminder") — and only for users who favorited
// a matching sport, fighter, promotion, or the event itself, and opted in to
// email_notifications. sent_notifications guarantees each (user, event,
// kind) pair only ever emails once, even if the cron runs more than once
// or is retried.
export const dynamic = "force-dynamic";

const REMINDER_DAYS = 3;

type Fav = { user_id: string; type: string; value: string };

function eventMatchesFavorite(e: FightEvent, fav: Fav) {
  if (fav.type === "sport") return e.sport === fav.value;
  if (fav.type === "promotion") return e.promotion === fav.value;
  if (fav.type === "event") return e.id === fav.value;
  if (fav.type === "fighter") return !!e.fighters?.includes(fav.value);
  return false;
}

function eventRow(e: FightEvent, label: string) {
  const { weekday, day, month } = formatDate(e.date);
  return `
    <tr>
      <td style="padding:14px 0;border-top:1px solid #2E2E30;">
        <p style="color:#D62828;font-size:11px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;margin:0 0 4px 0;">${label}</p>
        <p style="color:#FFFFFF;font-size:15px;font-weight:600;margin:0 0 4px 0;">${e.main}</p>
        <p style="color:#9A9A9E;font-size:13px;margin:0 0 8px 0;">${weekday} ${day} ${month} · ${e.title} · ${e.promotion}</p>
        <a href="https://fightbase.io/events/${e.id}" style="color:#D62828;font-size:13px;text-decoration:none;">View details ↗</a>
      </td>
    </tr>`;
}

function buildSubject(newEvents: FightEvent[], reminders: FightEvent[]) {
  if (newEvents.length > 0 && reminders.length === 0) {
    return newEvents.length === 1
      ? `New event: ${newEvents[0].main}`
      : `${newEvents.length} new events added to your favorites`;
  }
  if (reminders.length > 0 && newEvents.length === 0) {
    return reminders.length === 1
      ? `Coming up: ${reminders[0].main} in ${REMINDER_DAYS} days`
      : `${reminders.length} of your favorite events are coming up`;
  }
  return "Updates on your Fightbase favorites";
}

function buildEmailHtml(newEvents: FightEvent[], reminders: FightEvent[]) {
  const rows = [
    ...newEvents.map((e) => eventRow(e, "New")),
    ...reminders.map((e) => eventRow(e, `In ${REMINDER_DAYS} days`)),
  ].join("");

  return `
  <div style="background-color:#0A0A0B;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" style="max-width:460px;margin:0 auto;background-color:#161617;border-radius:14px;overflow:hidden;border:1px solid #2E2E30;">
      <tr><td style="padding:32px;">
        <div style="text-align:center;margin-bottom:8px;">
          <img src="https://fightbase.io/apple-touch-icon.png" width="48" height="48" alt="Fightbase" style="border-radius:12px;" />
        </div>
        <h1 style="color:#FFFFFF;font-size:19px;font-weight:700;text-align:center;margin:16px 0 24px 0;">
          Updates on your favorites
        </h1>
        <table role="presentation" width="100%">${rows}</table>
        <p style="color:#5A5A5E;font-size:11px;line-height:1.6;text-align:center;margin:28px 0 0 0;">
          You're getting this because you favorited a sport, fighter, promotion or event on
          <a href="https://fightbase.io" style="color:#5A5A5E;">Fightbase</a>.
          <a href="https://fightbase.io/?tab=account" style="color:#5A5A5E;">Manage notifications</a>.
        </p>
      </td></tr>
    </table>
  </div>`;
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = supabaseAdmin();
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data: knownRows } = await db.from("known_events").select("id");
  const knownIds = new Set((knownRows ?? []).map((r) => r.id as string));
  const bootstrap = knownIds.size === 0;

  const upcoming = EVENTS.filter((e) => daysUntil(e.date) >= 0);
  const unseen = upcoming.filter((e) => !knownIds.has(e.id));
  if (unseen.length > 0) {
    await db
      .from("known_events")
      .upsert(unseen.map((e) => ({ id: e.id })));
  }
  // On the very first run, treat everything as already-known so users
  // aren't flooded with "new event" emails for the entire seed calendar.
  const newEvents = bootstrap ? [] : unseen;

  const reminderEvents = upcoming.filter(
    (e) => daysUntil(e.date) === REMINDER_DAYS
  );

  if (newEvents.length === 0 && reminderEvents.length === 0) {
    return NextResponse.json({ ok: true, bootstrap, newEvents: 0, reminders: 0, notified: 0 });
  }

  const { data: profiles } = await db
    .from("profiles")
    .select("id, email")
    .eq("email_notifications", true);

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({
      ok: true,
      bootstrap,
      newEvents: newEvents.length,
      reminders: reminderEvents.length,
      notified: 0,
    });
  }

  const { data: allFavorites } = await db
    .from("favorites")
    .select("user_id, type, value");
  const favByUser = new Map<string, Fav[]>();
  (allFavorites ?? []).forEach((f) => {
    const list = favByUser.get(f.user_id) ?? [];
    list.push(f);
    favByUser.set(f.user_id, list);
  });

  const { data: alreadySent } = await db
    .from("sent_notifications")
    .select("user_id, event_id, kind");
  const sentKey = new Set(
    (alreadySent ?? []).map((s) => `${s.user_id}:${s.event_id}:${s.kind}`)
  );

  let notifiedCount = 0;
  const newSentRows: { user_id: string; event_id: string; kind: string }[] =
    [];

  for (const profile of profiles) {
    if (!profile.email) continue;
    const favs = favByUser.get(profile.id) ?? [];
    if (favs.length === 0) continue;

    const userNew = newEvents.filter(
      (e) =>
        favs.some((f) => eventMatchesFavorite(e, f)) &&
        !sentKey.has(`${profile.id}:${e.id}:new_event`)
    );
    const userReminders = reminderEvents.filter(
      (e) =>
        favs.some((f) => eventMatchesFavorite(e, f)) &&
        !sentKey.has(`${profile.id}:${e.id}:reminder`)
    );

    if (userNew.length === 0 && userReminders.length === 0) continue;

    await resend.emails.send({
      from: "Fightbase <noreply@fightbase.io>",
      to: profile.email,
      subject: buildSubject(userNew, userReminders),
      html: buildEmailHtml(userNew, userReminders),
    });

    notifiedCount++;
    userNew.forEach((e) =>
      newSentRows.push({ user_id: profile.id, event_id: e.id, kind: "new_event" })
    );
    userReminders.forEach((e) =>
      newSentRows.push({ user_id: profile.id, event_id: e.id, kind: "reminder" })
    );
  }

  if (newSentRows.length > 0) {
    await db.from("sent_notifications").insert(newSentRows);
  }

  return NextResponse.json({
    ok: true,
    bootstrap,
    newEvents: newEvents.length,
    reminders: reminderEvents.length,
    notified: notifiedCount,
  });
}
