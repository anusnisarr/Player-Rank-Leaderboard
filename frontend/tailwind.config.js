/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Bebas Neue'", "cursive"],
        mono: ["'JetBrains Mono'", "monospace"],
        body: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        bg: "#0A0A0B",
        surface: "#111113",
        border: "#1E1E22",
        muted: "#3A3A42",
        text: "#E8E8F0",
        dim: "#7A7A8C",
        accent: "#FF4655",
        "accent-dim": "rgba(255,70,85,0.15)",
        gold: "#FFD700",
        silver: "#C0C0C0",
        bronze: "#CD7F32",
        tier: {
          S: "#FFD700",
          A: "#FF6B35",
          B: "#4ECDC4",
          C: "#A8DADC",
          D: "#6C757D",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-up": "slideUp 0.4s ease forwards",
        "pulse-accent": "pulseAccent 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(16px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        pulseAccent: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255,70,85,0)" },
          "50%": { boxShadow: "0 0 0 6px rgba(255,70,85,0.15)" },
        },
      },
    },
  },
  plugins: [],
};
