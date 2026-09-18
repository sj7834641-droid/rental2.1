export const Colors = {
  primary: '#E11D48', // Vibrant Indian Rental Red (Rentelo / Bounce style)
  primaryDark: '#BE123C',
  primaryLight: '#FFE4E6',
  primaryMuted: '#FFF1F2',

  secondary: '#0F172A', // Deep Slate / Obsidian
  secondaryLight: '#1E293B',
  
  accent: '#F59E0B', // Amber / Gold rating
  accentLight: '#FEF3C7',

  success: '#10B981', // Emerald confirmation
  successLight: '#D1FAE5',
  successDark: '#047857',

  warning: '#F97316',
  warningLight: '#FFEDD5',

  danger: '#EF4444',
  dangerLight: '#FEE2E2',

  background: '#F8FAFC',
  card: '#FFFFFF',
  cardHover: '#F1F5F9',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  tint: '#E11D48',
  tabIconDefault: '#94A3B8',
  tabIconSelected: '#E11D48',
};

export default {
  light: {
    text: Colors.text,
    background: Colors.background,
    tint: Colors.primary,
    tabIconDefault: Colors.tabIconDefault,
    tabIconSelected: Colors.primary,
  },
  dark: {
    text: '#F8FAFC',
    background: '#0F172A',
    tint: Colors.primary,
    tabIconDefault: '#64748B',
    tabIconSelected: '#FB7185',
  },
};
