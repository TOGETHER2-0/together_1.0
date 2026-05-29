/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
        display: ["'Clash Display'", "'DM Sans'", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#f0f4ff",
          100: "#dde7ff",
          200: "#c3d2ff",
          300: "#9db3ff",
          400: "#7589fd",
          500: "#5660f7",
          600: "#4540ec",
          700: "#3a32d1",
          800: "#302ba9",
          900: "#2c2a85",
        },
        surface: {
          50: "#fafafa",
          100: "#f5f5f5",
          900: "#0f0f13",
          950: "#09090b",
        }
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      }
    },
  },
  plugins: [],
};
