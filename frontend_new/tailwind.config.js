/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg:      { DEFAULT: '#0a0a08', 2: '#0f0f0c', 3: '#141410', 4: '#1a1a15' },
        amber:   { DEFAULT: '#f5a623', dim: 'rgba(245,166,35,0.15)' },
        danger:  { DEFAULT: '#e8473f', dim: 'rgba(232,71,63,0.12)' },
        safe:    { DEFAULT: '#4caf72', dim: 'rgba(76,175,114,0.12)' },
        ink:     { 1: '#f0ede8', 2: '#8a8880', 3: '#4a4844' },
        line:    { DEFAULT: 'rgba(255,255,255,0.06)', 2: 'rgba(255,255,255,0.12)' },
      },
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body:    ["'DM Sans'", "sans-serif"],
        mono:    ["'DM Mono'", "monospace"],
      },
      fontSize: {
        '2xs': ['10px', { letterSpacing: '0.1em' }],
      },
      borderRadius: { sm: '2px', DEFAULT: '2px', lg: '4px' },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};