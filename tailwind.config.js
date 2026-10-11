/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        serif: ['"Instrument Serif"', 'serif'],
        crest: ['Cinzel', 'serif'],
      },
      colors: {
        academy: {
          navy: '#0b192c',
          slate: '#1e293b',
          muted: '#64748b',
          accent: '#2563eb',
          lightBlue: '#dbeafe',
          subtleBg: '#f0f5fa',
        },
      },
    },
  },
  plugins: [],
}