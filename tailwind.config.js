/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Oswald", "Inter", "ui-sans-serif", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        ink: "#08080b",
        coal: "#0e0e13",
        surface: "#131319",
        elevated: "#1b1b22",
        line: "rgba(255,255,255,0.08)",
        blood: "#e5202d",
        ember: "#ff3b45",
        gold: "#f3b433",
        bone: "#f4f4f5",
      },
      boxShadow: {
        red: "0 20px 60px -18px rgba(229,32,45,0.45)",
        glow: "0 0 0 1px rgba(229,32,45,0.35), 0 22px 60px -20px rgba(229,32,45,0.55)",
        panel: "0 24px 70px -30px rgba(0,0,0,0.85)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-red": {
          "0%,100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both",
        "pulse-red": "pulse-red 2.4s ease-in-out infinite",
        marquee: "marquee 32s linear infinite",
      },
    },
  },
  plugins: [],
};
