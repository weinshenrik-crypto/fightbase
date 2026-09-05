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
