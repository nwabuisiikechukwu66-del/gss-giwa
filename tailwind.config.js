/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        green: {
          DEFAULT: '#1a6b3a',
          dark: '#0f4425',
          mid: '#237a44',
          light: '#e8f4ed',
          pale: '#f4faf6',
        },
        ink: {
          DEFAULT: '#1a1a18',
          mid: '#3a3a36',
          soft: '#6b6b64',
        },
        rule: {
          DEFAULT: '#d4e8db',
          dark: '#b8d8c4',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}
