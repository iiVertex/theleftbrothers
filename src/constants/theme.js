export const COLORS = {
  // Light theme surfaces
  bg1: '#F5F0E8',
  bg2: '#EFE7DA',
  bg3: '#E7DDCF',

  // Text
  text1: '#111111',
  text2: '#1A1A1A',
  text3: '#2A2A2A',
  subText: '#6B6560',
  subTextLight: '#9A9088',

  // Borders
  border: '#D8CCBC',
  borderLight: '#E8E0D4',

  // Accent (matte black family)
  accent: '#1A1A1A',
  accentWarm: '#3A312B',

  // Functional
  white: '#FFFFFF',
  offWhite: '#FAF7F2',
  black: '#000000',
  error: '#C0392B',
  success: '#27AE60',

  // Dark mode surfaces (warm dark)
  darkBg: '#0F0E0C',
  darkCard: '#1C1A16',
  darkBorder: '#2A2520',
  darkSubText: '#9A8F82',

  // Keep for backward compat (used in video player which stays dark)
  primary: '#1A1A1A',
  primaryLight: '#3A312B',
  primaryDark: '#0A0A0A',
  gray: '#6B6560',
  dark: '#111111',
  darker: '#0A0A08',
  darkest: '#0F0E0C',
};

export const FONTS = {
  // Geometric sans (Montserrat) — body, UI, tracked-out section headers
  regular: 'Montserrat_400Regular',
  medium: 'Montserrat_500Medium',
  semiBold: 'Montserrat_600SemiBold',
  bold: 'Montserrat_700Bold',
  extraBold: 'Montserrat_800ExtraBold',

  // High-contrast serif (Bodoni Moda, a Didone) — user's name + hero titles
  serif: 'BodoniModa_400Regular',
  serifSemiBold: 'BodoniModa_600SemiBold',
  serifBold: 'BodoniModa_700Bold',
  serifBlack: 'BodoniModa_900Black',

  // letterSpacing presets for tracked-out all-caps sans
  tracking: {
    tight: 1,
    wide: 1.5,
    hero: 2,
  },

  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
    xxxl: 28,
    title: 34,
    hero: 42,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

// Uses the CSS-style `boxShadow` shorthand (supported on RN 0.76+ / new arch
// and react-native-web) instead of the deprecated shadow* / elevation props.
// Format: 'offsetX offsetY blur color'.
export const SHADOWS = {
  small: { boxShadow: '0px 1px 4px rgba(58,49,43,0.06)' },
  medium: { boxShadow: '0px 2px 8px rgba(58,49,43,0.08)' },
  large: { boxShadow: '0px 4px 16px rgba(58,49,43,0.10)' },
};
