/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Urbanist_400Regular'],
        light: ['Urbanist_300Light'],
        regular: ['Urbanist_400Regular'],
        medium: ['Urbanist_500Medium'],
        semibold: ['Urbanist_600SemiBold'],
        bold: ['Urbanist_700Bold'],
        extrabold: ['Urbanist_800ExtraBold'],
      },
      colors: {
        background: {
          light: '#FFFFFF',
          dark: '#0F172A',
        },
        surface: {
          light: '#F9FAFB',
          dark: '#1E293B',
        },
        card: {
          light: '#FFFFFF',
          dark: '#1E293B',
        },
      },
    },
  },
  plugins: [],
};
