/** @type {import('next').NextConfig} */
const nextConfig = {
  // Verrät sonst per Header, dass hier Next.js läuft — kostenlose Vorarbeit
  // für jeden, der nach Framework-spezifischen Lücken scannt.
  poweredByHeader: false,

  // Vercel setzt HSTS bereits selbst, der Rest fehlte.
  // Bewusst ohne Content-Security-Policy: Next.js injiziert Inline-Skripte für
  // die Hydration, eine CSP bräuchte also Nonces per Middleware. Das ist ein
  // eigener Umbau mit echtem Risiko, die Seite kaputtzumachen — die Header
  // hier wirken sofort und können nichts brechen.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Verhindert, dass der Browser Dateitypen errät und z.B. einen
          // hochgeladenen Text als Skript ausführt.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Kein Fremd-Einbetten in iframes (Clickjacking). Die Android-App
          // ist davon nicht betroffen: eine WebView ist kein iframe.
          { key: "X-Frame-Options", value: "DENY" },
          // Beim Klick auf einen externen Link nur die Domain mitgeben,
          // nicht die volle URL.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Die Seite braucht nichts davon.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // Die IJF stand früher unter zwei Promotion-Namen in der Datenbank
      // ("IJF" und "IJF Judo Grand Slam"), was den Kalender desselben
      // Verbands auf zwei dünne Seiten aufgeteilt hat. Seit der
      // Zusammenlegung existiert nur noch /promotion/ijf — die alte URL war
      // aber live und indexierbar, also bleibt sie als Weiterleitung.
      {
        source: "/promotion/ijf-judo-grand-slam",
        destination: "/promotion/ijf",
        permanent: true,
      },
      // Gleicher Fall wie die IJF: "WKF Karate 1" ist der Name der Turnierserie,
      // nicht des Verbands. Der World Cup ist ein WKF-Event ausserhalb dieser
      // Serie und haette sonst ein zweites Promotion-Label gebraucht.
      {
        source: "/promotion/wkf-karate-1",
        destination: "/promotion/wkf",
        permanent: true,
      },
    ];
  },
};
module.exports = nextConfig;
