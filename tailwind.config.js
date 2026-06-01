/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: 'var(--gold)',
        'gold-dim': 'var(--gold-dim)',
        'green-bright': 'var(--green-bright)',
        'red-bright': 'var(--red-bright)',
        dark0: 'var(--dark0)',
        dark1: 'var(--dark1)',
        dark2: 'var(--dark2)',
        dark3: 'var(--dark3)',
        dark4: 'var(--dark4)',
        dark5: 'var(--dark5)',
      },
      fontFamily: {
        title: ['Bebas Neue', 'Impact', 'sans-serif'],
        ui: ['Oswald', 'Arial Narrow', 'sans-serif'],
        mono: ['Share Tech Mono', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
};
