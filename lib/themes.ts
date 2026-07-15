// lib/themes.ts
import type { ShopTheme, ThemeTokens } from '@/types';
import { CATEGORIES } from '@/types';

export { CATEGORIES as categories };

// Palettes bento : couleurs fortes et variées par thème, pensées pour contraster
// fort avec le texte (blanc ou noir selon le cas) — pas de nuance pastel molle.
export const themes: Record<ShopTheme, ThemeTokens> = {
  minimal: {
    bg: '#FAFAF8',
    surface: 'rgba(255,255,255,0.70)',
    border: 'rgba(28,25,23,0.10)',
    accent: '#FF6B35',
    text: '#1C1917',
    textMuted: '#78716C',
    bentoPalette: ['#1C1917', '#FF6B35', '#FAFAF8', '#E7E4DD'],
    gradient: 'linear-gradient(135deg, #FAFAF8 0%, #F0EEE9 45%, #E9E4DC 100%)',
    glow: 'rgba(255,107,53,0.35)',
  },
  luxury: {
    bg: '#0C0A09',
    surface: '#1A1614',
    border: '#2C2420',
    accent: '#C9A96E',
    text: '#FAFAF8',
    textMuted: '#9C8F89',
    bentoPalette: ['#0C0A09', '#C9A96E', '#2C2420', '#3D2E1F'],
    gradient: 'linear-gradient(135deg, #0C0A09 0%, #1A1310 55%, #2A1D12 100%)',
    glow: 'rgba(201,169,110,0.45)',
  },
  beauty: {
    bg: '#FEF6F0',
    surface: 'rgba(254,240,250,0.75)',
    border: 'rgba(214,51,132,0.20)',
    accent: '#D63384',
    text: '#1F0F18',
    textMuted: '#9D5680',
    bentoPalette: ['#D63384', '#1F0F18', '#FFB3D1', '#FEF6F0'],
    gradient: 'linear-gradient(135deg, #FFE3F1 0%, #FCD5E8 45%, #F6B8D8 100%)',
    glow: 'rgba(214,51,132,0.40)',
  },
  tech: {
    bg: '#0A0E14',
    surface: '#141922',
    border: '#232B38',
    accent: '#3B82F6',
    text: '#F5F7FA',
    textMuted: '#8B95A5',
    bentoPalette: ['#0A0E14', '#3B82F6', '#7C3AED', '#141922'],
    gradient: 'linear-gradient(135deg, #0A0E14 0%, #0E1420 50%, #101a2e 100%)',
    glow: 'rgba(59,130,246,0.45)',
  },
  food: {
    bg: '#F7FAF3',
    surface: 'rgba(255,255,255,0.75)',
    border: 'rgba(74,124,44,0.20)',
    accent: '#4A7C2C',
    text: '#1A1F14',
    textMuted: '#6B7A5E',
    bentoPalette: ['#4A7C2C', '#E8B23D', '#1A1F14', '#F7FAF3'],
    gradient: 'linear-gradient(135deg, #F7FAF3 0%, #EAF2DE 50%, #DCEBC9 100%)',
    glow: 'rgba(74,124,44,0.35)',
  },
  fashion: {
    bg: '#FAFAF8',
    surface: 'rgba(255,255,255,0.70)',
    border: 'rgba(201,169,110,0.25)',
    accent: '#C9A96E',
    text: '#1C1917',
    textMuted: '#78716C',
    bentoPalette: ['#1C1917', '#C9A96E', '#FAFAF8', '#D8CFC2'],
    gradient: 'linear-gradient(135deg, #FAFAF8 0%, #F1EBE1 50%, #E5D9C6 100%)',
    glow: 'rgba(201,169,110,0.35)',
  },
};

export function getTheme(theme: ShopTheme, accentColor?: string | null): ThemeTokens {
  const base = themes[theme] ?? themes.minimal;
  return accentColor ? { ...base, accent: accentColor } : base;
}