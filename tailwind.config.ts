import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background:          'hsl(var(--background) / <alpha-value>)',
        surface:             'hsl(var(--surface) / <alpha-value>)',
        'surface-raised':    'hsl(var(--surface-raised) / <alpha-value>)',
        foreground:          'hsl(var(--foreground) / <alpha-value>)',
        'muted-foreground':  'hsl(var(--muted-foreground) / <alpha-value>)',
        'accent-ember':      'hsl(var(--accent-ember) / <alpha-value>)',
        'accent-jade':       'hsl(var(--accent-jade) / <alpha-value>)',
        'accent-sakura':     'hsl(var(--accent-sakura) / <alpha-value>)',
        border:              'hsl(var(--border) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Instrument Serif', 'serif'],
        body:    ['Inter', 'sans-serif'],
        jp:      ['Noto Sans JP', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        'fade-rise':       { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'pulse-glow':      { '0%,100%': { boxShadow: '0 0 12px hsl(var(--accent-ember)/0.4)' }, '50%': { boxShadow: '0 0 28px hsl(var(--accent-ember)/0.8)' } },
        'shimmer':         { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        'slide-in-right':  { from: { opacity: '0', transform: 'translateX(32px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        'blink':           { '0%,100%': { opacity: '1' }, '50%': { opacity: '0' } },
      },
      animation: {
        'fade-rise':       'fade-rise 0.8s ease-out 0s both',
        'fade-rise-1':     'fade-rise 0.8s ease-out 0.1s both',
        'fade-rise-2':     'fade-rise 0.8s ease-out 0.2s both',
        'fade-rise-3':     'fade-rise 0.8s ease-out 0.4s both',
        'fade-rise-4':     'fade-rise 0.8s ease-out 0.6s both',
        'pulse-glow':      'pulse-glow 2s ease-in-out infinite',
        'slide-in-right':  'slide-in-right 0.3s ease-out both',
        'shimmer':         'shimmer 1.5s infinite',
        'blink':           'blink 0.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config