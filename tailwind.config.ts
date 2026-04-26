import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1280px" },
    },
    screens: {
      xs: "420px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        bg: {
          DEFAULT: "hsl(var(--bg))",
          subtle: "hsl(var(--bg-subtle))",
          muted: "hsl(var(--bg-muted))",
          inset: "hsl(var(--bg-inset))",
        },
        fg: {
          DEFAULT: "hsl(var(--fg))",
          muted: "hsl(var(--fg-muted))",
          subtle: "hsl(var(--fg-subtle))",
        },
        border: {
          DEFAULT: "hsl(var(--border))",
          strong: "hsl(var(--border-strong))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          fg: "hsl(var(--accent-fg))",
          subtle: "hsl(var(--accent-subtle))",
        },
        success: "hsl(var(--success))",
        warn: "hsl(var(--warn))",
        danger: "hsl(var(--danger))",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "shimmer": {
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 hsl(var(--accent) / 0.4)" },
          "50%": { boxShadow: "0 0 0 10px hsl(var(--accent) / 0)" },
        },
        "spin-slow": {
          "to": { transform: "rotate(360deg)" },
        },
        "marquee": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 240ms cubic-bezier(0.2, 0.8, 0.2, 1) both",
        "slide-up": "slide-up 380ms cubic-bezier(0.2, 0.8, 0.2, 1) both",
        "slide-down": "slide-down 280ms cubic-bezier(0.2, 0.8, 0.2, 1) both",
        "scale-in": "scale-in 240ms cubic-bezier(0.2, 0.8, 0.2, 1) both",
        "shimmer": "shimmer 1.4s infinite",
        "pulse-soft": "pulse-soft 1.6s ease-in-out infinite",
        "float": "float 4s ease-in-out infinite",
        "gradient-shift": "gradient-shift 8s ease infinite",
        "glow-pulse": "glow-pulse 2.4s ease-out infinite",
        "spin-slow": "spin-slow 18s linear infinite",
        "marquee": "marquee 40s linear infinite",
      },
      transitionTimingFunction: {
        "swift": "cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
      transitionDelay: {
        "0": "0ms",
        "50": "50ms",
        "100": "100ms",
        "150": "150ms",
        "200": "200ms",
        "250": "250ms",
        "300": "300ms",
        "400": "400ms",
        "500": "500ms",
        "600": "600ms",
        "700": "700ms",
        "800": "800ms",
        "1000": "1000ms",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(var(--accent) / 0.15), transparent)",
      },
    },
  },
  plugins: [],
};

export default config;
