/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      colors: {
        // VSCode-like color scheme
        'vscode': {
          'bg': '#1e1e1e',
          'sidebar': '#252526',
          'panel': '#2d2d2d',
          'border': '#3c3c3c',
          'text': '#cccccc',
          'text-muted': '#858585',
          'accent': '#0078d4',
          'hover': '#2a2d2e',
        }
      },
    },
  },
  plugins: [],
}