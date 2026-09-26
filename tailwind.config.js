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
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Inter"',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
        mono: [
          '"SF Mono"',
          'ui-monospace',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace'
        ],
        serif: [
          '"New York"',
          'Charter',
          'Georgia',
          'Cambria',
          'serif'
        ]
      },
      colors: {
        clay: {
          bg: '#F2F5F9',
          card: '#FFFFFF',
          darkBg: '#0D1117',
          darkCard: '#161B22',
          accent: '#0071E3',
          purple: '#6366F1',
          cyan: '#06B6D4',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E'
        }
      },
      boxShadow: {
        'clay-sm': '3px 3px 6px #d1d9e6, -3px -3px 6px #ffffff',
        'clay-md': '6px 6px 14px #d1d9e6, -6px -6px 14px #ffffff',
        'clay-lg': '12px 12px 24px #cbd5e1, -12px -12px 24px #ffffff',
        'clay-btn': '4px 4px 10px rgba(0, 113, 227, 0.35), inset 1px 1px 2px rgba(255, 255, 255, 0.6)',
        'clay-dark-sm': '3px 3px 6px #080a0e, -3px -3px 6px #1c222b',
        'clay-dark-md': '6px 6px 14px #080a0e, -6px -6px 14px #1c222b',
        'clay-dark-lg': '10px 10px 22px #07090c, -10px -10px 22px #1f2631',
        'apple-glass': '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
        'pdf-page': '0 10px 30px -5px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)'
      },
      borderRadius: {
        'clay': '22px',
        'clay-sm': '14px',
        'clay-lg': '30px',
        'ios': '16px'
      }
    },
  },
  plugins: [],
}
