/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Neutral slate used for text, technician/admin chrome and surfaces.
        ink: {
          50: '#f7f7f8',
          100: '#eceef1',
          200: '#d6dae1',
          300: '#b0b8c4',
          400: '#8590a1',
          500: '#647082',
          600: '#4c5768',
          700: '#3c4553',
          800: '#272d38',
          900: '#171b22',
        },
        // Primary: the orange the business leads with on its public site.
        brand: {
          50: '#fff5ed',
          100: '#ffe8d4',
          200: '#fed0a8',
          300: '#fdb071',
          400: '#fb8838',
          500: '#f96b12',
          600: '#ea5808',
          700: '#c14209',
          800: '#9a350f',
          900: '#7c2e10',
        },
        // Secondary accent: the lime/olive that pairs with the orange.
        flame: {
          50: '#f8fbea',
          100: '#eef6cf',
          200: '#dcec9f',
          300: '#c4dd68',
          400: '#abc93c',
          500: '#8fae24',
          600: '#6f8a19',
          700: '#556b18',
          800: '#445619',
          900: '#3a491a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.06), 0 8px 24px -12px rgba(16,24,40,0.18)',
      },
    },
  },
  plugins: [],
}
