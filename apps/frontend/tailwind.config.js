/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        legion: {
          navy: '#1A2332',
          gold: '#B8956A',
          'tech-blue': '#4A7C9C',
          light: '#E8EEF2',
        },
        status: {
          backlog: '#9CA3AF',
          todo: '#3B82F6',
          'in-progress': '#F59E0B',
          review: '#8B5CF6',
          done: '#10B981',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
  safelist: [],
}