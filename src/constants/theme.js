export const colors = {
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
  successMuted: 'rgba(62,213,152,0.12)',
  warning: '#F5B94D',
  warningMuted: 'rgba(245,185,77,0.12)',
  danger: '#F0616B',
  dangerMuted: 'rgba(240,97,107,0.12)',
};
 
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
export const radius = { sm: 8, md: 12, lg: 16, xl: 24, full: 999 };
 
export const typography = {
  h1: { fontSize: 28, fontWeight: '700', color: colors.textPrimary },
  h2: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  h3: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },
  body: { fontSize: 15, fontWeight: '400', color: colors.textPrimary },
  bodySecondary: { fontSize: 14, fontWeight: '400', color: colors.textSecondary },
  caption: { fontSize: 12, fontWeight: '500', color: colors.textMuted },
};