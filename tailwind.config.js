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
        canvas: "#07080a",
        panel: "#101114",
        line: "#24262d",
        blood: "#e11d2e",
        ember: "#ff3d49",
        bone: "#f4f0e8",
      },
      boxShadow: {
        red: "0 20px 80px rgba(225, 29, 46, 0.22)",
      },
    },
  },
  plugins: [],
};
