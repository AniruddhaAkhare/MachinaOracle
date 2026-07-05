/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'IBM Plex Sans'", 'system-ui', 'sans-serif'],
        cond: ["'IBM Plex Sans Condensed'", 'sans-serif'],
        mono: ["'IBM Plex Mono'", 'monospace'],
      },
    },
  },
  plugins: [],
};
