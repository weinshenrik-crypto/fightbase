/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ];
  },
};
module.exports = nextConfig;
