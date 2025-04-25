/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./utils/**/*.{js,ts,jsx,tsx}"],
  plugins: [require("daisyui")],
  darkTheme: "matrix",
  darkMode: ["selector", "[data-theme='matrix']"],
  daisyui: {
    themes: [
      {
        light: {
          primary: "#00FF41", // Matrix green
          "primary-content": "#000000",
          secondary: "#005500",
          "secondary-content": "#00FF41",
          accent: "#7CFC00", // Lawrencium (brighter green)
          "accent-content": "#000000",
          neutral: "#101010",
          "neutral-content": "#00FF41",
          "base-100": "#0D0D0D",
          "base-200": "#050505",
          "base-300": "#000000",
          "base-content": "#00FF41",
          info: "#3ABFF8",
          success: "#00FF41",
          warning: "#FBBD23",
          error: "#F87272",
          "--rounded-btn": "0.2rem",
          ".tooltip": { "--tooltip-tail": "6px" },
          ".link": { textUnderlineOffset: "2px" },
          ".link:hover": { opacity: "80%" },
        },
      },
      {
        matrix: {
          primary: "#00FF41", // Matrix green
          "primary-content": "#000000",
          secondary: "#005500",
          "secondary-content": "#00FF41",
          accent: "#7CFC00", // Lawrencium (brighter green)
          "accent-content": "#000000",
          neutral: "#101010",
          "neutral-content": "#00FF41",
          "base-100": "#0D0D0D",
          "base-200": "#050505",
          "base-300": "#000000",
          "base-content": "#00FF41",
          info: "#3ABFF8",
          success: "#00FF41",
          warning: "#FBBD23",
          error: "#F87272",
          "--rounded-btn": "0.2rem",
          ".tooltip": { "--tooltip-tail": "6px", "--tooltip-color": "oklch(var(--p))" },
          ".link": { textUnderlineOffset: "2px", color: "#00FF41" },
          ".link:hover": { opacity: "80%", textShadow: "0 0 5px #00FF41" },
        },
      },
    ],
  },
  theme: {
    extend: {
      colors: {
        matrix: {
          green: "#00FF41",
          "dark-green": "#003B00",
          black: "#000000",
          terminal: "#0D0D0D",
          highlight: "#7CFC00",
        },
      },
      fontFamily: {
        matrix: ["Courier New", "monospace"],
      },
      boxShadow: {
        center: "0 0 12px -2px rgb(0 0 0 / 0.05)",
        matrix: "0 0 10px #00FF41",
        "matrix-intense": "0 0 20px #00FF41",
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "matrix-flicker": "flicker 0.3s infinite alternate",
        "matrix-type": "typing 3.5s steps(30, end), blink .75s step-end infinite",
        "matrix-rain": "matrix-rain 10s linear infinite",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        typing: {
          from: { width: "0" },
          to: { width: "100%" },
        },
        blink: {
          "from, to": { borderColor: "transparent" },
          "50%": { borderColor: "#00FF41" },
        },
        "matrix-rain": {
          "0%": { top: "-10%", opacity: "1" },
          "75%": { top: "100%", opacity: "0.8" },
          "100%": { top: "110%", opacity: "0" },
        },
      },
      textShadow: {
        matrix: "0 0 5px #00FF41",
        "matrix-intense": "0 0 10px #00FF41, 0 0 20px #00FF41",
      },
      backgroundImage: {
        "matrix-code":
          "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cstyle type='text/css'%3E.st0%7Bfont-family:monospace;font-size:10px;fill:%2300FF41;%7D%3C/style%3E%3Ctext x='10' y='20' class='st0'%3E01001%3C/text%3E%3Ctext x='50' y='20' class='st0'%3E10110%3C/text%3E%3Ctext x='10' y='40' class='st0'%3E00101%3C/text%3E%3Ctext x='50' y='40' class='st0'%3E11001%3C/text%3E%3Ctext x='10' y='60' class='st0'%3E10100%3C/text%3E%3Ctext x='50' y='60' class='st0'%3E00110%3C/text%3E%3Ctext x='10' y='80' class='st0'%3E11010%3C/text%3E%3Ctext x='50' y='80' class='st0'%3E01101%3C/text%3E%3C/svg%3E\")",
      },
    },
  },
};
