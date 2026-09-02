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
        dim: "#6E6E72",
        accent: "#C1272D",
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
