"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// Der Wartezustand nach der Registrierung. Tritt im Account-Panel an die Stelle
// des Formulars — Eingabefelder, Registrieren-Button und OAuth-Knoepfe sind
// solange weg.
//
// Warum als eigener Zustand und nicht als Hinweiszeile unter dem Button: Die
// Zeile wurde uebersehen, und Nutzer haben daraufhin binnen Minuten ein zweites
// Mal registriert. Ist das Formular ersetzt, gibt es keinen Button mehr, den man
// erneut druecken koennte.
//
// Die OAuth-Knoepfe verschwinden bewusst mit: Wer auf eine Bestaetigungsmail
// wartet und daneben "Weiter mit Google" sieht, legt sich sonst versehentlich
// ein zweites, getrenntes Konto an.

type Lang = "en" | "de";

// Supabase ist unter Auth -> Emails -> SMTP Settings auf "Minimum interval per
// user: 60 seconds" gestellt. Frueher als hier freigegeben wuerde der Server die
// Mail ohnehin ablehnen — der Countdown bildet also ein echtes Limit ab und ist
// keine erfundene Wartezeit.
const COOLDOWN_SECONDS = 60;

const TEXT = {
  en: {
    heading: "Check your email",
    sentTo: "We sent a confirmation link to",
    spamHint:
      "Nothing after a minute? Have a look in your spam folder — the link comes from noreply@fightbase.io.",
    resend: "Send a new email",
    resendIn: (s: number) => `Send a new email (${s}s)`,
    sending: "Sending…",
    sent: "New email sent.",
    useDifferent: "Use a different email address",
  },
  de: {
    heading: "Schau in dein Postfach",
    sentTo: "Wir haben einen Bestätigungslink geschickt an",
    spamHint:
      "Nach einer Minute noch nichts da? Sieh im Spam-Ordner nach — der Link kommt von noreply@fightbase.io.",
    resend: "Neue E-Mail senden",
    resendIn: (s: number) => `Neue E-Mail senden (${s} s)`,
    sending: "Wird gesendet…",
    sent: "Neue E-Mail ist unterwegs.",
    useDifferent: "Andere E-Mail-Adresse verwenden",
  },
} satisfies Record<Lang, unknown>;

export default function ConfirmEmailPending({
  email,
  lang,
  onUseDifferentEmail,
}: {
  email: string;
  lang: Lang;
  onUseDifferentEmail: () => void;
}) {
  const t = TEXT[lang];

  const [secondsLeft, setSecondsLeft] = useState(COOLDOWN_SECONDS);
  const [sending, setSending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Der Countdown laeuft ab dem Erscheinen, nicht ab dem ersten Klick: Die erste
  // Mail ist gerade rausgegangen, Supabases Minimum-Intervall laeuft also schon.
  // Ein sofort klickbarer Button wuerde nur in einen Serverfehler laufen.
  //
  // setTimeout statt setInterval, damit die Kette an secondsLeft haengt. In einem
  // Hintergrund-Tab drosseln Browser den Timer — der Button gibt dann spaeter
  // frei statt frueher, und das ist die unbedenkliche Richtung.
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [secondsLeft]);

  async function handleResend() {
    setSending(true);
    setError(null);
    setResent(false);

    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    setSending(false);

    if (resendError) {
      // Sichtbar machen statt schlucken: Laeuft Supabases Limit doch anders als
      // hier angenommen, soll der Nutzer den Grund lesen koennen.
      setError(resendError.message);
      return;
    }

    setResent(true);
    setSecondsLeft(COOLDOWN_SECONDS);
  }

  const waiting = secondsLeft > 0;

  return (
    <div className="flex flex-col">
      <h2 className="font-display font-semibold text-[20px] text-text mb-1">
        {t.heading}
      </h2>

      <p className="text-[13px] text-dim mb-1">{t.sentTo}</p>
      <p className="text-[15px] text-text font-semibold break-all mb-4">
        {email}
      </p>

      <p className="text-[12px] text-dim mb-5">{t.spamHint}</p>

      <button
        type="button"
        onClick={handleResend}
        disabled={waiting || sending}
        className="bg-accent text-white text-[14px] font-semibold rounded-md py-2.5 disabled:opacity-50"
      >
        {sending ? t.sending : waiting ? t.resendIn(secondsLeft) : t.resend}
      </button>

      {/* aria-live, damit Screenreader Erfolg und Fehler mitbekommen — beide
          erscheinen ohne Fokuswechsel. */}
      <p aria-live="polite" className="text-[12px] text-center mt-2 min-h-4">
        {error ? (
          <span className="text-accentText">{error}</span>
        ) : resent ? (
          <span className="text-dim">{t.sent}</span>
        ) : null}
      </p>

      <button
        type="button"
        onClick={onUseDifferentEmail}
        className="text-[13px] text-accentText mt-4"
      >
        {t.useDifferent}
      </button>
    </div>
  );
}
