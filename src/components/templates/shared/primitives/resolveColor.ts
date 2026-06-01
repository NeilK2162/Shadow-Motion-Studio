import type { ColorToken, ColorValue } from '@/director/templateSchema';
import type { ThemeTokens } from '@/themes/tokens';

const TOKEN_KEYS: ColorToken[] = [
  'gold',
  'silver',
  'dim',
  'dark1',
  'dark2',
  'dark3',
  'dark4',
  'dark5',
  'green',
  'red',
  'blue',
  'purple',
];

export function isColorToken(value: string): value is ColorToken {
  return (TOKEN_KEYS as string[]).includes(value);
}

const TOKEN_TO_THEME: Record<ColorToken, keyof ThemeTokens | 'literal'> = {
  gold: 'gold',
  silver: 'silver',
  dim: 'dim',
  dark1: 'dark1',
  dark2: 'dark2',
  dark3: 'dark3',
  dark4: 'dark4',
  dark5: 'dark5',
  green: 'greenBright',
  red: 'redBright',
  blue: 'greenBright',
  purple: 'goldDim',
};

export function resolveColor(value: ColorValue | undefined, theme: ThemeTokens, fallback = theme.silver): string {
  if (!value) return fallback;
  if (isColorToken(value)) {
    const key = TOKEN_TO_THEME[value];
    return theme[key as keyof ThemeTokens] ?? fallback;
  }
  return value;
}
