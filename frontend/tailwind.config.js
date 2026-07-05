/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        forge: {
          900: "#050810",
          800: "#0a0f1e",
          700: "#0f1832",
          600: "#162040",
          500: "#1e2d55",
        },
        neon: {
          cyan: "#00f5ff",
          orange: "#ff6b00",
          red: "#ff2d55",
          green: "#00ff88",
          yellow: "#ffd600",
          purple: "#9b59ff",
        },
        metal: {
          100: "#e8eaf0",
          300: "#9ba3b8",
          500: "#4a5568",
          700: "#2d3748",
          900: "#1a202c",
        },
      },
      fontFamily: {
        display: ["'Orbitron'", "monospace"],
        body: ["'Exo 2'", "sans-serif"],
        mono: ["'Share Tech Mono'", "monospace"],
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(rgba(0,245,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.05) 1px, transparent 1px)",
        "metal-gradient": "linear-gradient(135deg, #1a202c 0%, #2d3748 50%, #1a202c 100%)",
        "forge-gradient": "radial-gradient(ellipse at top, #162040 0%, #050810 70%)",
      },
      backgroundSize: {
        "grid": "40px 40px",
      },
      animation: {
        "pulse-neon": "pulseNeon 2s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
        "float": "float 3s ease-in-out infinite",
        "scan": "scan 2s linear infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "slide-in": "slideIn 0.5s ease-out",
        "fade-up": "fadeUp 0.6s ease-out",
      },
      keyframes: {
        pulseNeon: {
          "0%, 100%": { opacity: 1, boxShadow: "0 0 5px #00f5ff, 0 0 20px #00f5ff" },
          "50%": { opacity: 0.7, boxShadow: "0 0 2px #00f5ff, 0 0 8px #00f5ff" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        glow: {
          "from": { textShadow: "0 0 5px #00f5ff, 0 0 10px #00f5ff" },
          "to": { textShadow: "0 0 10px #00f5ff, 0 0 25px #00f5ff, 0 0 50px #00f5ff" },
        },
        slideIn: {
          from: { transform: "translateX(-20px)", opacity: 0 },
          to: { transform: "translateX(0)", opacity: 1 },
        },
        fadeUp: {
          from: { transform: "translateY(20px)", opacity: 0 },
          to: { transform: "translateY(0)", opacity: 1 },
        },
      },
      boxShadow: {
        "neon-cyan": "0 0 10px rgba(0,245,255,0.5), 0 0 30px rgba(0,245,255,0.2)",
        "neon-orange": "0 0 10px rgba(255,107,0,0.5), 0 0 30px rgba(255,107,0,0.2)",
        "neon-red": "0 0 10px rgba(255,45,85,0.5), 0 0 30px rgba(255,45,85,0.2)",
        "neon-green": "0 0 10px rgba(0,255,136,0.5), 0 0 30px rgba(0,255,136,0.2)",
        "glass": "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
      },
    },
  },
  plugins: [],
};
