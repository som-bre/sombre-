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
        crimson: {
          DEFAULT: '#8B1538',
          dark: '#6A1030',
          light: '#A62045',
        },
        sadham: '#5E7B97',
        media: '#8B1538',
        bg: {
          DEFAULT: '#EFEFEF',
          cream: '#F5F2EE',
        },
        ink: {
          DEFAULT: '#2d2d2d',
          light: '#666',
          faint: '#999',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Noto Serif KR', 'serif'],
        serif: ['Noto Serif KR', 'Gowun Batang', 'serif'],
        body: ['Pretendard Variable', 'Pretendard', 'sans-serif'],
        accent: ['Gowun Batang', 'serif'],
      },
    },
  },
  plugins: [],
}
