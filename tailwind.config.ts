import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#F6F7FA",
        bgAlt: "#ECEFF5",
        panel: "#FFFFFF",
        ink: "#0E1424",
        inkSoft: "#4B5468",
        inkFaint: "#8791A6",
        navy: "#0A101F",
        navyAlt: "#121A30",
        blue: "#2E5AAC",
        blueBright: "#3E74E0",
        blueSoft: "#E8EEFA",
        gold: "#C9962A",
        goldSoft: "#FBF1DC",
        line: "#E1E4EC",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      boxShadow: {
        card: "0 20px 50px -25px rgba(15,26,54,0.35)",
      },
      keyframes: {
        draw: {
          to: { strokeDashoffset: "0" },
        },
        pulse2: {
          "0%": { opacity: "0.55", transform: "scale(0.9)" },
          "70%": { opacity: "0", transform: "scale(1.9)" },
          "100%": { opacity: "0", transform: "scale(1.9)" },
        },
      },
      animation: {
        draw: "draw 1.4s ease forwards",
        pulse2: "pulse2 2.8s ease-in-out infinite",
      },
      borderRadius: {
        xl2: "18px",
      },
    },
  },
  plugins: [],
};
export default config;
