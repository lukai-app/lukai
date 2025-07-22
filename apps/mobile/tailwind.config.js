/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        apollo: '#0E9D36',
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
        black: '#05060A',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
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
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        gauge_fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        gauge_fill: {
          from: { 'stroke-dashoffset': '332', opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        gauge_fadeIn: 'gauge_fadeIn 1s ease forwards',
        gauge_fill: 'gauge_fill 1s ease forwards',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
