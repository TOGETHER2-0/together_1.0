/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
      },

      colors: {
        brand: {
          50:  '#F7F4FA',
          100: '#EDE5F5',
          200: '#DACAEB',
          300: '#BF9DD6',
          400: '#A370BE',
          500: '#6F2C91',   // JU primary
          600: '#5D2579',
          700: '#4D1D66',   // JU dark
          800: '#3D1652',
          900: '#2D0F3D',
        },
        success: {
          DEFAULT: '#00C49A',
          bg:      'rgba(0,229,179,0.10)',
          border:  'rgba(0,229,179,0.20)',
        },
        warning: {
          DEFAULT: '#FFB547',
          bg:      'rgba(255,181,71,0.10)',
          border:  'rgba(255,181,71,0.20)',
        },
        danger: {
          DEFAULT: '#FF5E7D',
          bg:      'rgba(255,51,87,0.10)',
          border:  'rgba(255,51,87,0.20)',
        },
        surface: {
          base:     '#080810',
          card:     '#131320',
          elevated: '#181828',
        },
      },

      spacing: {
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '15':  '3.75rem',
        '18':  '4.5rem',
        '22':  '5.5rem',
      },

      borderRadius: {
        'xs':   '8px',
        'sm':   '12px',
        'md':   '18px',
        'lg':   '24px',
        'xl':   '32px',
        'pill': '999px',
      },

      fontSize: {
        '2xs': ['10px', { lineHeight: '14px' }],
        'xs':  ['11px', { lineHeight: '16px' }],
        'sm':  ['13px', { lineHeight: '18px' }],
        'base':['15px', { lineHeight: '22px' }],
        'lg':  ['17px', { lineHeight: '24px' }],
        'xl':  ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '30px' }],
        '3xl': ['28px', { lineHeight: '34px' }],
        '4xl': ['32px', { lineHeight: '38px' }],
      },

      boxShadow: {
        'xs':     '0 1px 6px rgba(0,0,0,0.25)',
        'sm':     '0 4px 16px rgba(0,0,0,0.35)',
        'md':     '0 8px 32px rgba(0,0,0,0.45)',
        'lg':     '0 20px 64px rgba(0,0,0,0.55)',
        'brand':  '0 8px 32px rgba(111,44,145,0.40)',
        'glow':   '0 0 48px rgba(111,44,145,0.16)',
        'glow-sm':'0 0 24px rgba(111,44,145,0.10)',
      },

      screens: {
        xs: '375px',
        sm: '430px',
      },

      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.32, 0.72, 0, 1)',
      },

      keyframes: {
        'fade-up':  { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'scale-in': { from: { opacity: '0', transform: 'scale(0.92)' }, to: { opacity: '1', transform: 'scale(1)' } },
        'slide-up': { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
        shimmer:    { to: { backgroundPosition: '-200% 0' } },
      },

      animation: {
        'fade-up':  'fade-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'scale-in': 'scale-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'slide-up': 'slide-up 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        shimmer:    'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
};
