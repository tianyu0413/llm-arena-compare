import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17212b",
        mist: "#edf2f4",
        moss: "#4f6f52",
        saffron: "#d89a2b",
        coral: "#c85850",
        sea: "#2d7f87"
      },
      boxShadow: {
        soft: "0 20px 45px rgba(23, 33, 43, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
