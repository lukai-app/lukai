/** @type {import('tailwindcss').Config} */
/* eslint-disable max-len */
module.exports = {
  darkMode: ['class', 'class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{ts,tsx}',
    './node_modules/@tremor/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    transparent: 'transparent',
    current: 'currentColor',
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          //DEFAULT: 'hsl(var(--primary))',
          DEFAULT: '#00FE03',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        black: '#050505',
        positive: '#2EB88A',
        yc: {
          DEFAULT: '#F37212',
          50: '#FCDAC1',
          100: '#FBCEAD',
          200: '#F9B787',
          300: '#F7A060',
          400: '#F58939',
          500: '#F37212',
          600: '#C3590A',
          700: '#8E4107',
          800: '#582804',
          900: '#231002',
          950: '#080400',
        },
        lettuce: '#34D399',
        lemon: {
          50: '#eefff5',
          100: '#d7ffe9',
          200: '#b2ffd4',
          300: '#76ffb5',
          400: '#34f48c',
          500: '#0aee73',
          600: '#01b855',
          700: '#059046',
          800: '#0a713b',
          900: '#0a5d33',
          950: '#00341a',
          DEFAULT: '#0aee73',
        },
        tremor: {
          brand: {
            faint: '#eff6ff',
            muted: '#bfdbfe',
            subtle: '#60a5fa',
            DEFAULT: '#3b82f6',
            emphasis: '#1d4ed8',
            inverted: '#ffffff',
          },
          background: {
            muted: '#f9fafb',
            subtle: '#f3f4f6',
            DEFAULT: '#ffffff',
            emphasis: '#374151',
          },
          border: {
            DEFAULT: '#e5e7eb',
          },
          ring: {
            DEFAULT: '#e5e7eb',
          },
          content: {
            subtle: '#9ca3af',
            DEFAULT: '#6b7280',
            emphasis: '#374151',
            strong: '#111827',
            inverted: '#ffffff',
          },
        },
        'dark-tremor': {
          brand: {
            faint: '#0B1229',
            muted: '#172554',
            subtle: '#1e40af',
            DEFAULT: '#3b82f6',
            emphasis: '#60a5fa',
            inverted: '#030712',
          },
          background: {
            muted: '#131A2B',
            subtle: '#1f2937',
            DEFAULT: '#111827',
            emphasis: '#d1d5db',
          },
          border: {
            DEFAULT: '#1f2937',
          },
          ring: {
            DEFAULT: '#1f2937',
          },
          content: {
            subtle: '#4b5563',
            DEFAULT: '#6b7280',
            emphasis: '#e5e7eb',
            strong: '#f9fafb',
            inverted: '#000000',
          },
        },
        'color-1': 'hsl(var(--color-1))',
        'color-2': 'hsl(var(--color-2))',
        'color-3': 'hsl(var(--color-3))',
        'color-4': 'hsl(var(--color-4))',
        'color-5': 'hsl(var(--color-5))',
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      fontFamily: {
        chivo: ['--font-chivo', 'sans-serif'],
        courgette: ['var(--font-courgette)'],
        lexend: ['var(--font-lexend)'],
        nunito: ['var(--font-nunito)'],
      },
      boxShadow: {
        'tremor-input': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'tremor-card':
          '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'tremor-dropdown':
          '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'dark-tremor-input': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'dark-tremor-card':
          '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'dark-tremor-dropdown':
          '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      },
      borderRadius: {
        'tremor-small': '0.375rem',
        'tremor-default': '0.5rem',
        'tremor-full': '9999px',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: 0,
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: 0,
          },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        gauge_fadeIn: {
          from: {
            opacity: '0',
          },
          to: {
            opacity: '1',
          },
        },
        gauge_fill: {
          from: {
            'stroke-dashoffset': '332',
            opacity: '0',
          },
          to: {
            opacity: '1',
          },
        },
        'caret-blink': {
          '0%,70%,100%': {
            opacity: '1',
          },
          '20%,50%': {
            opacity: '0',
          },
        },
        shine: {
          '0%': {
            'background-position': '0% 0%',
          },
          '50%': {
            'background-position': '100% 100%',
          },
          to: {
            'background-position': '0% 0%',
          },
        },
        'shimmer-slide': {
          to: {
            transform: 'translate(calc(100cqw - 100%), 0)',
          },
        },
        'spin-around': {
          '0%': {
            transform: 'translateZ(0) rotate(0)',
          },
          '15%, 35%': {
            transform: 'translateZ(0) rotate(90deg)',
          },
          '65%, 85%': {
            transform: 'translateZ(0) rotate(270deg)',
          },
          '100%': {
            transform: 'translateZ(0) rotate(360deg)',
          },
        },
        'background-position-spin': {
          '0%': {
            backgroundPosition: 'top center',
          },
          '100%': {
            backgroundPosition: 'bottom center',
          },
        },
        rainbow: {
          '0%': {
            'background-position': '0%',
          },
          '100%': {
            'background-position': '200%',
          },
        },
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      fontSize: {
        'tremor-label': ['0.75rem'],
        'tremor-default': [
          '0.875rem',
          {
            lineHeight: '1.25rem',
          },
        ],
        'tremor-title': [
          '1.125rem',
          {
            lineHeight: '1.75rem',
          },
        ],
        'tremor-metric': [
          '1.875rem',
          {
            lineHeight: '2.25rem',
          },
        ],
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.8s ease-in-out forwards',
        gauge_fadeIn: 'gauge_fadeIn 1s ease forwards',
        gauge_fill: 'gauge_fill 1s ease forwards',
        'caret-blink': 'caret-blink 1.25s ease-out infinite',
        shine: 'shine var(--duration) infinite linear',
        'shimmer-slide':
          'shimmer-slide var(--speed) ease-in-out infinite alternate',
        'spin-around': 'spin-around calc(var(--speed) * 2) infinite linear',
        'background-position-spin':
          'background-position-spin 3000ms infinite alternate',
        rainbow: 'rainbow var(--speed, 2s) infinite linear',
        'fade-in-up': 'fade-in-up 1s ease-out forwards',
      },
    },
  },
  safelist: [
    {
      pattern:
        /^(bg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ['hover', 'ui-selected'],
    },
    {
      pattern:
        /^(text-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ['hover', 'ui-selected'],
    },
    {
      pattern:
        /^(border-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ['hover', 'ui-selected'],
    },
    {
      pattern:
        /^(ring-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(stroke-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(fill-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
  ],
  plugins: [require('tailwindcss-animate')],
};
