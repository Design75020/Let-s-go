/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Outfit", "system-ui", "sans-serif"] },
      colors: {
        brand: {
          orange: "#FF5A00",
          "orange-dark": "#E04F00",
          ink: "#1A1A1B",
          nardo: "#6C6F70",
          light: "#F8F9FA",
          border: "#E5E7EB",
        },
      },
    },
  },
  plugins: [],
};
