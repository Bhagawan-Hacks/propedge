import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        trading: {
          bull: "#10b981", // green-500
          bear: "#ef4444", // red-500
          bg: "#06080f",
          card: "#0f1523",
          border: "#1e2638",
          accent: "#8b5cf6",
        },
        fp: {
          bg: "#06080f",
          surface: "#0a0e1a",
          card: "#101626",
          cardHover: "#151e33",
          border: "#1d2538",
          borderLight: "#2c3852",
          purple: "#8b5cf6",
          purpleDark: "#6d28d9",
          purpleLight: "#a78bfa",
          emerald: "#10b981",
          cyan: "#06b6d4",
          gold: "#f59e0b",
        },
      },
      boxShadow: {
        "glow-purple": "0 0 25px -5px rgba(139, 92, 246, 0.4)",
        "glow-purple-lg": "0 0 50px -10px rgba(139, 92, 246, 0.35)",
        "glow-emerald": "0 0 25px -5px rgba(16, 185, 129, 0.3)",
        "fp-card": "0 8px 30px rgba(0, 0, 0, 0.45)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;

