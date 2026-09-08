/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f5f7fa',
          100: '#e9edf3',
          200: '#cfd8e3',
          300: '#a9b8cc',
          400: '#7c90ad',
          500: '#5b708f',
          600: '#465873',
          700: '#39485d',
          800: '#26313f',
          900: '#161d26',
        },
        brand: {
          50: '#eef5ff',
          100: '#d9e7ff',
          200: '#bcd5ff',
          300: '#8ebbff',
          400: '#5996ff',
          500: '#3272f7',
          600: '#1d54e4',
          700: '#1841b8',
          800: '#193991',
          900: '#1a3372',
        },
        flame: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
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
