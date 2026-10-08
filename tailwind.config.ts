import type { Config } from "tailwindcss";

// Paleta Pilum Code (amostrada das pranchas em /public/brand)
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem", screens: { "2xl": "1200px" } },
    extend: {
      colors: {
        ink: { DEFAULT: "#0E1116", soft: "#3A3F47", mute: "#5B6169", raised: "#171B22" },
        paper: { DEFAULT: "#ECEDEF", card: "#FFFFFF", line: "#D8DBDF" },
        // #B3261E: 6.5:1 com texto branco, 5.5:1 sobre o paper
        accent: { DEFAULT: "#B3261E", ink: "#8E1E18", bright: "#E0483D", soft: "#F7E4E2" },
      },
      fontFamily: {
        display: ["Anton", "Impact", "Haettenschweiler", "Arial Narrow Bold", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgb(14 17 22 / .05), 0 8px 24px -12px rgb(14 17 22 / .16)",
      },
    },
  },
} satisfies Config;
