import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Bold geometric palette. `ink`/`paper` flip in dark mode via CSS vars
        // (see globals.css) so borders + hard shadows stay high-contrast.
        ink: 'rgb(var(--ink) / <alpha-value>)',
        paper: 'rgb(var(--paper) / <alpha-value>)',
        panel: 'rgb(var(--panel) / <alpha-value>)',
        brand: '#6d4aff', // vivid violet — primary accent / brand
        coral: '#ff5c7a',
        sun: '#ffc23c',
        sky: '#3cc9ff',
        // Chore freshness status (shared with the Pi kiosk view).
        fresh: '#12b76a',
        due: '#f79009',
        overdue: '#f04438',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // Hard offset "sticker" shadows. Color = --hard (flips in dark mode).
        'hard-sm': '2px 2px 0 0 rgb(var(--hard))',
        hard: '4px 4px 0 0 rgb(var(--hard))',
        'hard-lg': '6px 6px 0 0 rgb(var(--hard))',
        'hard-xl': '9px 9px 0 0 rgb(var(--hard))',
      },
      borderRadius: {
        xl: '0.9rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      rotate: {
        '1.5': '1.5deg',
        '2.5': '2.5deg',
      },
      keyframes: {
        'pop-in': {
          '0%': { transform: 'translateY(6px) scale(0.98)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0) rotate(var(--tw-rotate, 0))' },
          '50%': { transform: 'translateY(-10px) rotate(var(--tw-rotate, 0))' },
        },
      },
      animation: {
        'pop-in': 'pop-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'float-slow': 'float 9s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
