import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      // Das native Android-Projekt. Hier liegt kein Code, den ESLint pruefen
      // soll — aber sobald jemand ./gradlew laufen laesst, liegt unter
      // android/app/build/ Capacitors generiertes native-bridge.js, und das
      // allein brachte 16 Warnungen mit. "build/**" oben greift dafuer nicht:
      // Das Muster passt nur auf ein build/ im Wurzelverzeichnis.
      //
      // In der CI faellt das nicht auf, weil dort kein Android gebaut wird —
      // auf einem Rechner mit Android-Build dagegen bei jedem `npm run lint`.
      "android/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
