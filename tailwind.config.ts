import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "var(--color-ink)",
        mist: "var(--color-mist)",
        moss: "#4f6f52",
        saffron: "#d89a2b",
        coral: "#c85850",
        sea: "var(--color-sea)",
        surface: "var(--color-surface)",
        panel: "var(--color-panel)"
      },
      boxShadow: {
        soft: "0 20px 45px var(--shadow-color, rgba(23, 33, 43, 0.10))"
      },
      keyframes: {
        "toast-in": {
          "0%": { opacity: "0", transform: "translateY(8px) scale(0.96)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" }
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        }
      },
      animation: {
        "toast-in": "toast-in 0.25s ease-out",
        "fade-in": "fade-in 0.3s ease-out"
      }
    }
  },
  plugins: []
};

export default config;
