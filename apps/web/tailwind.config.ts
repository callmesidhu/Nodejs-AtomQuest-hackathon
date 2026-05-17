import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17202A",
        brand: "#28666E",
        coral: "#D95D39",
        mint: "#C8E7DC",
        panel: "#F7F8FA"
      },
      boxShadow: { soft: "0 12px 30px rgba(23,32,42,.08)" }
    }
  },
  plugins: []
} satisfies Config;
