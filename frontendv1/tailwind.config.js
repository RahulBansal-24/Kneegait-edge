/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14213D',
        paper: '#F5F8F9',
        line: '#DCE4E8',
        muted: '#5E707B',
        signal: '#0F9D8A',
        alert: '#D64545',
        warn: '#B07A00',
      },
      fontFamily: { sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
