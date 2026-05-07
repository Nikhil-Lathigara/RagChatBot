/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b0b0f",
        card: "#121218",
        accent: "#ff7a18",
        accent2: "#ff3d00"
      },
      boxShadow: {
        glow: "0 0 30px rgba(255, 122, 24, 0.25)"
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "Inter", "Segoe UI", "Roboto", "Arial"]
      }
    },
  },
  plugins: [],
};
