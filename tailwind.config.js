/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary-color)',
          50: '#e6ebf5',
          100: '#ccd7eb',
          200: '#99afd7',
          300: '#6687c3',
          400: '#335faf',
          500: 'var(--primary-color)', // #001547
          600: 'var(--tertiary-color)', // #0035b5
          700: '#002a8f',
          800: '#001f69',
          900: '#001443',
          950: '#000a1d',
        },
        secondary: {
          DEFAULT: 'var(--secondary-color)',
          50: '#e6fef8',
          100: '#ccfdf1',
          200: '#99fbe3',
          300: '#66f9d5',
          400: '#33f7c7',
          500: 'var(--secondary-color)', // #00ef9c
          600: '#00bf7d',
          700: '#008f5e',
          800: '#00603e',
          900: '#00301f',
        },
        muted: 'var(--muted-color)',
        warning: 'var(--warning-color)',
        error: 'var(--error-color)',
        success: 'var(--success-color)',
      },
      backgroundColor: {
        'body': 'var(--body-background-color)',
        'app': 'var(--background-color)',
      },
      textColor: {
        'primary': 'var(--primary-text)',
        'secondary': 'var(--secondary-text)',
        'tertiary': 'var(--tertiary-text)',
      },
    },
  },
  plugins: [],
}
