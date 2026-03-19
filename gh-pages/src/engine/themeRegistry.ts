export interface ThemeDefaults {
  colors: {
    name: string;
    [key: string]: any;
  };
  typography: {
    font_family: string;
    [key: string]: any;
  };
  options: {
    [key: string]: any;
  };
}

export interface DesignTheme {
  theme: string;
  colors?: Partial<ThemeDefaults['colors']>;
  typography?: Partial<ThemeDefaults['typography']>;
  options?: Partial<ThemeDefaults['options']>;
}

export const themes: Record<string, ThemeDefaults> = {
  classic: {
    colors: { name: 'rgb(0, 79, 144)' },
    typography: { font_family: 'Source Sans 3' },
    options: {}
  },
  engineeringresumes: {
    colors: { name: '#000000' },
    typography: { font_family: 'Latin Modern Roman' },
    options: {}
  },
  sb2nov: {
    colors: { name: '#000000' },
    typography: { font_family: 'Source Sans 3' },
    options: {}
  },
  moderncv: {
    colors: { name: '#3873b3' },
    typography: { font_family: 'Fira Sans' },
    options: {}
  },
  mart: {
    colors: { name: '#8B5A2B' },
    typography: { font_family: 'Roboto' },
    options: {}
  }
};

export function getThemeDefaults(themeName: string): ThemeDefaults {
  return themes[themeName] || themes['classic'];
}
