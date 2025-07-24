/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'irish-green': {
          light: '#63B365',
          DEFAULT: '#169B62', // Irish green
          dark: '#0A5D34',
        },
        'irish-orange': {
          light: '#FFA656',
          DEFAULT: '#FF883E', // Irish orange
          dark: '#E65A0D',
        },
        'irish-white': '#FFFFFF',
        'irish-stone': {
          light: '#EDEDED',
          DEFAULT: '#D9D9D9',
          dark: '#9CA3AF',
        },
        'irish-navy': {
          light: '#4B6982',
          DEFAULT: '#2A405A',
          dark: '#1A2A3E',
        },
      },
    },
  },
  plugins: [],
}
