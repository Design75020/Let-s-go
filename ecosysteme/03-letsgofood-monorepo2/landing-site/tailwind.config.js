/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Outfit", "system-ui", "sans-serif"],
        display: ["Fraunces", "Georgia", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        brand: {
          orange: "#FF5A00",
          "orange-dark": "#E04F00",
          ink: "#0D0D0E",
          nardo: "#6C6F70",
          cream: "#F5F1EA",
          "cream-dark": "#EAE3D5",
          bone: "#FAF8F4",
          light: "#F8F9FA",
          border: "#D9D3C8",
          "border-dark": "#1F1F20",
        },
      },
      letterSpacing: {
        tightest: "-0.04em",
        "extra-tight": "-0.025em",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.7s ease-out both",
        "fade-in-up": "fade-in-up 0.4s ease-out both",
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  plugins: [],
};
