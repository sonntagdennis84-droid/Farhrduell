import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./features/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        show: {
          navy: "#08182E",
          panel: "#12161D",
          gold: "#F6B400",
          blue: "#2D6BFF",
          orange: "#FF8A00",
          green: "#16C66B",
          red: "#F44336"
        }
      },
      boxShadow: {
        glow: "0 0 42px rgba(246,180,0,0.22)"
      }
    }
  },
  plugins: []
};

export default config;
