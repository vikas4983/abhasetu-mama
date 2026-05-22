import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          card: "var(--bg-card)",
          hover: "var(--bg-card-hover)"
        },
        accent: {
          teal: "var(--accent-teal)",
          cyan: "var(--accent-cyan)",
          blue: "var(--accent-blue)"
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)"
        },
        border: "var(--border-color)"
      },
      boxShadow: {
        surface: "var(--surface-shadow)"
      },
      borderRadius: {
        card: "8px"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;
