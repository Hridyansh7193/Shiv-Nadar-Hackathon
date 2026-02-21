/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
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
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        cyber: {
          green: "#00ff88",
          yellow: "#ffaa00",
          red: "#ff3366",
          blue: "#00d4ff",
          purple: "#8b5cf6",
          dark: "#0a0e1a",
          darker: "#060810",
          card: "#111827",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { opacity: 0.4 },
          "50%": { opacity: 1 },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "fade-up": {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "scan-line": "scan-line 3s ease-in-out infinite",
        "fade-up": "fade-up 0.5s ease-out forwards",
      },
      boxShadow: {
        "glow-green": "0 0 20px rgba(0, 255, 136, 0.3)",
        "glow-yellow": "0 0 20px rgba(255, 170, 0, 0.3)",
        "glow-red": "0 0 20px rgba(255, 51, 102, 0.3)",
        "glow-blue": "0 0 20px rgba(0, 212, 255, 0.3)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
