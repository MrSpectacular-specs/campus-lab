/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          void: '#050505',
          near: '#080808',
          obsidian: '#0D0D0D',
          dark: '#111111',
          soft: '#161616',
          // Semantic mappings for backwards-compatibility across pages
          base: '#050505',
          elevated: '#0D0D0D',
          subtle: '#111111',
          card: 'rgba(13, 13, 13, 0.72)',
          'card-solid': '#0D0D0D',
          highlight: 'rgba(255, 255, 255, 0.04)',
          overlay: 'rgba(5, 5, 5, 0.85)',
        },
        border: {
          muted: 'rgba(255, 255, 255, 0.04)',
          default: 'rgba(255, 255, 255, 0.07)',
          hover: 'rgba(255, 255, 255, 0.13)',
          active: 'rgba(255, 255, 255, 0.20)',
          strong: 'rgba(255, 255, 255, 0.28)',
        },
        text: {
          primary: '#F5F5F5',
          secondary: '#B8B8B8',
          muted: '#777777',
          faint: '#444444',
        },
        brand: {
          teal: {
            DEFAULT: '#14B8A6',
            light: '#2DD4BF',
            dark: '#0D9488',
            bg: 'rgba(20, 184, 166, 0.08)',
            border: 'rgba(20, 184, 166, 0.22)',
          },
          // Neutralized secondary accents to prevent multi-color carnival while keeping compile safety
          indigo: {
            DEFAULT: '#F5F5F5',
            light: '#B8B8B8',
            dark: '#777777',
            bg: 'rgba(255, 255, 255, 0.05)',
            border: 'rgba(255, 255, 255, 0.10)',
          },
          amber: {
            DEFAULT: '#E5A544',
            light: '#F3B755',
            bg: 'rgba(229, 165, 68, 0.08)',
            border: 'rgba(229, 165, 68, 0.20)',
          },
          emerald: {
            DEFAULT: '#14B8A6',
            light: '#2DD4BF',
            bg: 'rgba(20, 184, 166, 0.08)',
            border: 'rgba(20, 184, 166, 0.22)',
          },
          rose: {
            DEFAULT: '#E05260',
            light: '#F26D7A',
            bg: 'rgba(224, 82, 96, 0.08)',
            border: 'rgba(224, 82, 96, 0.20)',
          }
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        serif: ['Newsreader', 'Georgia', 'serif'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.06)',
        'card-hover': '0 8px 30px -4px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.12)',
        'elevated': '0 16px 40px -8px rgba(0, 0, 0, 0.75), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'modal': '0 24px 64px -12px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.12)',
      },
      borderRadius: {
        'xs': '4px',
        'sm': '6px',
        'md': '10px',
        'lg': '14px',
        'xl': '18px',
        '2xl': '24px',
        '3xl': '32px',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
      }
    },
  },
  plugins: [],
};
