// Theme constants for the ReelsVault app
export const COLORS = {
  // Primary palette
  primary: '#6C5CE7',
  primaryLight: '#A29BFE',
  primaryDark: '#5A4BD1',
  
  // Secondary palette
  secondary: '#00CEC9',
  secondaryLight: '#55EFC4',
  
  // Accent
  accent: '#FD79A8',
  accentLight: '#FDCB6E',
  
  // Neutrals
  white: '#FFFFFF',
  offWhite: '#F8F9FA',
  lightGray: '#E9ECEF',
  gray: '#ADB5BD',
  darkGray: '#495057',
  charcoal: '#2D3436',
  dark: '#1A1A2E',
  darker: '#16162A',
  darkest: '#0F0F1E',
  black: '#000000',
  
  // Functional
  success: '#00B894',
  warning: '#FDCB6E',
  error: '#FF7675',
  info: '#74B9FF',
  
  // Gradients (as arrays for LinearGradient)
  gradientPrimary: ['#6C5CE7', '#A29BFE'],
  gradientDark: ['#1A1A2E', '#16162A', '#0F0F1E'],
  gradientAccent: ['#FD79A8', '#FDCB6E'],
  gradientCard: ['rgba(108, 92, 231, 0.1)', 'rgba(162, 155, 254, 0.05)'],
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
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

export const SHADOWS = {
  small: {
    boxShadow: '0px 2px 4px rgba(108, 92, 231, 0.1)',
    elevation: 2,
  },
  medium: {
    boxShadow: '0px 4px 8px rgba(108, 92, 231, 0.15)',
    elevation: 4,
  },
  large: {
    boxShadow: '0px 8px 16px rgba(108, 92, 231, 0.2)',
    elevation: 8,
  },
};
