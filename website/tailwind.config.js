/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          DEFAULT: '#ff99bb',
          soft: '#ffd6e5',
          deep: '#cc6f90',
        },
        dylan: {
          DEFAULT: '#2a2a2f',
          light: '#4a4a55',
          accent: '#8888aa',
        },
        manon: '#ff99bb',
        bg: {
          DEFAULT: '#fff5f7',
          dark: '#0d0d0f',
        },
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        body: ['Pretendard Variable', 'Pretendard', 'sans-serif'],
        accent: ['Gowun Batang', 'Jeju Myeongjo', 'serif'],
        mono: ['Space Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}