import type { FontToken } from '@/director/templateSchema';
import type { ThemeTokens } from '@/themes/tokens';

export function resolveFont(token: FontToken | undefined, theme: ThemeTokens): string {
  switch (token) {
    case 'title':
      return theme.titleFont;
    case 'ui':
      return theme.uiFont;
    case 'mono':
    default:
      return theme.monoFont;
  }
}
