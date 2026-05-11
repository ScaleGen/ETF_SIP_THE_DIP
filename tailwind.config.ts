import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f7f8fb",
          100: "#eef1f6",
          200: "#d9e0ec",
          300: "#b8c5d8",
          400: "#8fa2be",
          500: "#6f86a8",
          600: "#596d8b",
          700: "#485873",
          800: "#3f4b60",
          900: "#111827",
        },
        mint: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
      },
      boxShadow: {
        soft: "0 20px 60px -30px rgba(15, 23, 42, 0.45)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
