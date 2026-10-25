import { Platform } from 'react-native';

export const Colors = {
  light: {
    background: '#F8FAFC',
    backgroundElement: '#F1F5F9',
    backgroundSelected: '#E2E8F0',
    card: '#FFFFFF',
    cardBorder: '#E2E8F0',
    text: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    primary: '#6366F1',
    primaryLight: '#EEF2FF',
    income: '#10B981',
    incomeLight: '#ECFDF5',
    incomeText: '#065F46',
    expense: '#F43F5E',
    expenseLight: '#FFF1F2',
    expenseText: '#9F1239',
    accent: '#8B5CF6',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E2E8F0',
    inputBg: '#F1F5F9',
  },
  dark: {
    background: '#090D16',
    backgroundElement: '#131B2E',
    backgroundSelected: '#1E293B',
    card: '#131B2E',
    cardBorder: '#1E293B',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    primary: '#818CF8',
    primaryLight: '#1E1B4B',
    income: '#34D399',
    incomeLight: '#064E3B',
    incomeText: '#A7F3D0',
    expense: '#FB7185',
    expenseLight: '#4C0519',
    expenseText: '#FECDD3',
    accent: '#A78BFA',
    warning: '#FBBF24',
    warningLight: '#451A03',
    tabBar: '#0B1120',
    tabBarBorder: '#1E293B',
    inputBg: '#1A2338',
  },
} as const;

export type ThemeColors = typeof Colors.light;
export type ThemeColor = keyof typeof Colors.light;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
  seven: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    rounded: 'system-ui, -apple-system, sans-serif',
    mono: 'monospace',
  },
});

export const MaxContentWidth = 720;
