export interface ThemeTokens {
  gold: string;
  goldDim: string;
  green: string;
  greenBright: string;
  red: string;
  redBright: string;
  dark0: string;
  dark1: string;
  dark2: string;
  dark3: string;
  dark4: string;
  dark5: string;
  silver: string;
  text: string;
  dim: string;
  dimmer: string;
  titleFont: string;
  uiFont: string;
  monoFont: string;
}

export const tokens: ThemeTokens = {
  gold: '#e8c84a',
  goldDim: '#a8902a',
  green: '#3d9140',
  greenBright: '#5cbf60',
  red: '#b02020',
  redBright: '#d44040',
  dark0: '#000000',
  dark1: '#080808',
  dark2: '#0f0f0f',
  dark3: '#161616',
  dark4: '#202020',
  dark5: '#2a2a2a',
  silver: '#a0a0a0',
  text: '#eeeeee',
  dim: '#666666',
  dimmer: '#333333',
  titleFont: "'Bebas Neue', Impact, condensed, sans-serif",
  uiFont: "'Oswald', 'Arial Narrow', sans-serif",
  monoFont: "'Share Tech Mono', 'Courier New', monospace",
};

export const shadowOwnerTheme: ThemeTokens = { ...tokens };

export const builtInThemes: Record<string, ThemeTokens> = {
  'shadow-owner': shadowOwnerTheme,
  cyberpunk: {
    ...tokens,
    gold: '#00f0ff',
    goldDim: '#008899',
    greenBright: '#00ff88',
    redBright: '#ff0066',
  },
  luxury: {
    ...tokens,
    gold: '#d4af37',
    goldDim: '#9a7b2a',
    greenBright: '#8fbc8f',
  },
  corporate: {
    ...tokens,
    gold: '#4a90d9',
    goldDim: '#2a5a8a',
    greenBright: '#4caf50',
  },
  minimal: {
    ...tokens,
    gold: '#ffffff',
    goldDim: '#cccccc',
    greenBright: '#aaaaaa',
    redBright: '#888888',
  },
};
