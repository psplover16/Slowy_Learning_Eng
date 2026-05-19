import type { Config } from 'tailwindcss'
import safeArea from 'tailwindcss-safe-area'

const config: Config = {
  content: ['./index.html', './src/**/*.{vue,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F4ECDC',
        'paper-2': '#FBF6EA',
        'paper-3': '#FFFCF4',
        ink: '#322B22',
        'ink-soft': '#5E5446',
        'ink-faint': '#897C66',
        terracotta: '#BF5635',
        'terracotta-deep': '#9C4226',
        sage: '#6B7848',
        'sage-deep': '#525C36',
        ochre: '#C28A2C',
        'ochre-deep': '#9C6E1C',
        'teal-eng': '#3F726E',
        'teal-eng-deep': '#2F5754',
        line: '#D9C9A8',
        'line-soft': '#E6DAC0',
      },
      fontFamily: {
        fraunces: ['Fraunces', 'serif'],
        newsreader: ['Newsreader', 'serif'],
        'noto-tc': ['"Noto Sans TC"', 'sans-serif'],
      },
    },
  },
  plugins: [safeArea],
}

export default config
