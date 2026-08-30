/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Sora", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        canvas: "#f6f4f1",
        panel: "#ffffff",
        line: "#d9d4cc",
        blood: "#e11d2e",
        ember: "#ff3d49",
        bone: "#111217",
      },
      boxShadow: {
        red: "0 16px 45px rgba(17, 18, 23, 0.08)",
      },
    },
  },
  plugins: [],
};
