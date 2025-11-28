import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Matching your original colors from index.html
        primary: '#0f2f38',
        secondary: '#f8fafc',
        accent: '#d4af37',
      },
      fontFamily: {
        // Direct font family names to match Google Fonts import
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"), // Ensures prose classes work for your blog
  ],
};
export default config;