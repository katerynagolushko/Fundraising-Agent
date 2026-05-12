export const colors = {
  // Base
  beige: '#F2EBD9',
  beigeLight: '#F8F4EC',
  beigeDark: '#E5DCCA',

  // Accents
  gold: '#A67C2E',
  goldLight: '#C4A661',
  goldDark: '#8A6625',

  // CTAs
  red: '#8C3020',
  redLight: '#A64636',
  redDark: '#6B2418',

  // Neutrals
  black: '#1A1A1A',
  gray900: '#2D2D2D',
  gray700: '#4A4A4A',
  gray500: '#767676',
  gray300: '#B8B8B8',
  gray100: '#E8E8E8',
  white: '#FFFFFF',

  // Status colors
  green: '#2D5F3F',
  greenLight: '#D4E8DC',

  // Semantic
  background: '#F2EBD9',
  surface: '#FFFFFF',
  border: '#E5DCCA',
  text: '#1A1A1A',
  textMuted: '#767676',
} as const;

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
} as const;

export const typography = {
  fontFamily: {
    sans: 'var(--font-geist-sans)',
    mono: 'var(--font-geist-mono)',
  },
  fontSize: {
    xs: '0.6875rem', // 11px
    sm: '0.875rem',  // 14px
    base: '1rem',    // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem', // 24px
  },
} as const;
