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
        // These variables correspond to the fonts set up in layout.tsx
        sans: ['var(--font-inter)'],
        serif: ['var(--font-playfair)'],
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"), // Ensures prose classes work for your blog
  ],
};
export default config;