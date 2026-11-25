import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        ywd: {
          forest: "#18352D",
          "forest-dark": "#10231E",
          "forest-light": "#234C40",
          orange: "#C46A42",
          "orange-dark": "#A8532F",
          "orange-light": "#D98059",
          terracotta: "#A64F45",
          cream: "#F5F0E8",
          "cream-light": "#FAF7F2",
          "cream-dark": "#EAE2D5",
          sage: "#789681",
          "sage-light": "#9BB5A3",
          "sage-dark": "#5B7964",
          charcoal: "#202522",
          "charcoal-dark": "#151816",
          "charcoal-light": "#2D3430",
          white: "#FFFFFF",
          // Semantic alias tokens
          border: "#E5DEC9",
          "border-dark": "#2E3B34",
          muted: "#63736A",
          // Royal Violet brand accent
          violet: "#7052DF",
          "violet-dark": "#5B3DC6",
          "violet-light": "#F0EDFC",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        "ywd-subtle": "0 2px 8px -2px rgba(24, 53, 45, 0.05), 0 1px 3px -1px rgba(24, 53, 45, 0.05)",
        "ywd-card": "0 12px 32px -10px rgba(24, 53, 45, 0.08), 0 4px 12px -2px rgba(24, 53, 45, 0.04)",
        "ywd-lg": "0 24px 60px -15px rgba(24, 53, 45, 0.16)",
        "ywd-elevated": "0 20px 48px -12px rgba(32, 37, 34, 0.28)",
      },
    },
  },
  plugins: [],
};
export default config;
