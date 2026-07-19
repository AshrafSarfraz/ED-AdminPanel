/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
    },
    extend: {
      colors: {
        brand: {
          primary:   "#f15a21",
          secondary: "#ff7d47",
          light:     "#FFF1DD",
          lighter:   "#FFF8EF",
          border:    "#f5dfc7",
          soft:      "#fff7f0",
          white:     "#ffffff",
          black:     "#000000",
          dark:      "#111827",
          gray:      "#566171",
          muted:     "#9ca3af",
          faint:     "#fafafa",
        },
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #f15a21 0%, #ff7d47 100%)",
        "brand-warm":     "linear-gradient(135deg, #FFF1DD 0%, #FFF8EF 25%, #FFFFFF 55%)",
        "brand-active":   "linear-gradient(135deg, #FFFFFF 0%, #FFF8EF 55%, #FFF1DD 100%)",
      },
    },
  },
  plugins: [],
}