import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FAF6EE',
        'cream-dark': '#F2EBD9',
        navy: {
          DEFAULT: '#0F1624',
          light: '#1A2438',
        },
        gold: {
          DEFAULT: '#C9A84C',
          light: '#E8D5A0',
          dark: '#A8813A',
          muted: '#D4B896',
          pale: '#F5EDD5',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'cream-gradient': 'radial-gradient(ellipse at 50% 0%, #F2EBD9 0%, #FAF6EE 60%)',
      },
    },
  },
  plugins: [],
}

export default config
