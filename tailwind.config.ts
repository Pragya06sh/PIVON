import type { Config } from "tailwindcss";

// PIVON design tokens
// bg:        obsidian, near-black with a warm undertone (not pure #000, not cream)
// brass:     antique brass/gold — the signature accent, distinct from Claude-orange/terracotta
// ink:       warm off-white for body text on dark
// signal:    deep emerald used sparingly for "AI qualified" states — the one cool counterpoint
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: "#0A0A0C",
          raised: "#131316",
          line: "#232226",
        },
        brass: {
          DEFAULT: "#C9A15A",
          bright: "#E8C77E",
          dim: "#8A6F3E",
        },
        ink: {
          DEFAULT: "#E7E5E0",
          muted: "#9A968C",
          faint: "#5F5C56",
        },
        signal: {
          DEFAULT: "#2F6E5C",
          bright: "#4FA98A",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-general)", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        widest2: "0.28em",
      },
      backgroundImage: {
        "brass-sheen":
          "linear-gradient(115deg, #8A6F3E 0%, #E8C77E 35%, #C9A15A 55%, #8A6F3E 100%)",
        "grain": "url('/textures/grain.png')",
      },
      transitionTimingFunction: {
        cinematic: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
