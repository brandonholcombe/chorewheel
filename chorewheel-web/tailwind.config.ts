import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Status palette shared by webapp + Pi display.
        fresh: '#16a34a',
        due: '#f59e0b',
        overdue: '#dc2626',
      },
    },
  },
  plugins: [],
};

export default config;
