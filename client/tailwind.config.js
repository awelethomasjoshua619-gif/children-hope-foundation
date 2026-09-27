/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'hope-blue': '#2563eb',
        'hope-dark': '#1e40af',
        'hope-green': '#16a34a',
        'soft-gray': '#f8fafc',
      },
    },
  },
  plugins: [],
};
