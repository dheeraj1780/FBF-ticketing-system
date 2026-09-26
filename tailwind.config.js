/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      colors: {
        canvas: {
          DEFAULT: "#080c14",
          raised: "#0d1420",
          panel: "#101a29",
          border: "#1c2a3d",
        },
        brand: {
          50: "#eafffe",
          100: "#cbfdfb",
          200: "#98f8f6",
          300: "#5fecec",
          400: "#2ad6dc",
          500: "#12b6c0",
          600: "#0d90a0",
          700: "#0f7382",
          800: "#125d6a",
          900: "#134d59",
          950: "#062f38",
        },
        accent: {
          amber: "#f5b942",
          rose: "#f0577a",
          violet: "#a78bfa",
          lime: "#a3e635",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(42,214,220,0.15), 0 8px 30px -8px rgba(42,214,220,0.25)",
        card: "0 1px 0 rgba(255,255,255,0.04) inset, 0 10px 30px -15px rgba(0,0,0,0.6)",
      },
      keyframes: {
        dash: {
          to: { strokeDashoffset: "0" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        pulseGlow: "pulseGlow 2.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
