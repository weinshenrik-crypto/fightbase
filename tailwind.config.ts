import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#0C0C0D",
        panel: "#151516",
        panelFav: "#181213",
        border: "#232324",
        borderFav: "#5A1A1C",
        text: "#EDEAE4",
        muted: "#B7B7BA",
        faint: "#8A8A8E",
        // #6E6E72 lag bei 3.6:1 auf panel und damit unter WCAG AA (4.5:1 fuer
        // normalen Text). Bei 10-12px ist das genau der Text, der ohnehin am
        // schwersten zu lesen ist.
        dim: "#7E7E82",
        // Markenrot. Bleibt unveraendert fuer Flaechen und Rahmen: als
        // Button-Hintergrund traegt es helle Schrift mit 4.9:1.
        accent: "#C1272D",
        // Als *Textfarbe* auf dunklem Grund erreicht #C1272D nur 3.1:1. Gleicher
        // Farbton (358 Grad) und gleiche Saettigung, nur heller — damit 4.8:1.
        accentText: "#DD555B",
      },
      fontFamily: {
        display: ["var(--font-oswald)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
