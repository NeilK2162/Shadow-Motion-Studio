import type { ThemeTokens } from '@/themes/tokens';

export interface TemplateComponentProps {
  fields: Record<string, unknown>;
  theme?: ThemeTokens;
  globalSpeed?: number;
  stripCardBackground?: boolean;
}

export function getField<T>(fields: Record<string, unknown>, key: string, fallback: T): T {
  const value = fields[key];
  return (value === undefined ? fallback : value) as T;
}

export function themeVars(theme: ThemeTokens): React.CSSProperties {
  return {
    ['--gold' as string]: theme.gold,
    ['--gold-dim' as string]: theme.goldDim,
    ['--green-bright' as string]: theme.greenBright,
    ['--red-bright' as string]: theme.redBright,
    ['--dark0' as string]: theme.dark0,
    ['--dark2' as string]: theme.dark2,
    ['--dark4' as string]: theme.dark4,
    ['--dark5' as string]: theme.dark5,
    ['--dim' as string]: theme.dim,
    ['--title' as string]: theme.titleFont,
    ['--ui' as string]: theme.uiFont,
    ['--mono' as string]: theme.monoFont,
  };
}
