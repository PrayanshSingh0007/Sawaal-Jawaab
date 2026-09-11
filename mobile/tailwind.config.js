/** @type {import('tailwindcss').Config} */
module.exports = {
  // The app is light-only by design; 'class' keeps NativeWind from trying to
  // drive the system colour scheme.
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        canvas: '#EDEAE5',
        'canvas-lift': '#F4F2EE',
        surface: '#FAF9F6',
        'surface-sunk': '#E6E2DC',
        accent: '#F2622E',
        'accent-deep': '#C74A1C',
        'accent-ink': '#A83C0E',
        'accent-soft': '#FCE3D5',
        ink: '#1A1714',
        'ink-2': '#6B645C',
        'ink-3': '#A39C93',
        'pill-dark': '#24211E',
        ok: '#3F7D58',
        warn: '#B8410E',
      },
      borderRadius: {
        sheet: '32px',
        card: '28px',
        tile: '20px',
        sm: '14px',
        pill: '999px',
      },
      fontFamily: {
        sans: ['Inter_400Regular'],
        medium: ['Inter_500Medium'],
        semibold: ['Inter_600SemiBold'],
        bold: ['Inter_700Bold'],
      },
    },
  },
  plugins: [],
}
