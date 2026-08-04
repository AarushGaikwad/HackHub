export const PALETTES = {
  dark: {
    bg: '#0B0E14',
    bgElevated: '#12151C',
    surface: '#171B24',
    surfaceHover: '#1E2330',
    border: '#242A38',
    borderLight: '#2E3546',

    textPrimary: '#F5F6F8',
    textSecondary: '#9AA3B5',
    textMuted: '#6B7387',

    primary: '#5B8CFF',
    primaryHover: '#4A78F0',
    primaryMuted: 'rgba(91,140,255,0.12)',

    success: '#3ED598',
    warning: '#F5B94D',
    danger: '#F0616B',
  },

  light: {
    bg: '#FFFFFF',
    bgElevated: '#F7F7F7',
    surface: '#FFFFFF',
    surfaceHover: '#F3F3F3',
    border: '#DDDDDD',
    borderLight: '#EEEEEE',

    textPrimary: '#111111',
    textSecondary: '#555555',
    textMuted: '#888888',

    primary: '#2563EB',
    primaryHover: '#1D4ED8',
    primaryMuted: 'rgba(37,99,235,0.12)',

    success: '#16A34A',
    warning: '#D97706',
    danger: '#DC2626',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const buildTypography = (colors) => ({
  h1: { fontSize: 28, fontWeight: '700', color: colors.textPrimary },
  h2: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  h3: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },
  body: { fontSize: 15, color: colors.textPrimary },
  bodySecondary: { fontSize: 14, color: colors.textSecondary },
  caption: { fontSize: 12, color: colors.textMuted },
});


export const colors = PALETTES.dark;
export const typography = buildTypography(colors);