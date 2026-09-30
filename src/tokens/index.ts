/**
 * CampusLab Design System — Centralized Design Tokens
 * 
 * Aesthetic Philosophy:
 * - Premium, modern, minimal, dark, sophisticated, editorial, technical, calm, intentional.
 * - Rooted in institutional engineering and academic rigor.
 * - Avoids generic AI SaaS neon or arbitrary gradients.
 */

export const colors = {
  surface: {
    void: '#050505',
    near: '#080808',
    obsidian: '#0D0D0D',
    dark: '#111111',
    soft: '#161616',
    base: '#050505',
    elevated: '#0D0D0D',
    subtle: '#111111',
    card: 'rgba(13, 13, 13, 0.72)',
    cardSolid: '#0D0D0D',
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
  accents: {
    teal: {
      default: '#14B8A6',
      light: '#2DD4BF',
      dark: '#0D9488',
      bg: 'rgba(20, 184, 166, 0.08)',
      border: 'rgba(20, 184, 166, 0.22)',
    },
    indigo: {
      default: '#F5F5F5',
      light: '#B8B8B8',
      dark: '#777777',
      bg: 'rgba(255, 255, 255, 0.05)',
      border: 'rgba(255, 255, 255, 0.10)',
    },
    amber: {
      default: '#E5A544',
      light: '#F3B755',
      bg: 'rgba(229, 165, 68, 0.08)',
      border: 'rgba(229, 165, 68, 0.20)',
    },
    emerald: {
      default: '#14B8A6',
      light: '#2DD4BF',
      bg: 'rgba(20, 184, 166, 0.08)',
      border: 'rgba(20, 184, 166, 0.22)',
    },
    rose: {
      default: '#E05260',
      light: '#F26D7A',
      bg: 'rgba(224, 82, 96, 0.08)',
      border: 'rgba(224, 82, 96, 0.20)',
    },
  },
} as const;

export const typography = {
  fontFamilies: {
    sans: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
    serif: "'Newsreader', Georgia, serif",
  },
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  tracking: {
    tighter: '-0.04em',
    tight: '-0.02em',
    normal: '0em',
    wide: '0.04em',
    wider: '0.08em',
    widest: '0.14em',
  },
  lineHeights: {
    none: 1,
    tight: 1.15,
    snug: 1.3,
    relaxed: 1.6,
    loose: 1.8,
  },
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
  '4xl': '96px',
  layout: {
    gutterMobile: '16px',
    gutterDesktop: '32px',
    maxWidth: '1280px',
    sectionPaddingY: '104px',
  },
} as const;

export const radius = {
  xs: '4px',
  sm: '6px',
  md: '10px',
  lg: '14px',
  xl: '18px',
  '2xl': '24px',
  '3xl': '32px',
  full: '9999px',
} as const;

export const borders = {
  width: {
    hairline: '1px',
    focus: '2px',
  },
  styles: {
    subtle: '1px solid rgba(255, 255, 255, 0.05)',
    default: '1px solid rgba(255, 255, 255, 0.09)',
    active: '1px solid rgba(255, 255, 255, 0.18)',
    strong: '1px solid rgba(255, 255, 255, 0.28)',
  },
} as const;

export const shadows = {
  subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
  card: '0 4px 20px -2px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.06)',
  cardHover: '0 8px 30px -4px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.12)',
  elevated: '0 16px 40px -8px rgba(0, 0, 0, 0.75), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
  modal: '0 24px 64px -12px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.12)',
} as const;

export const transitions = {
  duration: {
    fast: '150ms',
    default: '220ms',
    slow: '400ms',
  },
  easing: {
    smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;
